const apiUrl = process.env.EAT_FIRST_API_URL ?? "http://127.0.0.1:3501/api/recipes";

const shared = {
  servings: 2,
  maxMinutes: 30,
  cookingGoal: "auto",
  dietaryNotes: "",
  requiredFoods: [
    { id: "tomato", name: "tomato", quantityText: "2", dateLabelType: "use_by", urgency: "use_today" }
  ],
  suggestedFoods: [
    { id: "eggs", name: "eggs", quantityText: "4", dateLabelType: "use_by", urgency: "use_soon" }
  ],
  availableFoods: [
    { id: "spinach", name: "spinach", quantityText: "150 g", dateLabelType: "use_by", urgency: "soon" },
    { id: "rice", name: "cooked rice", quantityText: "2 portions", dateLabelType: "none", urgency: "normal" }
  ]
};

async function requestRecipes(input) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${body.code ?? "UNKNOWN_ERROR"}`);
  if (!Array.isArray(body.recipes) || body.recipes.length !== 2) {
    throw new Error("Expected exactly two recipes");
  }
  return body.recipes;
}

const [chinese, english] = await Promise.all([
  requestRecipes({
    ...shared,
    locale: "zh-CN",
    cuisine: "auto",
    cookingGoal: "rescue_more",
    equipment: ["hob", "rice_cooker", "steamer"],
    customEquipment: ["tagine"],
    pantryPolicy: "strict",
    pantryStaples: ["cooking_oil", "salt", "soy_sauce"],
    customPantryStaples: ["miso paste"],
    requiredFoods: shared.requiredFoods.map((food) => ({
      ...food,
      name: "番茄"
    })),
    suggestedFoods: shared.suggestedFoods.map((food) => ({
      ...food,
      name: "鸡蛋"
    })),
    availableFoods: shared.availableFoods.map((food) => ({
      ...food,
      name: food.id === "spinach" ? "菠菜" : "熟米饭"
    }))
  }),
  requestRecipes({
    ...shared,
    locale: "en-GB",
    cuisine: "global_everyday",
    cookingGoal: "one_pan",
    equipment: ["hob", "oven"],
    customEquipment: [],
    pantryPolicy: "everyday",
    pantryStaples: ["cooking_oil", "salt", "black_pepper"],
    customPantryStaples: ["smoked paprika"]
  })
]);

const visibleText = (recipes) => recipes
  .flatMap((recipe) => [recipe.title, recipe.summary, ...recipe.ingredients, ...recipe.steps])
  .join(" ");
const cjk = /[\u3400-\u9fff]/u;

if (!cjk.test(visibleText(chinese))) throw new Error("Chinese response is not in Chinese");
if (cjk.test(visibleText(english))) throw new Error("English response contains Chinese user-visible text");
if (![chinese, english].every((recipes) => recipes.some((recipe) => recipe.totalMinutes <= 30))) {
  throw new Error("Each language must include an option within the requested time");
}
if ([chinese, english].flat().some((recipe) =>
  [...recipe.ingredients, ...recipe.steps].some((line) => /\b(?:f\d+|food-[0-9a-f-]+)\b/i.test(line)))) {
  throw new Error("Internal food identifiers leaked into user-visible text");
}

console.log(JSON.stringify({
  chinese: chinese.map(({ title, totalMinutes }) => ({ title, totalMinutes })),
  english: english.map(({ title, totalMinutes }) => ({ title, totalMinutes })),
  checks: ["two-options", "language", "time-limit", "no-internal-ids"]
}, null, 2));
