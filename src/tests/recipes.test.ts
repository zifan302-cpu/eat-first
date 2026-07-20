import { describe, expect, it } from "vitest";
import { createFoodItem } from "../lib/foods";
import { buildRecipeRequest, isRecipeEligible } from "../lib/recipes";

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
    const request = buildRecipeRequest([expired, current], "en-GB", 2, 30, "no nuts");
    expect(request.foods.map((food) => food.name)).toEqual(["Tomato"]);
  });

  it("limits free text and the number of foods sent", () => {
    const foods = Array.from({ length: 10 }, (_, index) =>
      createFoodItem(
        { name: `Food ${index}`, category: "other", dateLabelType: "none" },
        "manual",
        new Date("2026-01-02T10:00:00.000Z")
      )
    );
    const request = buildRecipeRequest(foods, "zh-CN", 1, 15, "x".repeat(300));
    expect(request.foods).toHaveLength(8);
    expect(request.dietaryNotes).toHaveLength(240);
  });
});
