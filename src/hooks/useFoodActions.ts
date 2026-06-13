import { addDays } from "date-fns";
import { useMemo } from "react";
import type {
  FoodActionRecord,
  FoodActionType,
  FoodCategory,
  FoodItem,
  DateLabelType
} from "../types/food";
import { canAddActiveFood } from "../lib/progate";
import { createFoodItem } from "../lib/sampleData";
import { seedDemoState } from "../lib/storage";
import { isoNow, toDateInputValue } from "../lib/dates";
import { normalizeFoodName } from "../lib/nameNormalization";
import { useAppState } from "./useAppState";

export interface AddFoodInput {
  name: string;
  category: FoodCategory;
  dateLabelType: DateLabelType;
  labelDate?: string;
  openedShelfLifeDays?: number;
  quantityText?: string;
  note?: string;
}

export interface UpdateFoodInput extends Partial<AddFoodInput> {}

export interface UseFoodActions {
  addFood(input: AddFoodInput): void;
  updateFood(id: string, patch: UpdateFoodInput): void;
  deleteFood(id: string): void;
  markEaten(id: string): void;
  markFrozen(id: string): void;
  markDiscarded(id: string): void;
  snoozeUntilTomorrow(id: string): void;
  resetDemo(): void;
}

export class ProLimitError extends Error {
  constructor() {
    super("PRO_LIMIT");
    this.name = "ProLimitError";
  }
}

function actionId(type: FoodActionType, now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${type}-${crypto.randomUUID()}`;
  }
  return `${type}-${now.getTime()}-${Math.random().toString(36).slice(2)}`;
}

function action(type: FoodActionType, now: Date, note?: string): FoodActionRecord {
  return {
    id: actionId(type, now),
    type,
    at: isoNow(now),
    note
  };
}

export function createFoodFromInput(input: AddFoodInput, now = new Date()): FoodItem {
  return createFoodItem(
    {
      name: input.name.trim(),
      category: input.category,
      dateLabelType: input.dateLabelType,
      labelDate: input.dateLabelType === "none" ? undefined : input.labelDate,
      openedShelfLifeDays:
        input.dateLabelType === "opened"
          ? input.openedShelfLifeDays ?? (input.category === "leftovers" ? 2 : 3)
          : undefined,
      quantityText: input.quantityText?.trim() || undefined,
      note: input.note?.trim() || undefined
    },
    "manual",
    now
  );
}

export function updateFoodList(foods: FoodItem[], id: string, patch: UpdateFoodInput, now = new Date()): FoodItem[] {
  return foods.map((food) => {
    if (food.id !== id) {
      return food;
    }

    const nextDateLabelType = patch.dateLabelType ?? food.dateLabelType;
    const nextName = patch.name?.trim() || food.name;
    const updated: FoodItem = {
      ...food,
      ...patch,
      name: nextName,
      normalizedName: normalizeFoodName(nextName),
      dateLabelType: nextDateLabelType,
      labelDate: nextDateLabelType === "none" ? undefined : patch.labelDate ?? food.labelDate,
      openedShelfLifeDays:
        nextDateLabelType === "opened"
          ? patch.openedShelfLifeDays ?? food.openedShelfLifeDays ?? 3
          : undefined,
      quantityText: patch.quantityText?.trim() || food.quantityText,
      note: patch.note?.trim() || food.note,
      updatedAt: isoNow(now),
      actionHistory: [...food.actionHistory, action("updated", now)]
    };

    return updated;
  });
}

function markFoodStatus(
  foods: FoodItem[],
  id: string,
  type: Extract<FoodActionType, "eaten" | "frozen" | "discarded">,
  now = new Date()
): FoodItem[] {
  return foods.map((food) => {
    if (food.id !== id) {
      return food;
    }

    const at = isoNow(now);
    return {
      ...food,
      status: type === "eaten" ? "eaten" : type === "frozen" ? "frozen" : "discarded",
      consumedAt: type === "eaten" ? at : food.consumedAt,
      frozenAt: type === "frozen" ? at : food.frozenAt,
      discardedAt: type === "discarded" ? at : food.discardedAt,
      updatedAt: at,
      actionHistory: [...food.actionHistory, action(type, now)]
    };
  });
}

export function markFoodEaten(foods: FoodItem[], id: string, now = new Date()): FoodItem[] {
  return markFoodStatus(foods, id, "eaten", now);
}

export function markFoodFrozen(foods: FoodItem[], id: string, now = new Date()): FoodItem[] {
  return markFoodStatus(foods, id, "frozen", now);
}

export function markFoodDiscarded(foods: FoodItem[], id: string, now = new Date()): FoodItem[] {
  return markFoodStatus(foods, id, "discarded", now);
}

export function snoozeFoodUntilTomorrow(foods: FoodItem[], id: string, now = new Date()): FoodItem[] {
  const tomorrow = toDateInputValue(addDays(now, 1));
  return foods.map((food) => {
    if (food.id !== id) {
      return food;
    }

    return {
      ...food,
      snoozedUntil: tomorrow,
      updatedAt: isoNow(now),
      actionHistory: [...food.actionHistory, action("snoozed", now)]
    };
  });
}

export function useFoodActions(): UseFoodActions {
  const { setState, state } = useAppState();

  return useMemo(
    () => ({
      addFood(input) {
        if (!canAddActiveFood(state)) {
          throw new ProLimitError();
        }

        setState((current) => {
          return {
            ...current,
            foods: [createFoodFromInput(input), ...current.foods]
          };
        });
      },
      updateFood(id, patch) {
        setState((current) => ({
          ...current,
          foods: updateFoodList(current.foods, id, patch)
        }));
      },
      deleteFood(id) {
        setState((current) => ({
          ...current,
          foods: current.foods.filter((food) => food.id !== id)
        }));
      },
      markEaten(id) {
        setState((current) => ({
          ...current,
          foods: markFoodEaten(current.foods, id)
        }));
      },
      markFrozen(id) {
        setState((current) => ({
          ...current,
          foods: markFoodFrozen(current.foods, id)
        }));
      },
      markDiscarded(id) {
        setState((current) => ({
          ...current,
          foods: markFoodDiscarded(current.foods, id)
        }));
      },
      snoozeUntilTomorrow(id) {
        setState((current) => ({
          ...current,
          foods: snoozeFoodUntilTomorrow(current.foods, id)
        }));
      },
      resetDemo() {
        const next = seedDemoState();
        next.preferences.locale = state.preferences.locale;
        setState(next);
      }
    }),
    [setState, state]
  );
}
