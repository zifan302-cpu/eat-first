import { describe, expect, it } from "vitest";
import { createFoodItem } from "../lib/foods";
import { buildRecipeRequest, isRecipeEligible } from "../lib/recipes";

const defaultOptions = {
  locale: "en-GB" as const,
  cuisine: "auto" as const,
  servings: 2,
  maxMinutes: 30,
  dietaryNotes: "no nuts",
  appliances: ["oven" as const]
};

describe("recipe request boundary", () => {
  it("excludes foods past a use-by date before the API request", () => {
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
    const request = buildRecipeRequest([expired, current], [expired], defaultOptions);
    expect(request.priorityFoods.map((food) => food.name)).toEqual(["Tomato"]);
    expect(request.availableFoods).toEqual([]);
  });

  it("separates three priority foods from up to five supporting foods", () => {
    const foods = Array.from({ length: 10 }, (_, index) =>
      createFoodItem(
        { name: `Food ${index}`, category: "other", dateLabelType: "none" },
        "manual",
        new Date("2026-01-02T10:00:00.000Z")
      )
    );
    const request = buildRecipeRequest(foods.slice(0, 3), foods, {
      ...defaultOptions,
      locale: "zh-CN",
      dietaryNotes: "x".repeat(300)
    });

    expect(request.priorityFoods).toHaveLength(3);
    expect(request.availableFoods).toHaveLength(5);
    expect(request.availableFoods[0].name).toBe("Food 3");
    expect(request.dietaryNotes).toHaveLength(240);
    expect(request.locale).toBe("zh-CN");
    expect(request.cuisine).toBe("auto");
    expect(request.appliances).toEqual(["oven"]);
  });
});
