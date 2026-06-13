import type { DateLabelType, FoodCategory } from "../types/food";

export const STORAGE_KEY = "eat-first:v1:state";
export const SCHEMA_VERSION = "1.0.0";
export const APP_ID = "eat-first";
export const FREE_ACTIVE_LIMIT = 10;
export const DEMO_PRO_CODE = "EATFIRST-DEMO-PRO";

export const DATE_LABEL_TYPES: DateLabelType[] = [
  "use_by",
  "best_before",
  "opened",
  "none"
];

export const FOOD_CATEGORIES: FoodCategory[] = [
  "meat",
  "fish",
  "dairy_eggs",
  "vegetable",
  "fruit",
  "salad",
  "leftovers",
  "ready_meal",
  "bakery",
  "drink",
  "condiment",
  "dry_goods",
  "frozen_food",
  "other"
];

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  meat: "🥩",
  fish: "🐟",
  dairy_eggs: "🥛",
  vegetable: "🥦",
  fruit: "🍎",
  salad: "🥗",
  leftovers: "🍱",
  ready_meal: "🍛",
  bakery: "🍞",
  drink: "🧃",
  condiment: "🧂",
  dry_goods: "🥫",
  frozen_food: "🧊",
  other: "🍽️"
};
