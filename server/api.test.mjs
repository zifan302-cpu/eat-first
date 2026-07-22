import { describe, expect, it } from "vitest";
import {
  buildRecipeSystemPrompt,
  categoryFromTags,
  createModelFoodAliases,
  normalizeCustomLabels,
  parseRecipeJson,
  reconcileRecipeFoodUses,
  validateRecipeOutput,
  validateRecipeReplacement
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
      equipment: ["hob", "rice_cooker", "steamer"],
      pantryPolicy: "strict",
      pantryStaples: ["cooking_oil", "salt"],
      cookingGoal: "rescue_more"
    });
    expect(chinesePrompt).toContain("Simplified Chinese");
    expect(chinesePrompt).toContain("Chinese home cooking");
    expect(chinesePrompt).toContain("rice cooker");
    expect(chinesePrompt).toContain("steamer");
    expect(chinesePrompt).toContain("only these saved standard staples");
    expect(chinesePrompt).toContain("use more urgent fridge foods");

    const englishPrompt = buildRecipeSystemPrompt({
      locale: "en-GB",
      cuisine: "global_everyday",
      equipment: [],
      pantryPolicy: "everyday",
      pantryStaples: [],
      cookingGoal: "no_cook"
    });
    expect(englishPrompt).toContain("British English");
    expect(englishPrompt).toContain("global everyday home cooking");
  expect(englishPrompt).toContain("Do not require other powered or heating equipment");
    expect(englishPrompt).toContain("Do not use heat");
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
          },
          {
            title: "番茄牛腩面",
            summary: "更快的面食版本",
            totalMinutes: 30,
            ingredients: ["牛腩 150克", "番茄 1个", "面条 1份"],
            steps: ["切块", "翻炒", "加水煮熟", "下面条"],
            usesFoodIds: ["f1", "f2"]
          }
        ]
      }),
      aliases
    );

    expect(recipes[0].ingredients).toEqual(["牛腩 250克", "番茄 2个"]);
    expect(recipes[0].usesFoods.map((food) => food.foodId)).toEqual([beefId, tomatoId]);
  });

  it("parses structured comparison details and keeps only allowed equipment", () => {
    const { aliases } = createModelFoodAliases([{ id: "tomato", name: "Tomato" }]);
    const [recipe] = parseRecipeJson(JSON.stringify({
      recipes: [{
        title: "Fast tomato rice",
        summary: "A quick one-pan meal",
        whyThisOption: "Choose this when time matters most.",
        totalMinutes: 15,
        differenceTags: ["fastest", "one_pan", "invented"],
        ingredients: ["Tomato 2", "Rice 1 bowl"],
        steps: ["Chop the tomato", "Cook everything in one pan", "Season and serve"],
        equipment: ["hob", "oven"],
        missingIngredients: ["Rice 1 bowl"],
        usesFoods: [{ foodId: "f1", estimatedAmount: 2, estimatedUnit: "item" }]
      }]
    }), aliases, 1, ["hob"]);

    expect(recipe.differenceTags).toEqual(["fastest", "one_pan"]);
    expect(recipe.equipment).toEqual(["hob"]);
    expect(recipe.usesFoods).toEqual([
      { foodId: "tomato", estimatedAmount: 2, estimatedUnit: "item" }
    ]);
  });

  it("rejects output that misses required foods or the time limit", () => {
    const recipes = [
      { title: "Fast", totalMinutes: 20, ingredients: ["Tomato"], steps: ["Cook quickly"], usesFoods: [{ foodId: "tomato" }] },
      { title: "Slow", totalMinutes: 60, ingredients: ["Egg"], steps: ["Simmer slowly"], usesFoods: [{ foodId: "egg" }] }
    ];
    expect(() => validateRecipeOutput(recipes, {
      requiredFoods: [{ id: "mushroom" }],
      maxMinutes: 30
    })).toThrow("REQUIRED_FOOD_MISSING");
    expect(() => validateRecipeOutput(recipes, {
      requiredFoods: [],
      maxMinutes: 15
    })).toThrow("TIME_LIMIT_MISSING");
  });

  it("reconciles a food reference when the visible ingredient clearly contains its name", () => {
    const recipes = reconcileRecipeFoodUses([{
      title: "Tomato rice",
      ingredients: ["Tomato 2", "Rice 1 bowl"],
      usesFoods: []
    }], {
      requiredFoods: [{ id: "tomato", name: "Tomato" }],
      suggestedFoods: [],
      availableFoods: []
    });

    expect(recipes[0].usesFoods).toEqual([{ foodId: "tomato" }]);
  });

  it("rejects a replacement that is not shorter when requested", () => {
    const input = {
      requiredFoods: [],
      suggestedFoods: [{ id: "tomato" }],
      availableFoods: []
    };
    const original = { title: "Tomato rice", totalMinutes: 20 };
    const replacement = {
      title: "Slow tomato rice",
      totalMinutes: 30,
      usesFoods: [{ foodId: "tomato" }]
    };
    expect(() => validateRecipeReplacement(
      replacement,
      input,
      original,
      { kind: "shorter" }
    )).toThrow("REPLACEMENT_NOT_SHORTER");
  });

  it("keeps required-food coverage across a single-option replacement", () => {
    const input = {
      requiredFoods: [{ id: "tomato" }, { id: "egg" }],
      suggestedFoods: [],
      availableFoods: []
    };
    const original = { title: "Tomato rice", totalMinutes: 20 };
    const replacement = {
      title: "Egg rice",
      totalMinutes: 18,
      differenceTags: ["fastest"],
      ingredients: ["Egg"],
      steps: ["Cook egg"],
      usesFoods: [{ foodId: "egg" }]
    };
    const otherRecipe = {
      usesFoods: [{ foodId: "tomato" }]
    };

    expect(validateRecipeReplacement(
      replacement,
      input,
      original,
      { kind: "different_method" },
      [otherRecipe]
    )).toBe(replacement);
    expect(() => validateRecipeReplacement(
      replacement,
      input,
      original,
      { kind: "different_method" },
      []
    )).toThrow("REQUIRED_FOOD_MISSING");
  });

  it("rejects a controlled adjustment when the replacement ignores its goal", () => {
    const input = {
      requiredFoods: [],
      suggestedFoods: [{ id: "tomato" }],
      availableFoods: []
    };
    const original = { title: "Tomato soup", totalMinutes: 20 };
    const replacement = {
      title: "Tomato pasta",
      totalMinutes: 18,
      differenceTags: ["fastest"],
      ingredients: ["Tomato", "Salt"],
      steps: ["Cook tomato with salt"],
      usesFoods: [{ foodId: "tomato" }]
    };

    expect(() => validateRecipeReplacement(
      replacement,
      input,
      original,
      { kind: "one_pan" }
    )).toThrow("REPLACEMENT_GOAL_MISSING");
    expect(() => validateRecipeReplacement(
      replacement,
      input,
      original,
      { kind: "missing_pantry", detail: "salt" }
    )).toThrow("REPLACEMENT_IGNORED_ADJUSTMENT");
  });

  it("treats custom kitchen labels as bounded names", () => {
    expect(normalizeCustomLabels([
      "  Tagine  ",
      "tagine",
      "miso   paste",
      "x".repeat(40),
      null
    ], 3)).toEqual(["Tagine", "miso paste", "x".repeat(24)]);
  });
});
