import type { FoodItem, FoodSource } from "../types/food";
import { isoNow, toDateInputValue } from "./dates";
import { normalizeFoodName } from "./nameNormalization";

let fallbackCounter = 0;

function createId(prefix: string, now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  fallbackCounter += 1;
  return `${prefix}-${toDateInputValue(now)}-${Date.now()}-${fallbackCounter}`;
}

export function createFoodItem(
  input: Omit<
    FoodItem,
    | "id"
    | "normalizedName"
    | "status"
    | "source"
    | "createdAt"
    | "updatedAt"
    | "actionHistory"
  >,
  source: FoodSource,
  now = new Date()
): FoodItem {
  const at = isoNow(now);

  return {
    id: createId("food", now),
    ...input,
    normalizedName: normalizeFoodName(input.name),
    status: "active",
    source,
    createdAt: at,
    updatedAt: at,
    actionHistory: [
      {
        id: createId("action", now),
        type: "created",
        at
      }
    ]
  };
}
