import type { FoodCategory, FoodItem, PriorityVerdict } from "../types/food";
import { daysFromToday } from "./dates";

export type CategoryCharacterState = "fresh" | "use_soon" | "expired";

const freshAssets = {
  meat: "/art/category-characters/meat.webp",
  fish: "/art/category-characters/fish.webp",
  dairy_eggs: "/art/category-characters/dairy_eggs.webp",
  vegetable: "/art/category-characters/vegetable.webp",
  fruit: "/art/category-characters/fruit.webp",
  salad: "/art/category-characters/salad.webp",
  leftovers: "/art/category-characters/leftovers.webp",
  ready_meal: "/art/category-characters/ready_meal.webp",
  bakery: "/art/category-characters/bakery.webp",
  drink: "/art/category-characters/drink.webp",
  condiment: "/art/category-characters/condiment.webp",
  dry_goods: "/art/category-characters/dry_goods.webp",
  frozen_food: "/art/category-characters/frozen_food.webp",
  other: "/art/category-characters/other.webp"
} satisfies Record<FoodCategory, string>;

function stateAssets(state: Exclude<CategoryCharacterState, "fresh">): Record<FoodCategory, string> {
  return Object.fromEntries(
    Object.keys(freshAssets).map((category) => [
      category,
      `/art/category-characters/${state}/${category}.webp`
    ])
  ) as Record<FoodCategory, string>;
}

export const CATEGORY_CHARACTER_ASSETS = {
  fresh: freshAssets,
  use_soon: stateAssets("use_soon"),
  expired: stateAssets("expired")
} satisfies Record<CategoryCharacterState, Record<FoodCategory, string>>;

export function categoryCharacterStateForVerdict(
  verdict: PriorityVerdict
): CategoryCharacterState {
  if (verdict === "expired_use_by" || verdict === "quality_check" || verdict === "opened_due") {
    return "expired";
  }
  if (verdict === "use_today" || verdict === "use_soon" || verdict === "opened_soon") {
    return "use_soon";
  }
  return "fresh";
}

export function categoryCharacterStateForFood(
  food: FoodItem,
  verdict: PriorityVerdict,
  today = new Date()
): CategoryCharacterState {
  if (verdict === "quality_check" && food.dateLabelType === "best_before") {
    const days = daysFromToday(food.labelDate, today);
    return typeof days === "number" && days < 0 ? "expired" : "use_soon";
  }
  return categoryCharacterStateForVerdict(verdict);
}
