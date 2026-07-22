export type LocaleCode = "zh-CN" | "en-GB";

export type RecipeCuisinePreference = "auto" | "chinese_home" | "global_everyday";

export type RecipeCookingGoal =
  | "auto"
  | "fast"
  | "rescue_more"
  | "one_pan"
  | "lunchbox"
  | "batch_cook"
  | "no_cook";

export type CookingEquipment =
  | "hob"
  | "oven"
  | "microwave"
  | "air_fryer"
  | "electric_griddle"
  | "outdoor_grill"
  | "rice_cooker"
  | "steamer"
  | "pressure_cooker"
  | "multicooker"
  | "slow_cooker"
  | "blender"
  | "hand_blender"
  | "food_processor"
  | "toaster"
  | "sandwich_press";

export type PantryPolicy = "strict" | "everyday" | "flexible";

export type RecipeDifferenceTag =
  | "fastest"
  | "uses_more"
  | "one_pan"
  | "lunchbox"
  | "batch_friendly"
  | "no_cook";

export type RecipeAdjustmentKind =
  | "shorter"
  | "one_pan"
  | "lunchbox"
  | "different_method"
  | "remove_ingredient"
  | "missing_pantry";

export type PantryStaple =
  | "cooking_oil"
  | "salt"
  | "sugar"
  | "soy_sauce"
  | "vinegar"
  | "black_pepper"
  | "flour"
  | "starch"
  | "butter";

export type DateLabelType = "use_by" | "best_before" | "opened" | "none";

export type FoodStatus = "active" | "eaten" | "frozen" | "discarded";

export type FoodQuantityUnit =
  | "item"
  | "portion"
  | "pack"
  | "bottle"
  | "g"
  | "kg"
  | "ml"
  | "l";

export type FoodCategory =
  | "meat"
  | "fish"
  | "dairy_eggs"
  | "vegetable"
  | "fruit"
  | "salad"
  | "leftovers"
  | "ready_meal"
  | "bakery"
  | "drink"
  | "condiment"
  | "dry_goods"
  | "frozen_food"
  | "other";

export type FoodSource = "manual" | "barcode" | "batch_add" | "import";

export type FoodActionType =
  | "created"
  | "updated"
  | "partially_used"
  | "eaten"
  | "frozen"
  | "discarded"
  | "snoozed"
  | "restored";

export interface FoodActionRecord {
  id: string;
  type: FoodActionType;
  at: string;
  note?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  normalizedName: string;
  category: FoodCategory;
  dateLabelType: DateLabelType;
  labelDate?: string;
  openedShelfLifeDays?: number;
  quantityAmount?: number;
  quantityUnit?: FoodQuantityUnit;
  quantityText?: string;
  barcode?: string;
  note?: string;
  status: FoodStatus;
  source: FoodSource;
  snoozedUntil?: string;
  frozenAt?: string;
  consumedAt?: string;
  discardedAt?: string;
  createdAt: string;
  updatedAt: string;
  actionHistory: FoodActionRecord[];
}

export interface RecipeFoodUse {
  foodId: string;
  estimatedAmount?: number;
  estimatedUnit?: FoodQuantityUnit;
}

export interface RecipeIdea {
  title: string;
  summary: string;
  whyThisOption: string;
  totalMinutes: number;
  differenceTags: RecipeDifferenceTag[];
  ingredients: string[];
  steps: string[];
  equipment: string[];
  missingIngredients: string[];
  usesFoods: RecipeFoodUse[];
}

export interface RecipeHistoryEntry {
  id: string;
  createdAt: string;
  locale: LocaleCode;
  cuisine: RecipeCuisinePreference;
  servings: number;
  maxMinutes: number;
  cookingGoal: RecipeCookingGoal;
  recipes: RecipeIdea[];
}

export interface UserPreferences {
  locale: LocaleCode;
  topN: number;
  showSafetyBanner: boolean;
  hasSeenOnboarding: boolean;
  recipe: {
    cuisine: RecipeCuisinePreference;
    defaultServings: 1 | 2 | 3 | 4;
    defaultMaxMinutes: 15 | 30 | 45 | 60;
    dietaryNotes: string;
    equipment: Record<CookingEquipment, boolean>;
    customEquipment: string[];
    pantryPolicy: PantryPolicy;
    pantryStaples: Record<PantryStaple, boolean>;
    customPantryStaples: string[];
  };
}

export interface AppMeta {
  createdAt: string;
  updatedAt: string;
}

export interface AppStateEnvelope {
  schemaVersion: "1.5.0";
  appId: "eat-first";
  preferences: UserPreferences;
  foods: FoodItem[];
  recipeHistory: RecipeHistoryEntry[];
  meta: AppMeta;
}

export type PriorityVerdict =
  | "expired_use_by"
  | "use_today"
  | "use_soon"
  | "quality_check"
  | "opened_due"
  | "opened_soon"
  | "normal"
  | "no_date";

export type PrimaryCta = "eat" | "freeze" | "check" | "discard" | "later";

export interface PriorityResult {
  score: number;
  verdict: PriorityVerdict;
  primaryCta: PrimaryCta;
  secondaryCtas: PrimaryCta[];
  explanationKey: string;
}
