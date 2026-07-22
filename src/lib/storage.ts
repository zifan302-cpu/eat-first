import type {
  AppStateEnvelope,
  FoodItem,
  LocaleCode,
  RecipeCuisinePreference,
  UserPreferences
} from "../types/food";
import { APP_ID, SCHEMA_VERSION, STORAGE_KEY } from "./constants";
import { isoNow } from "./dates";
import { parseQuantityText } from "./quantity";

function detectLocale(): LocaleCode {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh-CN";
  }
  return "en-GB";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isImportableState(input: unknown): boolean {
  return (
    isObject(input) &&
    input.appId === APP_ID &&
    (input.schemaVersion === SCHEMA_VERSION ||
      input.schemaVersion === "1.2.0" ||
      input.schemaVersion === "1.1.0" ||
      input.schemaVersion === "1.0.0") &&
    Array.isArray(input.foods)
  );
}

const recipeServings = [1, 2, 3, 4] as const;
const recipeMinutes = [15, 30, 45, 60] as const;
const cuisinePreferences: RecipeCuisinePreference[] = ["auto", "chinese_home", "global_everyday"];

function defaultRecipePreferences(): UserPreferences["recipe"] {
  return {
    cuisine: "auto",
    defaultServings: 1,
    defaultMaxMinutes: 30,
    dietaryNotes: "",
    appliances: {
      oven: false,
      microwave: false,
      air_fryer: false,
      rice_cooker: false
    }
  };
}

function normalizeRecipePreferences(input: unknown): UserPreferences["recipe"] {
  const defaults = defaultRecipePreferences();
  if (!isObject(input)) return defaults;
  const appliances = isObject(input.appliances) ? input.appliances : {};

  return {
    cuisine: cuisinePreferences.includes(input.cuisine as RecipeCuisinePreference)
      ? (input.cuisine as RecipeCuisinePreference)
      : defaults.cuisine,
    defaultServings: recipeServings.includes(input.defaultServings as 1 | 2 | 3 | 4)
      ? (input.defaultServings as 1 | 2 | 3 | 4)
      : defaults.defaultServings,
    defaultMaxMinutes: recipeMinutes.includes(input.defaultMaxMinutes as 15 | 30 | 45 | 60)
      ? (input.defaultMaxMinutes as 15 | 30 | 45 | 60)
      : defaults.defaultMaxMinutes,
    dietaryNotes:
      typeof input.dietaryNotes === "string" ? input.dietaryNotes.trim().slice(0, 240) : "",
    appliances: {
      oven: appliances.oven === true,
      microwave: appliances.microwave === true,
      air_fryer: appliances.air_fryer === true,
      rice_cooker: appliances.rice_cooker === true
    }
  };
}

function normalizeFoods(input: unknown): FoodItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((item) => {
    const valid =
      isObject(item) &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.normalizedName === "string" &&
      (item.status === "active" ||
        item.status === "eaten" ||
        item.status === "frozen" ||
        item.status === "discarded");

    if (!valid) {
      return [];
    }

    const source =
      item.source === "manual" ||
      item.source === "barcode" ||
      item.source === "batch_add" ||
      item.source === "import"
        ? item.source
        : "import";

    const parsedQuantity = parseQuantityText(
      typeof item.quantityText === "string" ? item.quantityText : undefined
    );
    const quantityAmount =
      typeof item.quantityAmount === "number" && item.quantityAmount > 0
        ? item.quantityAmount
        : parsedQuantity.amount;
    const quantityUnit =
      typeof item.quantityUnit === "string"
        ? (item.quantityUnit as FoodItem["quantityUnit"])
        : parsedQuantity.unit;

    return [{ ...item, source, quantityAmount, quantityUnit } as FoodItem];
  });
}

export function createDefaultState(now = new Date()): AppStateEnvelope {
  const at = isoNow(now);
  return {
    schemaVersion: SCHEMA_VERSION,
    appId: APP_ID,
    preferences: {
      locale: detectLocale(),
      topN: 3,
      showSafetyBanner: true,
      hasSeenOnboarding: false,
      recipe: defaultRecipePreferences()
    },
    foods: [],
    meta: {
      createdAt: at,
      updatedAt: at
    }
  };
}

export function migrateState(input: unknown): AppStateEnvelope {
  if (!isObject(input)) {
    return createDefaultState();
  }

  if (!isImportableState(input)) {
    return createDefaultState();
  }

  const base = createDefaultState();
  const preferences = isObject(input.preferences) ? input.preferences : {};
  const meta = isObject(input.meta) ? input.meta : {};
  const foods = normalizeFoods(input.foods);
  return {
    schemaVersion: SCHEMA_VERSION,
    appId: APP_ID,
    preferences: {
      locale: preferences.locale === "zh-CN" || preferences.locale === "en-GB" ? preferences.locale : base.preferences.locale,
      topN: typeof preferences.topN === "number" ? preferences.topN : 3,
      showSafetyBanner: preferences.showSafetyBanner !== false,
      hasSeenOnboarding: preferences.hasSeenOnboarding === true,
      recipe: normalizeRecipePreferences(preferences.recipe)
    },
    foods,
    meta: {
      createdAt: typeof meta.createdAt === "string" ? meta.createdAt : base.meta.createdAt,
      updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : base.meta.updatedAt
    }
  };
}

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadState(): AppStateEnvelope {
  if (!hasLocalStorage()) {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultState();
      saveState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as unknown;
    return migrateState(parsed);
  } catch {
    const initial = createDefaultState();
    saveState(initial);
    return initial;
  }
}

export function saveState(state: AppStateEnvelope): void {
  if (!hasLocalStorage()) {
    return;
  }

  const nextState: AppStateEnvelope = {
    ...state,
    meta: {
      ...state.meta,
      updatedAt: isoNow()
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function clearState(): void {
  if (!hasLocalStorage()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
