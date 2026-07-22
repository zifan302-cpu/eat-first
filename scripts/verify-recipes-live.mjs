const apiUrl = process.env.EAT_FIRST_API_URL ?? "http://127.0.0.1:3501/api/recipes";
const refineUrl = new URL("./recipes/refine", apiUrl).toString();

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

async function requestReplacement(request, recipe, otherRecipes, adjustment) {
  const response = await fetch(refineUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request, recipe, otherRecipes, adjustment })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${body.code ?? "UNKNOWN_ERROR"}`);
  if (!body.recipe || typeof body.recipe !== "object") {
    throw new Error("Expected one replacement recipe");
  }
  return body.recipe;
}

function assertStructuredRecipe(recipe) {
  for (const field of ["differenceTags", "equipment", "missingIngredients", "usesFoods"]) {
    if (!Array.isArray(recipe[field])) throw new Error(`Recipe is missing structured field: ${field}`);
  }
  if (!recipe.whyThisOption || typeof recipe.whyThisOption !== "string") {
    throw new Error("Recipe is missing whyThisOption");
  }
  if (recipe.usesFoods.some((food) => !food || typeof food.foodId !== "string")) {
    throw new Error("Recipe contains an invalid usesFoods entry");
  }
}

const chineseRequest = {
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
};

const englishRequest = {
  ...shared,
  locale: "en-GB",
  cuisine: "global_everyday",
  cookingGoal: "one_pan",
  equipment: ["hob", "oven"],
  customEquipment: [],
  pantryPolicy: "everyday",
  pantryStaples: ["cooking_oil", "salt", "black_pepper"],
  customPantryStaples: ["smoked paprika"]
};

const [chinese, english] = await Promise.all([
  requestRecipes(chineseRequest),
  requestRecipes(englishRequest)
]);

const visibleText = (recipes) => recipes
  .flatMap((recipe) => [
    recipe.title,
    recipe.summary,
    recipe.whyThisOption,
    ...recipe.ingredients,
    ...recipe.steps,
    ...recipe.missingIngredients
  ])
  .join(" ");
const cjk = /[\u3400-\u9fff]/u;

if (!cjk.test(visibleText(chinese))) throw new Error("Chinese response is not in Chinese");
if (cjk.test(visibleText(english))) throw new Error("English response contains Chinese user-visible text");
if (![chinese, english].every((recipes) => recipes.some((recipe) => recipe.totalMinutes <= 30))) {
  throw new Error("Each language must include an option within the requested time");
}
if ([chinese, english].flat().some((recipe) =>
  [recipe.title, recipe.summary, recipe.whyThisOption, ...recipe.ingredients, ...recipe.steps, ...recipe.missingIngredients]
    .some((line) => /\b(?:f\d+|food-[0-9a-f-]+)\b/i.test(line)))) {
  throw new Error("Internal food identifiers leaked into user-visible text");
}
[chinese, english].flat().forEach(assertStructuredRecipe);

const replacement = await requestReplacement(
  englishRequest,
  english[0],
  english.slice(1),
  { kind: "different_method" }
);
assertStructuredRecipe(replacement);
if (replacement.title.trim().toLocaleLowerCase("en-GB") === english[0].title.trim().toLocaleLowerCase("en-GB")) {
  throw new Error("Refinement did not replace the selected recipe");
}
if (cjk.test(visibleText([replacement]))) throw new Error("English replacement contains Chinese text");

console.log(JSON.stringify({
  chinese: chinese.map(({ title, totalMinutes }) => ({ title, totalMinutes })),
  english: english.map(({ title, totalMinutes }) => ({ title, totalMinutes })),
  replacement: { title: replacement.title, totalMinutes: replacement.totalMinutes },
  checks: ["two-options", "language", "time-limit", "structured-contract", "no-internal-ids", "single-option-refinement"]
}, null, 2));
