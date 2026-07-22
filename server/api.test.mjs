import { describe, expect, it } from "vitest";
import {
  buildRecipeSystemPrompt,
  categoryFromTags,
  createModelFoodAliases,
  parseRecipeJson
} from "./api.mjs";

describe("barcode category confidence", () => {
  it("does not treat a generic plant-based tag as a vegetable", () => {
    expect(categoryFromTags(["en:plant-based-foods-and-beverages"])).toEqual({
      category: "other",
      categoryConfidence: "low"
    });
  });

  it("recognises instant noodles as dry goods", () => {
    expect(categoryFromTags(["en:instant-noodles"])).toEqual({
      category: "dry_goods",
      categoryConfidence: "high"
    });
  });
});

describe("recipe model boundary", () => {
  it("separates response language from cuisine and equipment preferences", () => {
    const chinesePrompt = buildRecipeSystemPrompt({
      locale: "zh-CN",
      cuisine: "auto",
      appliances: ["rice_cooker"]
    });
    expect(chinesePrompt).toContain("Simplified Chinese");
    expect(chinesePrompt).toContain("Chinese home cooking");
    expect(chinesePrompt).toContain("rice cooker");

    const englishPrompt = buildRecipeSystemPrompt({
      locale: "en-GB",
      cuisine: "global_everyday",
      appliances: []
    });
    expect(englishPrompt).toContain("British English");
    expect(englishPrompt).toContain("global everyday home cooking");
    expect(englishPrompt).toContain("Do not require an oven");
  });

  it("uses short aliases and removes internal ids from visible recipe text", () => {
    const beefId = "food-92327301-1fff-4a4f-969d-b60331fc8793";
    const tomatoId = "food-7bf4e777-bb41-467d-81be-17133a76ebb0";
    const { aliases, modelFoods } = createModelFoodAliases([
      { id: beefId, name: "牛腩" },
      { id: tomatoId, name: "番茄" }
    ]);

    expect(modelFoods.map((food) => food.id)).toEqual(["f1", "f2"]);
    const recipes = parseRecipeJson(
      JSON.stringify({
        recipes: [
          {
            title: "番茄牛腩",
            summary: "慢炖版本",
            totalMinutes: 90,
            ingredients: ["牛腩（f1） 250克", `番茄 (${tomatoId}) 2个`],
            steps: ["切块", "慢炖至软烂", "调味", "装盘"],
            usesFoodIds: ["f1", "f2"]
          }
        ]
      }),
      aliases
    );

    expect(recipes[0].ingredients).toEqual(["牛腩 250克", "番茄 2个"]);
    expect(recipes[0].usesFoodIds).toEqual([beefId, tomatoId]);
  });
});
