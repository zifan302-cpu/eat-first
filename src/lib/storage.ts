import type { AppStateEnvelope, FoodItem, LocaleCode } from "../types/food";
import { APP_ID, SCHEMA_VERSION, STORAGE_KEY } from "./constants";
import { isoNow } from "./dates";
import { createDemoFoods } from "./sampleData";

function detectLocale(): LocaleCode {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh-CN";
  }
  return "en-GB";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFoods(input: unknown): FoodItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter((item): item is FoodItem => {
    return (
      isObject(item) &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.normalizedName === "string" &&
      (item.status === "active" ||
        item.status === "eaten" ||
        item.status === "frozen" ||
        item.status === "discarded")
    );
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
      proUnlocked: false,
      showSafetyBanner: true,
      hasSeenOnboarding: false
    },
    foods: [],
    meta: {
      createdAt: at,
      updatedAt: at,
      seededDemo: false
    }
  };
}

export function seedDemoState(now = new Date()): AppStateEnvelope {
  const state = createDefaultState(now);
  return {
    ...state,
    foods: createDemoFoods(now),
    meta: {
      ...state.meta,
      seededDemo: true
    }
  };
}

export function migrateState(input: unknown): AppStateEnvelope {
  if (!isObject(input)) {
    return seedDemoState();
  }

  if (
    input.appId !== APP_ID ||
    input.schemaVersion !== SCHEMA_VERSION ||
    !Array.isArray(input.foods)
  ) {
    return seedDemoState();
  }

  const base = createDefaultState();
  const preferences = isObject(input.preferences) ? input.preferences : {};
  const meta = isObject(input.meta) ? input.meta : {};
  const foods = normalizeFoods(input.foods);
  const shouldRefreshOldDemo =
    meta.seededDemo === true &&
    foods.length < 15 &&
    foods.length > 0 &&
    foods.every((food) => food.source === "demo_seed");

  if (shouldRefreshOldDemo) {
    const seeded = seedDemoState();
    seeded.preferences.locale =
      preferences.locale === "zh-CN" || preferences.locale === "en-GB"
        ? preferences.locale
        : seeded.preferences.locale;
    seeded.preferences.proUnlocked = preferences.proUnlocked === true;
    return seeded;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    appId: APP_ID,
    preferences: {
      locale: preferences.locale === "zh-CN" || preferences.locale === "en-GB" ? preferences.locale : base.preferences.locale,
      topN: typeof preferences.topN === "number" ? preferences.topN : 3,
      proUnlocked: preferences.proUnlocked === true,
      showSafetyBanner: preferences.showSafetyBanner !== false,
      hasSeenOnboarding: preferences.hasSeenOnboarding === true,
      installHintDismissedAt:
        typeof preferences.installHintDismissedAt === "string"
          ? preferences.installHintDismissedAt
          : undefined
    },
    foods,
    meta: {
      createdAt: typeof meta.createdAt === "string" ? meta.createdAt : base.meta.createdAt,
      updatedAt: typeof meta.updatedAt === "string" ? meta.updatedAt : base.meta.updatedAt,
      seededDemo: meta.seededDemo === true
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
    return seedDemoState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedDemoState();
      saveState(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as unknown;
    return migrateState(parsed);
  } catch {
    const seeded = seedDemoState();
    saveState(seeded);
    return seeded;
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
