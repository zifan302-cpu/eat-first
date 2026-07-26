import {
  markFoodEaten,
  useFoodPart
} from "../hooks/useFoodActions";
import type {
  AppStateEnvelope,
  FoodActionContext,
  RecipeCookedFoodUse
} from "../types/food";
import { isoNow } from "./dates";

function transactionId(now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cook-${crypto.randomUUID()}`;
  }
  return `cook-${now.getTime()}-${Math.random().toString(36).slice(2)}`;
}

export function applyCookedRecipe(
  state: AppStateEnvelope,
  historyId: string,
  recipeIndex: number,
  requestedUses: RecipeCookedFoodUse[],
  now = new Date()
): AppStateEnvelope {
  const historyEntry = state.recipeHistory.find((entry) => entry.id === historyId);
  const recipe = historyEntry?.recipes[recipeIndex];
  if (!historyEntry || !recipe || historyEntry.cooked) {
    return state;
  }

  const allowedFoodIds = new Set(recipe.usesFoods.map((use) => use.foodId));
  const seen = new Set<string>();
  const uses: RecipeCookedFoodUse[] = [];
  let foods = state.foods;
  const batchId = transactionId(now);
  const context: FoodActionContext = {
    transactionId: batchId,
    recipeHistoryId: historyId,
    recipeIndex
  };

  for (const requested of requestedUses) {
    if (!allowedFoodIds.has(requested.foodId) || seen.has(requested.foodId)) continue;
    seen.add(requested.foodId);
    const food = foods.find((item) => item.id === requested.foodId);
    if (!food || food.status !== "active") {
      uses.push({ foodId: requested.foodId, outcome: "not_used" });
      continue;
    }

    if (requested.outcome === "all") {
      foods = markFoodEaten(foods, food.id, now, context);
      uses.push({ foodId: food.id, outcome: "all" });
      continue;
    }

    if (requested.outcome === "part") {
      if (typeof food.quantityAmount === "number") {
        const remainingAmount = requested.remainingAmount;
        if (
          typeof remainingAmount !== "number" ||
          !Number.isFinite(remainingAmount) ||
          remainingAmount < 0 ||
          remainingAmount >= food.quantityAmount
        ) {
          uses.push({ foodId: food.id, outcome: "not_used" });
          continue;
        }
        foods = useFoodPart(foods, food.id, remainingAmount, undefined, now, context);
        uses.push({
          foodId: food.id,
          outcome: remainingAmount === 0 ? "all" : "part",
          ...(remainingAmount > 0 ? { remainingAmount } : {})
        });
        continue;
      }

      const remainingText = requested.remainingText?.trim().slice(0, 80);
      foods = useFoodPart(foods, food.id, undefined, remainingText, now, context);
      uses.push({
        foodId: food.id,
        outcome: "part",
        ...(remainingText ? { remainingText } : {})
      });
      continue;
    }

    uses.push({ foodId: food.id, outcome: "not_used" });
  }

  for (const recipeUse of recipe.usesFoods) {
    if (!seen.has(recipeUse.foodId)) {
      uses.push({ foodId: recipeUse.foodId, outcome: "not_used" });
    }
  }

  return {
    ...state,
    foods,
    recipeHistory: state.recipeHistory.map((entry) =>
      entry.id === historyId
        ? {
            ...entry,
            cooked: {
              recipeIndex,
              cookedAt: isoNow(now),
              transactionId: batchId,
              uses
            }
          }
        : entry
    )
  };
}
