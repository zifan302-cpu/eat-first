import { describe, expect, it } from "vitest";
import { createFoodItem } from "../lib/foods";
import { buildRecipeRequest, isRecipeEligible } from "../lib/recipes";

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
});
