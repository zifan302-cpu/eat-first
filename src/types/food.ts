export type LocaleCode = "zh-CN" | "en-GB";

export type RecipeCuisinePreference = "auto" | "chinese_home" | "global_everyday";

export type CookingAppliance = "oven" | "microwave" | "air_fryer" | "rice_cooker";

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
    appliances: Record<CookingAppliance, boolean>;
  };
}

export interface AppMeta {
  createdAt: string;
  updatedAt: string;
}

export interface AppStateEnvelope {
  schemaVersion: "1.3.0";
  appId: "eat-first";
  preferences: UserPreferences;
  foods: FoodItem[];
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
