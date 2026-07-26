import { describe, expect, it } from "vitest";
import { createFoodFromInput } from "../hooks/useFoodActions";
import { applyCookedRecipe } from "../lib/cooking";
import { createDefaultState } from "../lib/storage";
import type { AppStateEnvelope, FoodItem, RecipeHistoryEntry } from "../types/food";

const now = new Date("2026-07-26T12:00:00.000Z");

function food(name: string, quantityAmount?: number): FoodItem {
  return createFoodFromInput(
    {
      name,
      category: "vegetable",
      dateLabelType: "none",
      quantityAmount,
      quantityUnit: quantityAmount ? "item" : undefined
    },
    now
  );
}

function history(foods: FoodItem[]): RecipeHistoryEntry {
  return {
    id: "history-1",
    createdAt: now.toISOString(),
    locale: "en-GB",
    cuisine: "auto",
    servings: 1,
    maxMinutes: 30,
    cookingGoal: "rescue_more",
    recipes: [{
      title: "Rescue tray",
      summary: "Use what is available",
      whyThisOption: "Uses the selected foods",
      totalMinutes: 25,
      differenceTags: ["uses_more"],
      ingredients: foods.map((item) => item.name),
      steps: ["Cook"],
      equipment: ["oven"],
      missingIngredients: [],
      usesFoods: foods.map((item) => ({ foodId: item.id }))
    }]
  };
}

function stateWith(foods: FoodItem[]): AppStateEnvelope {
  return {
    ...createDefaultState(now),
    foods,
    recipeHistory: [history(foods)]
  };
}

describe("cooking-to-inventory loop", () => {
  it("applies all, part, and not-used outcomes as one traceable transaction", () => {
    const tomatoes = food("Tomatoes", 4);
    const carrots = food("Carrots", 3);
    const broccoli = food("Broccoli", 2);
    const cooked = applyCookedRecipe(
      stateWith([tomatoes, carrots, broccoli]),
      "history-1",
      0,
      [
        { foodId: tomatoes.id, outcome: "all" },
        { foodId: carrots.id, outcome: "part", remainingAmount: 1 },
        { foodId: broccoli.id, outcome: "not_used" }
      ],
      now
    );

    expect(cooked.foods.find((item) => item.id === tomatoes.id)?.status).toBe("eaten");
    expect(cooked.foods.find((item) => item.id === carrots.id)?.quantityAmount).toBe(1);
    expect(cooked.foods.find((item) => item.id === broccoli.id)).toBe(broccoli);

    const record = cooked.recipeHistory[0].cooked;
    expect(record?.uses.map((use) => use.outcome)).toEqual(["all", "part", "not_used"]);
    const tomatoAction = cooked.foods.find((item) => item.id === tomatoes.id)?.actionHistory.at(-1);
    const carrotAction = cooked.foods.find((item) => item.id === carrots.id)?.actionHistory.at(-1);
    expect(tomatoAction?.transactionId).toBe(record?.transactionId);
    expect(carrotAction?.transactionId).toBe(record?.transactionId);
    expect(tomatoAction?.recipeHistoryId).toBe("history-1");
  });

  it("is idempotent after a recipe has already been marked cooked", () => {
    const tomatoes = food("Tomatoes", 2);
    const first = applyCookedRecipe(
      stateWith([tomatoes]),
      "history-1",
      0,
      [{ foodId: tomatoes.id, outcome: "all" }],
      now
    );

    expect(
      applyCookedRecipe(
        first,
        "history-1",
        0,
        [{ foodId: tomatoes.id, outcome: "part", remainingAmount: 1 }],
        now
      )
    ).toBe(first);
  });

  it("treats an invalid remaining amount as not used without mutating inventory", () => {
    const carrots = food("Carrots", 3);
    const cooked = applyCookedRecipe(
      stateWith([carrots]),
      "history-1",
      0,
      [{ foodId: carrots.id, outcome: "part", remainingAmount: 4 }],
      now
    );

    expect(cooked.foods[0]).toBe(carrots);
    expect(cooked.recipeHistory[0].cooked?.uses).toEqual([
      { foodId: carrots.id, outcome: "not_used" }
    ]);
  });
});
