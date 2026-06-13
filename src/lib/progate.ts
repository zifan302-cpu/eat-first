import type { AppStateEnvelope } from "../types/food";
import { DEMO_PRO_CODE, FREE_ACTIVE_LIMIT } from "./constants";
import { getActiveFoods } from "./priority";

export function canAddActiveFood(state: AppStateEnvelope): boolean {
  return state.preferences.proUnlocked || getActiveFoods(state.foods).length < FREE_ACTIVE_LIMIT;
}

export function isValidDemoProCode(code: string): boolean {
  return code.trim().toUpperCase() === DEMO_PRO_CODE;
}

export function unlockProGate(state: AppStateEnvelope, code: string): AppStateEnvelope {
  if (!isValidDemoProCode(code)) {
    return state;
  }

  return {
    ...state,
    preferences: {
      ...state.preferences,
      proUnlocked: true
    }
  };
}
