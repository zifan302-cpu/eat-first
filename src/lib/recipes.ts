import type { FoodItem, LocaleCode } from "../types/food";
import { getPriority } from "./priority";

export interface RecipeIdea {
  title: string;
  summary: string;
  totalMinutes: number;
  ingredients: string[];
  steps: string[];
  usesFoodIds: string[];
}

export interface RecipeRequest {
  locale: LocaleCode;
  servings: number;
  maxMinutes: number;
  dietaryNotes?: string;
  foods: Array<{
    id: string;
    name: string;
    quantityText?: string;
    dateLabelType: FoodItem["dateLabelType"];
    labelDate?: string;
    urgency: ReturnType<typeof getPriority>["verdict"];
  }>;
}

export function isRecipeEligible(food: FoodItem): boolean {
  return food.status === "active" && getPriority(food).verdict !== "expired_use_by";
}

export function buildRecipeRequest(
  foods: FoodItem[],
  locale: LocaleCode,
  servings: number,
  maxMinutes: number,
  dietaryNotes: string
): RecipeRequest {
  return {
    locale,
    servings,
    maxMinutes,
    dietaryNotes: dietaryNotes.trim().slice(0, 240) || undefined,
    foods: foods.filter(isRecipeEligible).slice(0, 8).map((food) => ({
      id: food.id,
      name: food.name,
      quantityText: food.quantityText,
      dateLabelType: food.dateLabelType,
      labelDate: food.labelDate,
      urgency: getPriority(food).verdict
    }))
  };
}

export async function generateRecipeIdeas(request: RecipeRequest): Promise<RecipeIdea[]> {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  const data = (await response.json().catch(() => ({}))) as {
    code?: string;
    recipes?: RecipeIdea[];
  };
  if (!response.ok) throw new Error(data.code ?? "RECIPE_REQUEST_FAILED");
  return data.recipes ?? [];
}
