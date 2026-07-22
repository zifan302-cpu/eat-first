import type {
  CookingAppliance,
  DateLabelType,
  FoodCategory,
  FoodQuantityUnit,
  RecipeCuisinePreference
} from "../types/food";

export const STORAGE_KEY = "eat-first:v1:state";
export const SCHEMA_VERSION = "1.3.0";
export const APP_ID = "eat-first";

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

export const FOOD_QUANTITY_UNITS: FoodQuantityUnit[] = [
  "item",
  "portion",
  "pack",
  "bottle",
  "g",
  "kg",
  "ml",
  "l"
];

export const RECIPE_CUISINE_PREFERENCES: RecipeCuisinePreference[] = [
  "auto",
  "chinese_home",
  "global_everyday"
];

export const COOKING_APPLIANCES: CookingAppliance[] = [
  "oven",
  "microwave",
  "air_fryer",
  "rice_cooker"
];
