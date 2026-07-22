import type {
  CookingEquipment,
  FoodItem,
  LocaleCode,
  PantryPolicy,
  PantryStaple,
  RecipeAdjustmentKind,
  RecipeCookingGoal,
  RecipeCuisinePreference,
  RecipeHistoryEntry,
  RecipeIdea
} from "../types/food";
import { getPriority } from "./priority";

export type { RecipeIdea } from "../types/food";

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

export interface RecipeAdjustment {
  kind: RecipeAdjustmentKind;
  detail?: string;
}

const recipeCache = new Map<string, { expiresAt: number; recipes: RecipeIdea[] }>();
const RECIPE_CACHE_TTL_MS = 5 * 60_000;
const RECIPE_CACHE_LIMIT = 20;

export function createRecipeCacheKey(request: RecipeRequest): string {
  return JSON.stringify(request);
}

export function clearRecipeCache(): void {
  recipeCache.clear();
}

function rememberRecipeResult(key: string, recipes: RecipeIdea[]): void {
  if (recipeCache.size >= RECIPE_CACHE_LIMIT) {
    const oldestKey = recipeCache.keys().next().value as string | undefined;
    if (oldestKey) recipeCache.delete(oldestKey);
  }
  recipeCache.set(key, { expiresAt: Date.now() + RECIPE_CACHE_TTL_MS, recipes });
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
  signal?: AbortSignal,
  bypassCache = false
): Promise<RecipeIdea[]> {
  const cacheKey = createRecipeCacheKey(request);
  const cached = recipeCache.get(cacheKey);
  if (!bypassCache && cached && cached.expiresAt > Date.now()) {
    return cached.recipes;
  }
  if (cached) recipeCache.delete(cacheKey);
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
  const recipes = data.recipes ?? [];
  rememberRecipeResult(cacheKey, recipes);
  return recipes;
}

export async function generateRecipeReplacement(
  request: RecipeRequest,
  recipe: RecipeIdea,
  adjustment: RecipeAdjustment,
  otherRecipes: RecipeIdea[] = [],
  signal?: AbortSignal
): Promise<RecipeIdea> {
  const response = await fetch("/api/recipes/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request,
      recipe,
      otherRecipes: otherRecipes.slice(0, 1),
      adjustment: {
        kind: adjustment.kind,
        detail: adjustment.detail?.trim().slice(0, 80) || undefined
      }
    }),
    signal
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: string;
    recipe?: RecipeIdea;
  };
  if (!response.ok || !data.recipe) throw new Error(data.code ?? "RECIPE_REQUEST_FAILED");
  return data.recipe;
}

export function createRecipeHistoryEntry(
  request: RecipeRequest,
  recipes: RecipeIdea[],
  now = new Date()
): RecipeHistoryEntry {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `recipe-${now.getTime()}`,
    createdAt: now.toISOString(),
    locale: request.locale,
    cuisine: request.cuisine,
    servings: request.servings,
    maxMinutes: request.maxMinutes,
    cookingGoal: request.cookingGoal,
    recipes
  };
}
