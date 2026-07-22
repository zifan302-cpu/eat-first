import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFoodItem } from "../lib/foods";
import {
  buildRecipeRequest,
  clearRecipeCache,
  createRecipeHistoryEntry,
  generateRecipeIdeas,
  generateRecipeReplacement,
  isRecipeEligible
} from "../lib/recipes";
import type { RecipeIdea } from "../types/food";

const defaultOptions = {
  locale: "en-GB" as const,
  cuisine: "auto" as const,
  servings: 2,
  maxMinutes: 30,
  cookingGoal: "auto" as const,
  dietaryNotes: "no nuts",
  equipment: ["hob" as const, "oven" as const],
  customEquipment: ["tagine"],
  pantryPolicy: "everyday" as const,
  pantryStaples: ["cooking_oil" as const, "salt" as const],
  customPantryStaples: ["miso paste"]
};

describe("recipe request boundary", () => {
  beforeEach(() => {
    clearRecipeCache();
    vi.restoreAllMocks();
  });
  it("excludes foods past a use-by date from every role", () => {
    const expired = createFoodItem(
      { name: "Chicken", category: "meat", dateLabelType: "use_by", labelDate: "2026-01-01" },
      "manual",
      new Date("2026-01-02T10:00:00.000Z")
    );
    const current = createFoodItem(
      { name: "Tomato", category: "vegetable", dateLabelType: "none" },
      "manual",
      new Date("2026-01-02T10:00:00.000Z")
    );

    expect(isRecipeEligible(expired)).toBe(false);
    const request = buildRecipeRequest({
      suggestedFoods: [expired, current],
      requiredFoods: [expired],
      availableFoods: [expired],
      excludedFoodIds: []
    }, defaultOptions);

    expect(request.suggestedFoods.map((food) => food.name)).toEqual(["Tomato"]);
    expect(request.requiredFoods).toEqual([]);
    expect(request.availableFoods).toEqual([]);
  });

  it("keeps role precedence and allows up to fifteen available foods", () => {
    const foods = Array.from({ length: 22 }, (_, index) =>
      createFoodItem(
        { name: `Food ${index}`, category: "other", dateLabelType: "none" },
        "manual",
        new Date("2026-01-02T10:00:00.000Z")
      )
    );
    const request = buildRecipeRequest({
      suggestedFoods: foods.slice(0, 3),
      requiredFoods: [foods[3]],
      availableFoods: foods,
      excludedFoodIds: [foods[4].id]
    }, {
      ...defaultOptions,
      locale: "zh-CN",
      cookingGoal: "rescue_more",
      dietaryNotes: "x".repeat(300)
    });

    expect(request.suggestedFoods).toHaveLength(3);
    expect(request.requiredFoods.map((food) => food.name)).toEqual(["Food 3"]);
    expect(request.availableFoods).toHaveLength(15);
    expect(request.availableFoods.some((food) => food.name === "Food 4")).toBe(false);
    expect(request.dietaryNotes).toHaveLength(240);
    expect(request.locale).toBe("zh-CN");
    expect(request.cookingGoal).toBe("rescue_more");
    expect(request.equipment).toEqual(["hob", "oven"]);
    expect(request.customEquipment).toEqual(["tagine"]);
    expect(request.pantryStaples).toEqual(["cooking_oil", "salt"]);
    expect(request.customPantryStaples).toEqual(["miso paste"]);
  });

  it("reuses an identical recipe request for five minutes", async () => {
    const recipe: RecipeIdea = {
      title: "Tomato rice",
      summary: "Quick and practical",
      whyThisOption: "It uses the tomato first.",
      totalMinutes: 20,
      differenceTags: ["fastest"],
      ingredients: ["2 tomatoes", "1 bowl rice"],
      steps: ["Cook the tomato", "Fold in the rice"],
      equipment: ["hob"],
      missingIngredients: ["rice"],
      usesFoods: [{ foodId: "tomato", estimatedAmount: 2, estimatedUnit: "item" }]
    };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ recipes: [recipe, { ...recipe, title: "Tomato soup" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    const request = {
      ...buildRecipeRequest({
        suggestedFoods: [],
        requiredFoods: [],
        availableFoods: [],
        excludedFoodIds: []
      }, defaultOptions),
      availableFoods: [{
        id: "tomato",
        name: "Tomato",
        dateLabelType: "none" as const,
        urgency: "normal" as const
      }]
    };

    await generateRecipeIdeas(request);
    await generateRecipeIdeas(request);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("creates a local history entry from a generated pair", () => {
    const request = {
      ...buildRecipeRequest({
        suggestedFoods: [],
        requiredFoods: [],
        availableFoods: [],
        excludedFoodIds: []
      }, defaultOptions),
      availableFoods: [{
        id: "tomato",
        name: "Tomato",
        dateLabelType: "none" as const,
        urgency: "normal" as const
      }]
    };
    const recipe = {
      title: "Tomato rice",
      summary: "Quick",
      whyThisOption: "Fast",
      totalMinutes: 20,
      differenceTags: ["fastest" as const],
      ingredients: ["Tomato"],
      steps: ["Cook"],
      equipment: ["hob"],
      missingIngredients: [],
      usesFoods: [{ foodId: "tomato" }]
    };
    const entry = createRecipeHistoryEntry(
      request,
      [recipe, { ...recipe, title: "Tomato soup" }],
      new Date("2026-07-22T12:00:00.000Z")
    );

    expect(entry.createdAt).toBe("2026-07-22T12:00:00.000Z");
    expect(entry.recipes).toHaveLength(2);
    expect(entry.locale).toBe("en-GB");
  });

  it("sends the preserved option when refining only one recipe", async () => {
    const recipe: RecipeIdea = {
      title: "Tomato rice",
      summary: "Quick",
      whyThisOption: "Fast",
      totalMinutes: 20,
      differenceTags: ["fastest"],
      ingredients: ["Tomato"],
      steps: ["Cook"],
      equipment: ["hob"],
      missingIngredients: [],
      usesFoods: [{ foodId: "tomato" }]
    };
    const preserved = { ...recipe, title: "Tomato soup" };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ recipe: { ...recipe, title: "Tomato pasta" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    const request = {
      ...buildRecipeRequest({
        suggestedFoods: [],
        requiredFoods: [],
        availableFoods: [],
        excludedFoodIds: []
      }, defaultOptions),
      availableFoods: [{
        id: "tomato",
        name: "Tomato",
        dateLabelType: "none" as const,
        urgency: "normal" as const
      }]
    };

    await generateRecipeReplacement(request, recipe, { kind: "different_method" }, [preserved]);

    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.otherRecipes).toEqual([preserved]);
  });
});
