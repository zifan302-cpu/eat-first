import { addDays } from "date-fns";
import { useMemo } from "react";
import type {
  FoodActionRecord,
  FoodActionContext,
  FoodActionType,
  FoodCategory,
  FoodItem,
  DateLabelType,
  FoodSource,
  FoodQuantityUnit
} from "../types/food";
import { createFoodItem } from "../lib/foods";
import { isoNow, toDateInputValue } from "../lib/dates";
import { normalizeFoodName } from "../lib/nameNormalization";
import { useAppState } from "./useAppState";

export interface AddFoodInput {
  name: string;
  category: FoodCategory;
  dateLabelType: DateLabelType;
  labelDate?: string;
  openedShelfLifeDays?: number;
  quantityAmount?: number;
  quantityUnit?: FoodQuantityUnit;
  quantityText?: string;
  barcode?: string;
  note?: string;
  source?: FoodSource;
  categoryNeedsReview?: boolean;
  dateNeedsReview?: boolean;
}

export interface UpdateFoodInput extends Partial<AddFoodInput> {}

export interface UseFoodActions {
  addFood(input: AddFoodInput): void;
  updateFood(id: string, patch: UpdateFoodInput): void;
  deleteFood(id: string): void;
  markEaten(id: string): void;
  markFrozen(id: string): void;
  markDiscarded(id: string): void;
  restoreFrozen(id: string): void;
  usePart(id: string, remainingAmount?: number, remainingText?: string): void;
  snoozeUntilTomorrow(id: string): void;
}

function actionId(type: FoodActionType, now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${type}-${crypto.randomUUID()}`;
  }
  return `${type}-${now.getTime()}-${Math.random().toString(36).slice(2)}`;
}

function action(
  type: FoodActionType,
  now: Date,
  note?: string,
  context?: FoodActionContext
): FoodActionRecord {
  return {
    id: actionId(type, now),
    type,
    at: isoNow(now),
    note,
    ...context
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
      quantityAmount:
        typeof input.quantityAmount === "number" && input.quantityAmount > 0
          ? input.quantityAmount
          : undefined,
      quantityUnit: input.quantityUnit,
      quantityText: input.quantityText?.trim() || undefined,
      barcode: input.barcode?.trim() || undefined,
      note: input.note?.trim() || undefined
    },
    input.source ?? "manual",
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
      quantityAmount:
        typeof patch.quantityAmount === "number"
          ? patch.quantityAmount > 0
            ? patch.quantityAmount
            : undefined
          : food.quantityAmount,
      quantityUnit: patch.quantityUnit ?? food.quantityUnit,
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
  now = new Date(),
  context?: FoodActionContext
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
      actionHistory: [...food.actionHistory, action(type, now, undefined, context)]
    };
  });
}

export function markFoodEaten(
  foods: FoodItem[],
  id: string,
  now = new Date(),
  context?: FoodActionContext
): FoodItem[] {
  return markFoodStatus(foods, id, "eaten", now, context);
}

export function markFoodFrozen(
  foods: FoodItem[],
  id: string,
  now = new Date(),
  context?: FoodActionContext
): FoodItem[] {
  return markFoodStatus(foods, id, "frozen", now, context);
}

export function markFoodDiscarded(
  foods: FoodItem[],
  id: string,
  now = new Date(),
  context?: FoodActionContext
): FoodItem[] {
  return markFoodStatus(foods, id, "discarded", now, context);
}

export function restoreFrozenFood(
  foods: FoodItem[],
  id: string,
  now = new Date()
): FoodItem[] {
  return foods.map((food) => {
    if (food.id !== id || food.status !== "frozen") return food;
    const at = isoNow(now);
    return {
      ...food,
      status: "active",
      snoozedUntil: undefined,
      updatedAt: at,
      actionHistory: [...food.actionHistory, action("restored", now)]
    };
  });
}

export function useFoodPart(
  foods: FoodItem[],
  id: string,
  remainingAmount?: number,
  remainingText?: string,
  now = new Date(),
  context?: FoodActionContext
): FoodItem[] {
  if (typeof remainingAmount === "number" && !Number.isFinite(remainingAmount)) {
    return foods;
  }

  if (typeof remainingAmount === "number" && remainingAmount <= 0) {
    return markFoodStatus(foods, id, "eaten", now, context);
  }

  return foods.map((food) => {
    if (food.id !== id) return food;
    if (
      typeof food.quantityAmount === "number" &&
      (typeof remainingAmount !== "number" ||
        remainingAmount > food.quantityAmount ||
        remainingAmount === food.quantityAmount)
    ) {
      return food;
    }
    const at = isoNow(now);
    const nextText = remainingText?.trim();
    if (
      typeof food.quantityAmount !== "number" &&
      !nextText &&
      !context?.recipeHistoryId
    ) {
      return food;
    }
    return {
      ...food,
      quantityAmount:
        typeof remainingAmount === "number" && remainingAmount > 0
          ? remainingAmount
          : food.quantityAmount,
      quantityText: nextText || food.quantityText,
      updatedAt: at,
      actionHistory: [
        ...food.actionHistory,
        action(
          "partially_used",
          now,
          typeof remainingAmount === "number"
            ? `remaining:${remainingAmount}:${food.quantityUnit ?? "item"}`
            : nextText
              ? `remaining:${nextText}`
              : undefined,
          context
        )
      ]
    };
  });
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
  const { commitState, setState, state } = useAppState();
  const stateFoodName = (id: string) =>
    state.foods.find((food) => food.id === id)?.name ?? "Food";

  return useMemo(
    () => ({
      addFood(input) {
        const food = createFoodFromInput(input);
        commitState(
          (current) => ({
            ...current,
            foods: [food, ...current.foods]
          }),
          { action: "added", name: food.name }
        );
      },
      updateFood(id, patch) {
        setState((current) => ({
          ...current,
          foods: updateFoodList(current.foods, id, patch)
        }));
      },
      deleteFood(id) {
        const foodName = stateFoodName(id);
        commitState(
          (current) => ({
            ...current,
            foods: current.foods.filter((food) => food.id !== id)
          }),
          { action: "deleted", name: foodName }
        );
      },
      markEaten(id) {
        commitState(
          (current) => ({
            ...current,
            foods: markFoodEaten(current.foods, id)
          }),
          { action: "eaten", name: stateFoodName(id) }
        );
      },
      markFrozen(id) {
        commitState(
          (current) => ({
            ...current,
            foods: markFoodFrozen(current.foods, id)
          }),
          { action: "frozen", name: stateFoodName(id) }
        );
      },
      markDiscarded(id) {
        commitState(
          (current) => ({
            ...current,
            foods: markFoodDiscarded(current.foods, id)
          }),
          { action: "discarded", name: stateFoodName(id) }
        );
      },
      restoreFrozen(id) {
        commitState(
          (current) => ({
            ...current,
            foods: restoreFrozenFood(current.foods, id)
          }),
          { action: "restored", name: stateFoodName(id) }
        );
      },
      usePart(id, remainingAmount, remainingText) {
        commitState(
          (current) => ({
            ...current,
            foods: useFoodPart(current.foods, id, remainingAmount, remainingText)
          }),
          { action: "partial", name: stateFoodName(id) }
        );
      },
      snoozeUntilTomorrow(id) {
        commitState(
          (current) => ({
            ...current,
            foods: snoozeFoodUntilTomorrow(current.foods, id)
          }),
          { action: "later", name: stateFoodName(id) }
        );
      }
    }),
    [commitState, setState, state.foods]
  );
}
