import { afterEach, describe, expect, it, vi } from "vitest";
import barcodeHandler from "../api/barcode/[code].mjs";
import recipesHandler from "../api/recipes.mjs";
import refineHandler from "../api/recipes/refine.mjs";

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(payload) {
      this.body = payload ? JSON.parse(payload) : null;
    }
  };
}

function modelResponse(recipes) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ recipes }) } }]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

const recipeRequest = {
  locale: "en-GB",
  cuisine: "global_everyday",
  servings: 1,
  maxMinutes: 30,
  cookingGoal: "auto",
  dietaryNotes: "",
  equipment: ["hob"],
  customEquipment: [],
  pantryPolicy: "everyday",
  pantryStaples: ["cooking_oil", "salt"],
  customPantryStaples: [],
  requiredFoods: [{
    id: "tomato",
    name: "Tomato",
    quantityText: "2",
    dateLabelType: "use_by",
    urgency: "use_today"
  }],
  suggestedFoods: [],
  availableFoods: [{
    id: "egg",
    name: "Egg",
    quantityText: "2",
    dateLabelType: "use_by",
    urgency: "use_soon"
  }],
  excludedFoodIds: []
};

describe("explicit Vercel API routes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.QWEN_API_KEY;
    delete process.env.QWEN_BASE_URL;
  });

  it("routes the nested recipe refinement endpoint through the shared handler", async () => {
    const response = createResponse();
    await refineHandler({
      url: "/api/recipes/refine",
      method: "GET",
      headers: { host: "localhost", "x-forwarded-for": "routing-test" }
    }, response);

    expect(response.statusCode).toBe(405);
    expect(response.body).toEqual({ code: "METHOD_NOT_ALLOWED" });
  });

  it("routes a dynamic barcode path and returns the upstream product", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({
      status: 1,
      product: {
        product_name: "Schweppes lemonade",
        brands: "Schweppes",
        quantity: "2l",
        categories_tags: ["en:lemonades", "en:beverages"]
      }
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const response = createResponse();

    await barcodeHandler({
      url: "/api/barcode/5000193900861?locale=en-GB",
      method: "GET",
      headers: { host: "localhost", "x-forwarded-for": "barcode-routing-test" }
    }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.product).toMatchObject({
      barcode: "5000193900861",
      name: "Schweppes lemonade",
      brand: "Schweppes",
      quantityText: "2l",
      category: "drink"
    });
  });

  it("repairs one contract failure instead of returning a transient 502", async () => {
    process.env.QWEN_API_KEY = "test-key";
    process.env.QWEN_BASE_URL = "https://example.test/v1";
    const invalidRecipes = [
      {
        title: "Egg rice",
        summary: "Fast",
        whyThisOption: "Fastest",
        totalMinutes: 15,
        differenceTags: ["fastest"],
        ingredients: ["Egg 2", "Rice 1 bowl"],
        steps: ["Cook the egg", "Fold through rice"],
        equipment: ["hob"],
        missingIngredients: ["Rice"],
        usesFoods: [{ foodId: "f2" }]
      },
      {
        title: "Egg soup",
        summary: "Light",
        whyThisOption: "Less preparation",
        totalMinutes: 20,
        differenceTags: [],
        ingredients: ["Egg 2", "Stock 300 ml"],
        steps: ["Heat the stock", "Stir in the egg"],
        equipment: ["hob"],
        missingIngredients: ["Stock"],
        usesFoods: [{ foodId: "f2" }]
      }
    ];
    const repairedRecipes = [
      {
        ...invalidRecipes[0],
        title: "Tomato egg rice",
        ingredients: ["Tomato 2", "Egg 1", "Rice 1 bowl"],
        usesFoods: [{ foodId: "f1" }, { foodId: "f2" }]
      },
      invalidRecipes[1]
    ];
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(modelResponse(invalidRecipes))
      .mockResolvedValueOnce(modelResponse(repairedRecipes));
    const response = createResponse();

    await recipesHandler({
      url: "/api/recipes",
      method: "POST",
      headers: { host: "localhost", "x-forwarded-for": "repair-test" },
      body: recipeRequest
    }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.recipes).toHaveLength(2);
    expect(response.body.recipes[0].usesFoods.map((food) => food.foodId)).toContain("tomato");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("serves a real single-option refinement through the nested route", async () => {
    process.env.QWEN_API_KEY = "test-key";
    process.env.QWEN_BASE_URL = "https://example.test/v1";
    const replacement = {
      title: "Roasted tomato rice",
      summary: "A different main method",
      whyThisOption: "Choose this for a more hands-off result.",
      totalMinutes: 25,
      differenceTags: [],
      ingredients: ["Tomato 2", "Rice 1 bowl"],
      steps: ["Roast the tomato", "Fold through the rice"],
      equipment: ["hob"],
      missingIngredients: ["Rice"],
      usesFoods: [{ foodId: "f1" }]
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(modelResponse([replacement]));
    const response = createResponse();

    await refineHandler({
      url: "/api/recipes/refine",
      method: "POST",
      headers: { host: "localhost", "x-forwarded-for": "refine-post-test" },
      body: {
        request: recipeRequest,
        recipe: {
          title: "Tomato egg rice",
          summary: "Fast",
          whyThisOption: "Fastest",
          totalMinutes: 15,
          differenceTags: ["fastest"],
          ingredients: ["Tomato 2", "Egg 1", "Rice 1 bowl"],
          steps: ["Cook the tomato", "Fold through the rice"],
          equipment: ["hob"],
          missingIngredients: ["Rice"],
          usesFoods: [{ foodId: "tomato" }, { foodId: "egg" }]
        },
        otherRecipes: [],
        adjustment: { kind: "different_method" }
      }
    }, response);

    expect(response.statusCode).toBe(200);
    expect(response.body.recipe.title).toBe("Roasted tomato rice");
    expect(response.body.recipe.usesFoods[0].foodId).toBe("tomato");
  });

  it("returns a stable 422 code after the single repair attempt also fails", async () => {
    process.env.QWEN_API_KEY = "test-key";
    process.env.QWEN_BASE_URL = "https://example.test/v1";
    const invalidRecipes = [
      {
        title: "Egg rice",
        summary: "Fast",
        whyThisOption: "Fastest",
        totalMinutes: 15,
        differenceTags: ["fastest"],
        ingredients: ["Egg 2", "Rice 1 bowl"],
        steps: ["Cook the egg", "Fold through rice"],
        equipment: ["hob"],
        missingIngredients: ["Rice"],
        usesFoods: [{ foodId: "f2" }]
      },
      {
        title: "Egg soup",
        summary: "Light",
        whyThisOption: "Less preparation",
        totalMinutes: 20,
        differenceTags: [],
        ingredients: ["Egg 2", "Stock 300 ml"],
        steps: ["Heat the stock", "Stir in the egg"],
        equipment: ["hob"],
        missingIngredients: ["Stock"],
        usesFoods: [{ foodId: "f2" }]
      }
    ];
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(modelResponse(invalidRecipes))
      .mockResolvedValueOnce(modelResponse(invalidRecipes));
    const response = createResponse();

    await recipesHandler({
      url: "/api/recipes",
      method: "POST",
      headers: { host: "localhost", "x-forwarded-for": "repair-failure-test" },
      body: recipeRequest
    }, response);

    expect(response.statusCode).toBe(422);
    expect(response.body).toEqual({ code: "RECIPE_CONSTRAINT_MISMATCH" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
