import type {
  CookingAppliance,
  FoodItem,
  LocaleCode,
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
  dietaryNotes?: string;
  appliances: CookingAppliance[];
  priorityFoods: RecipeFoodInput[];
  availableFoods: RecipeFoodInput[];
}

interface BuildRecipeOptions {
  locale: LocaleCode;
  cuisine: RecipeCuisinePreference;
  servings: number;
  maxMinutes: number;
  dietaryNotes: string;
  appliances: CookingAppliance[];
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
  priorityFoods: FoodItem[],
  availableFoods: FoodItem[],
  options: BuildRecipeOptions
): RecipeRequest {
  const priority = priorityFoods.filter(isRecipeEligible).slice(0, 3);
  const priorityIds = new Set(priority.map((food) => food.id));
  const supporting = availableFoods
    .filter((food) => isRecipeEligible(food) && !priorityIds.has(food.id))
    .slice(0, 5);

  return {
    locale: options.locale,
    cuisine: options.cuisine,
    servings: options.servings,
    maxMinutes: options.maxMinutes,
    dietaryNotes: options.dietaryNotes.trim().slice(0, 240) || undefined,
    appliances: options.appliances,
    priorityFoods: priority.map(toRecipeFood),
    availableFoods: supporting.map(toRecipeFood)
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
