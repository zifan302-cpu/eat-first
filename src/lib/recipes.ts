import type {
  CookingEquipment,
  FoodItem,
  LocaleCode,
  PantryPolicy,
  PantryStaple,
  RecipeCookingGoal,
  RecipeCuisinePreference
} from "../types/food";
import { getPriority } from "./priority";

export interface RecipeIdea {
  title: string;
  summary: string;
  totalMinutes: number;
  ingredients: string[];
  steps: string[];
  usesFoodIds: string[];
}

export interface RecipeFoodInput {
  id: string;
  name: string;
  quantityText?: string;
  dateLabelType: FoodItem["dateLabelType"];
  labelDate?: string;
  urgency: ReturnType<typeof getPriority>["verdict"];
}

export interface RecipeRequest {
  locale: LocaleCode;
  cuisine: RecipeCuisinePreference;
  servings: number;
  maxMinutes: number;
  cookingGoal: RecipeCookingGoal;
  dietaryNotes?: string;
  equipment: CookingEquipment[];
  customEquipment: string[];
  pantryPolicy: PantryPolicy;
  pantryStaples: PantryStaple[];
  customPantryStaples: string[];
  suggestedFoods: RecipeFoodInput[];
  requiredFoods: RecipeFoodInput[];
  availableFoods: RecipeFoodInput[];
  excludedFoodIds: string[];
}

interface BuildRecipeOptions {
  locale: LocaleCode;
  cuisine: RecipeCuisinePreference;
  servings: number;
  maxMinutes: number;
  cookingGoal: RecipeCookingGoal;
  dietaryNotes: string;
  equipment: CookingEquipment[];
  customEquipment: string[];
  pantryPolicy: PantryPolicy;
  pantryStaples: PantryStaple[];
  customPantryStaples: string[];
}

interface RecipeFoodRoles {
  suggestedFoods: FoodItem[];
  requiredFoods: FoodItem[];
  availableFoods: FoodItem[];
  excludedFoodIds: string[];
}

export function isRecipeEligible(food: FoodItem): boolean {
  return food.status === "active" && getPriority(food).verdict !== "expired_use_by";
}

function toRecipeFood(food: FoodItem): RecipeFoodInput {
  return {
    id: food.id,
    name: food.name,
    quantityText: food.quantityText,
    dateLabelType: food.dateLabelType,
    labelDate: food.labelDate,
    urgency: getPriority(food).verdict
  };
}

export function buildRecipeRequest(
  roles: RecipeFoodRoles,
  options: BuildRecipeOptions
): RecipeRequest {
  const excludedIds = new Set(roles.excludedFoodIds);
  const required = roles.requiredFoods
    .filter((food) => isRecipeEligible(food) && !excludedIds.has(food.id))
    .slice(0, 3);
  const requiredIds = new Set(required.map((food) => food.id));
  const suggested = roles.suggestedFoods
    .filter((food) =>
      isRecipeEligible(food) && !excludedIds.has(food.id) && !requiredIds.has(food.id)
    )
    .slice(0, 3);
  const reservedIds = new Set([...requiredIds, ...suggested.map((food) => food.id)]);
  const available = roles.availableFoods
    .filter((food) =>
      isRecipeEligible(food) && !excludedIds.has(food.id) && !reservedIds.has(food.id)
    )
    .slice(0, 15);

  return {
    locale: options.locale,
    cuisine: options.cuisine,
    servings: options.servings,
    maxMinutes: options.maxMinutes,
    cookingGoal: options.cookingGoal,
    dietaryNotes: options.dietaryNotes.trim().slice(0, 240) || undefined,
    equipment: options.equipment,
    customEquipment: options.customEquipment.slice(0, 8),
    pantryPolicy: options.pantryPolicy,
    pantryStaples: options.pantryStaples,
    customPantryStaples: options.customPantryStaples.slice(0, 12),
    suggestedFoods: suggested.map(toRecipeFood),
    requiredFoods: required.map(toRecipeFood),
    availableFoods: available.map(toRecipeFood),
    excludedFoodIds: [...excludedIds].slice(0, 100)
  };
}

export async function generateRecipeIdeas(
  request: RecipeRequest,
  signal?: AbortSignal
): Promise<RecipeIdea[]> {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: string;
    recipes?: RecipeIdea[];
  };
  if (!response.ok) throw new Error(data.code ?? "RECIPE_REQUEST_FAILED");
  return data.recipes ?? [];
}
