import type {
  CookingEquipment,
  DateLabelType,
  FoodCategory,
  FoodQuantityUnit,
  PantryStaple,
  RecipeCuisinePreference
} from "../types/food";

export const STORAGE_KEY = "eat-first:v1:state";
export const SCHEMA_VERSION = "1.5.0";
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

export const COOKING_EQUIPMENT: CookingEquipment[] = [
  "hob",
  "oven",
  "microwave",
  "air_fryer",
  "electric_griddle",
  "outdoor_grill",
  "rice_cooker",
  "steamer",
  "pressure_cooker",
  "multicooker",
  "slow_cooker",
  "blender",
  "hand_blender",
  "food_processor",
  "toaster",
  "sandwich_press"
];

export const COOKING_EQUIPMENT_GROUPS: Record<
  "heat" | "pot" | "prep" | "light",
  CookingEquipment[]
> = {
  heat: ["hob", "oven", "microwave", "air_fryer", "electric_griddle", "outdoor_grill"],
  pot: ["rice_cooker", "steamer", "pressure_cooker", "multicooker", "slow_cooker"],
  prep: ["blender", "hand_blender", "food_processor"],
  light: ["toaster", "sandwich_press"]
};

export const PANTRY_STAPLES: PantryStaple[] = [
  "cooking_oil",
  "salt",
  "sugar",
  "soy_sauce",
  "vinegar",
  "black_pepper",
  "flour",
  "starch",
  "butter"
];
