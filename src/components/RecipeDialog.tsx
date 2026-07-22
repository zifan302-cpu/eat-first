import {
  ChefHat,
  Clock3,
  LoaderCircle,
  SlidersHorizontal,
  Users,
  WandSparkles,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import { useAppState } from "../hooks/useAppState";
import { COOKING_EQUIPMENT, PANTRY_STAPLES } from "../lib/constants";
import { recipeErrorMessageKey } from "../lib/recipe-errors";
import {
  buildRecipeRequest,
  createRecipeHistoryEntry,
  generateRecipeIdeas,
  generateRecipeReplacement,
  isRecipeEligible,
  type RecipeAdjustment,
  type RecipeRequest
} from "../lib/recipes";
import { cx } from "../lib/ui";
import type {
  CookingEquipment,
  FoodItem,
  LocaleCode,
  RecipeCookingGoal,
  RecipeCuisinePreference,
  RecipeHistoryEntry,
  RecipeIdea,
  UserPreferences
} from "../types/food";
import { RecipeHistoryPanel } from "./RecipeHistoryPanel";
import { RecipeResultCard } from "./RecipeResultCard";
import {
  RecipeFoodSelector,
  type RecipeFoodRole
} from "./RecipeFoodSelector";

interface RecipeDialogProps {
  open: boolean;
  embedded?: boolean;
  suggestedFoods: FoodItem[];
  foods: FoodItem[];
  locale: LocaleCode;
  preferences: UserPreferences["recipe"];
  t: Messages;
  onClose?: () => void;
}

function createInitialRoles(foods: FoodItem[], suggestedFoods: FoodItem[]): Record<string, RecipeFoodRole> {
  const suggestedIds = new Set(suggestedFoods.filter(isRecipeEligible).slice(0, 3).map((food) => food.id));
  return Object.fromEntries(
    foods.map((food) => [food.id, suggestedIds.has(food.id) ? "suggested" : "available"])
  );
}

export function RecipeDialog({
  open,
  embedded = false,
  suggestedFoods,
  foods,
  locale,
  preferences,
  t,
  onClose
}: RecipeDialogProps): JSX.Element {
  const { state: appState, setState: setAppState } = useAppState();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);
  const wasOpenRef = useRef(false);
  const [servings, setServings] = useState<number>(preferences.defaultServings);
  const [maxMinutes, setMaxMinutes] = useState<number>(preferences.defaultMaxMinutes);
  const [dietaryNotes, setDietaryNotes] = useState(preferences.dietaryNotes);
  const [cuisine, setCuisine] = useState<RecipeCuisinePreference>(preferences.cuisine);
  const [cookingGoal, setCookingGoal] = useState<RecipeCookingGoal>("auto");
  const [equipment, setEquipment] = useState<CookingEquipment[]>([]);
  const [customEquipment, setCustomEquipment] = useState<string[]>([]);
  const [foodRoles, setFoodRoles] = useState<Record<string, RecipeFoodRole>>({});
  const [foodRoleNotice, setFoodRoleNotice] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeIdea[]>([]);
  const [activeRequest, setActiveRequest] = useState<RecipeRequest | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);
  const [refineError, setRefineError] = useState<{ index: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eligibleFoods = useMemo(() => foods.filter(isRecipeEligible), [foods]);
  const blockedCount = foods.length - eligibleFoods.length;
  const roleFoods = useMemo(() => ({
    suggested: eligibleFoods.filter((food) => foodRoles[food.id] === "suggested"),
    required: eligibleFoods.filter((food) => foodRoles[food.id] === "required"),
    available: eligibleFoods.filter((food) => (foodRoles[food.id] ?? "available") === "available"),
    excluded: eligibleFoods.filter((food) => foodRoles[food.id] === "excluded")
  }), [eligibleFoods, foodRoles]);
  const requestFoodCount = roleFoods.suggested.length + roleFoods.required.length + roleFoods.available.length;
  const foodNames = useMemo(
    () => Object.fromEntries(foods.map((food) => [food.id, food.name])),
    [foods]
  );
  const active = embedded || open;

  useEffect(() => {
    if (embedded) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [embedded, open]);

  useEffect(() => {
    if (active && !wasOpenRef.current) {
      setServings(preferences.defaultServings);
      setMaxMinutes(preferences.defaultMaxMinutes);
      setDietaryNotes(preferences.dietaryNotes);
      setCuisine(preferences.cuisine);
      setCookingGoal("auto");
      setEquipment(COOKING_EQUIPMENT.filter((item) => preferences.equipment[item]));
      setCustomEquipment(preferences.customEquipment);
      setFoodRoles(createInitialRoles(eligibleFoods, suggestedFoods));
      setFoodRoleNotice(null);
      setRecipes([]);
      setActiveRequest(null);
      setActiveHistoryId(null);
      setViewingHistory(false);
      setRefiningIndex(null);
      setRefineError(null);
      setError(null);
    }
    if (!active && wasOpenRef.current) {
      requestSequenceRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      setLoading(false);
      setRefiningIndex(null);
    }
    wasOpenRef.current = active;
  }, [active, eligibleFoods, preferences, suggestedFoods]);

  useEffect(() => () => requestRef.current?.abort(), []);

  function closeDialog() {
    requestSequenceRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setRefiningIndex(null);
    setRefineError(null);
    onClose?.();
  }

  function cancelGeneration() {
    const cancelledRefinement = refiningIndex;
    requestSequenceRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setRefiningIndex(null);
    if (cancelledRefinement !== null) {
      setRefineError({ index: cancelledRefinement, message: t.recipe.refinementCancelled });
    } else {
      setError(t.recipe.cancelled);
    }
  }

  function updateFoodRole(foodId: string, nextRole: RecipeFoodRole) {
    const currentRole = foodRoles[foodId] ?? "available";
    if (nextRole === currentRole) return;
    if (nextRole === "suggested" && roleFoods.suggested.length >= 3) {
      setFoodRoleNotice(t.recipe.suggestedLimit);
      return;
    }
    if (nextRole === "required" && roleFoods.required.length >= 3) {
      setFoodRoleNotice(t.recipe.requiredLimit);
      return;
    }
    setFoodRoleNotice(null);
    setFoodRoles((current) => ({ ...current, [foodId]: nextRole }));
  }

  function toggleEquipment(item: CookingEquipment) {
    setEquipment((current) =>
      current.includes(item)
        ? current.filter((currentItem) => currentItem !== item)
        : [...current, item]
    );
  }

  function toggleCustomEquipment(item: string) {
    setCustomEquipment((current) =>
      current.includes(item)
        ? current.filter((currentItem) => currentItem !== item)
        : [...current, item]
    );
  }

  function errorMessage(code: string): string {
    return t.recipe[recipeErrorMessageKey(code, "generation")];
  }

  function refinementErrorMessage(code: string): string {
    return t.recipe[recipeErrorMessageKey(code, "refinement")];
  }

  async function generate() {
    if (requestFoodCount === 0) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    const requestSequence = ++requestSequenceRef.current;
    let timedOut = false;
    requestRef.current = controller;
    setLoading(true);
    setRefiningIndex(null);
    setRefineError(null);
    setError(null);
    setRecipes([]);
    setViewingHistory(false);

    try {
      const request = buildRecipeRequest(
        {
          suggestedFoods: roleFoods.suggested,
          requiredFoods: roleFoods.required,
          availableFoods: roleFoods.available,
          excludedFoodIds: roleFoods.excluded.map((food) => food.id)
        },
        {
          locale,
          cuisine,
          servings,
          maxMinutes,
          cookingGoal,
          dietaryNotes,
          equipment,
          customEquipment,
          pantryPolicy: preferences.pantryPolicy,
          pantryStaples: PANTRY_STAPLES.filter((item) => preferences.pantryStaples[item]),
          customPantryStaples: preferences.customPantryStaples
        }
      );
      const timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 50_000);
      try {
        const nextRecipes = await generateRecipeIdeas(request, controller.signal);
        if (requestSequenceRef.current !== requestSequence) return;
        setRecipes(nextRecipes);
        setActiveRequest(request);
        const historyEntry = createRecipeHistoryEntry(request, nextRecipes);
        setActiveHistoryId(historyEntry.id);
        setAppState((current) => ({
          ...current,
          recipeHistory: [
            historyEntry,
            ...current.recipeHistory.filter((entry) => entry.id !== historyEntry.id)
          ].slice(0, 20)
        }));
      } finally {
        window.clearTimeout(timeout);
      }
    } catch (requestError) {
      if (requestSequenceRef.current !== requestSequence) return;
      if (timedOut) {
        setError(t.recipe.timeout);
      } else if ((requestError as Error).name !== "AbortError") {
        setError(errorMessage((requestError as Error).message));
      }
    } finally {
      if (requestRef.current === controller && requestSequenceRef.current === requestSequence) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  async function refineRecipe(index: number, adjustment: RecipeAdjustment) {
    const original = recipes[index];
    if (!activeRequest || !original || viewingHistory) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    const requestSequence = ++requestSequenceRef.current;
    let timedOut = false;
    requestRef.current = controller;
    setRefiningIndex(index);
    setRefineError(null);
    setError(null);
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 50_000);

    try {
      const replacement = await generateRecipeReplacement(
        activeRequest,
        original,
        adjustment,
        recipes.filter((_, recipeIndex) => recipeIndex !== index),
        controller.signal
      );
      if (requestSequenceRef.current !== requestSequence) return;
      const nextRecipes = recipes.map((recipe, recipeIndex) =>
        recipeIndex === index ? replacement : recipe
      );
      setRecipes(nextRecipes);
      if (activeHistoryId) {
        setAppState((current) => ({
          ...current,
          recipeHistory: current.recipeHistory.map((entry) =>
            entry.id === activeHistoryId ? { ...entry, recipes: nextRecipes } : entry
          )
        }));
      }
    } catch (requestError) {
      if (requestSequenceRef.current !== requestSequence) return;
      if (timedOut) {
        setRefineError({ index, message: t.recipe.refinementTimeout });
      } else if ((requestError as Error).name !== "AbortError") {
        setRefineError({
          index,
          message: refinementErrorMessage((requestError as Error).message)
        });
      }
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller && requestSequenceRef.current === requestSequence) {
        requestRef.current = null;
        setRefiningIndex(null);
      }
    }
  }

  function openHistory(entry: RecipeHistoryEntry) {
    cancelGeneration();
    setError(null);
    setRefineError(null);
    setRecipes(entry.recipes);
    setActiveRequest(null);
    setActiveHistoryId(entry.id);
    setViewingHistory(true);
  }

  function clearHistory() {
    setAppState((current) => ({ ...current, recipeHistory: [] }));
    if (viewingHistory) {
      setRecipes([]);
      setViewingHistory(false);
      setActiveHistoryId(null);
    }
  }

  const goalLabel = t.recipe.cookingGoals[cookingGoal];
  const equipmentNames = [
    ...equipment.map((item) => t.settings.equipmentLabels[item]),
    ...customEquipment
  ];
  const equipmentSummary = equipmentNames.length > 0
    ? [
        ...equipmentNames.slice(0, 3),
        ...(equipmentNames.length > 3 ? [`+${equipmentNames.length - 3}`] : [])
      ].join(t.recipe.summarySeparator)
    : t.recipe.noSpecialEquipment;

  const content = (
    <>
      <header className="border-b border-paper-line bg-ink p-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[0.9rem] bg-paper/10 text-[#D8CFAE]">
            <WandSparkles className="h-5 w-5" aria-hidden />
          </span>
          {!embedded ? (
            <button
              type="button"
              onClick={closeDialog}
              aria-label={t.actions.close}
              className="grid h-10 w-10 place-items-center rounded-full text-paper/75 hover:bg-paper/10"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>
        <p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#D8CFAE]">
          {t.recipe.eyebrow}
        </p>
        <h2 id="recipe-dialog-title" className="mt-2 font-editorial text-2xl font-black leading-tight">
          {t.recipe.dialogTitle}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-paper/72">{t.recipe.dialogBody}</p>
      </header>

      <div className="space-y-4 p-5">
        <RecipeHistoryPanel
          history={appState.recipeHistory}
          locale={locale}
          t={t}
          onOpen={openHistory}
          onClear={clearHistory}
        />

        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-ink-muted">
              {t.recipe.suggestedFoods}
            </p>
            <span className="text-xs font-bold text-ink-muted">
              {t.recipe.availableFoodCount.replace("{count}", String(roleFoods.available.length))}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...roleFoods.required, ...roleFoods.suggested].map((food) => (
              <span
                key={food.id}
                className={cx(
                  "fresh-pill",
                  foodRoles[food.id] === "required" ? "bg-ink text-paper" : "bg-leaf-50"
                )}
              >
                {food.name}
                {foodRoles[food.id] === "required" ? ` · ${t.recipe.requiredShort}` : ""}
              </span>
            ))}
          </div>
          {roleFoods.required.length + roleFoods.suggested.length === 0 && requestFoodCount > 0 ? (
            <p className="mt-2 text-sm font-semibold leading-5 text-ink-muted">
              {t.recipe.autoPickAvailable}
            </p>
          ) : null}
          {requestFoodCount === 0 ? (
            <p className="mt-2 rounded-[1rem] bg-[#F3E4CD] p-3 text-sm font-bold text-[#70431C]">
              {t.recipe.noFoods}
            </p>
          ) : null}
          {blockedCount > 0 ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
              {t.recipe.expiredExcluded}
            </p>
          ) : null}
        </section>

        {eligibleFoods.length > 0 ? (
          <RecipeFoodSelector
            foods={eligibleFoods}
            roles={foodRoles}
            t={t}
            notice={foodRoleNotice}
            onRoleChange={updateFoodRole}
          />
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-black text-ink">{t.recipe.dietaryNotes}</span>
          <input
            value={dietaryNotes}
            maxLength={240}
            onChange={(event) => setDietaryNotes(event.target.value)}
            placeholder={t.recipe.dietaryPlaceholder}
            className="fresh-field"
          />
        </label>

        <details className="group rounded-[1rem] border border-paper-line bg-paper">
          <summary className="cursor-pointer list-none px-4 py-3 marker:hidden">
            <span className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-leaf-700" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-ink">{t.recipe.mealSetup}</span>
                <span className="block truncate text-xs font-medium text-ink-muted">
                  {servings} {t.recipe.peopleUnit}{t.recipe.summarySeparator}{maxMinutes} {t.recipe.minutes}
                  {t.recipe.summarySeparator}{goalLabel}
                </span>
              </span>
              <span className="text-xs font-black text-leaf-700 group-open:hidden">{t.recipe.adjust}</span>
            </span>
          </summary>

          <div className="space-y-4 border-t border-paper-line p-4">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink">
                  <Users className="h-4 w-4" aria-hidden /> {t.recipe.servings}
                </span>
                <select
                  value={servings}
                  onChange={(event) => setServings(Number(event.target.value))}
                  className="fresh-field"
                >
                  {[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink">
                  <Clock3 className="h-4 w-4" aria-hidden /> {t.recipe.maxTime}
                </span>
                <select
                  value={maxMinutes}
                  onChange={(event) => setMaxMinutes(Number(event.target.value))}
                  className="fresh-field"
                >
                  {[15, 30, 45, 60].map((value) => (
                    <option key={value} value={value}>{value} {t.recipe.minutes}</option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-black text-ink">{t.recipe.cookingGoal}</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(t.recipe.cookingGoals) as RecipeCookingGoal[]).map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    aria-pressed={cookingGoal === goal}
                    onClick={() => setCookingGoal(goal)}
                    className={cx(
                      "fresh-pill border transition",
                      cookingGoal === goal
                        ? "border-leaf-700 bg-leaf-700 text-paper"
                        : "border-paper-line bg-paper-soft text-ink-muted"
                    )}
                  >
                    {t.recipe.cookingGoals[goal]}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-ink">{t.recipe.cuisine}</span>
              <select
                value={cuisine}
                onChange={(event) => setCuisine(event.target.value as RecipeCuisinePreference)}
                className="fresh-field"
              >
                <option value="auto">{t.recipe.cuisineAuto}</option>
                <option value="chinese_home">{t.recipe.cuisineChinese}</option>
                <option value="global_everyday">{t.recipe.cuisineGlobal}</option>
              </select>
            </label>
          </div>
        </details>

        <details className="group rounded-[1rem] border border-paper-line bg-paper">
          <summary className="cursor-pointer list-none px-4 py-3 marker:hidden">
            <span className="flex items-center gap-3">
              <ChefHat className="h-4 w-4 shrink-0 text-leaf-700" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-ink">{t.recipe.equipmentForThisMeal}</span>
                <span className="block truncate text-xs font-medium text-ink-muted">{equipmentSummary}</span>
              </span>
              <span className="text-xs font-black text-leaf-700 group-open:hidden">{t.recipe.temporaryAdjust}</span>
            </span>
          </summary>
          <div className="border-t border-paper-line p-4">
            <p className="mb-3 text-xs font-medium leading-5 text-ink-muted">
              {t.recipe.equipmentHint}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COOKING_EQUIPMENT.map((item) => {
                const selected = equipment.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleEquipment(item)}
                    className={cx(
                      "min-h-10 rounded-[0.8rem] border px-2 text-xs font-bold transition",
                      selected
                        ? "border-ink bg-ink text-paper"
                        : "border-paper-line bg-paper-soft text-ink-muted"
                    )}
                  >
                    {t.settings.equipmentLabels[item]}
                  </button>
                );
              })}
            </div>
            {preferences.customEquipment.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-ink-muted">
                  {t.settings.customEquipment}
                </p>
                <div className="flex flex-wrap gap-2">
                  {preferences.customEquipment.map((item) => {
                    const selected = customEquipment.includes(item);
                    return (
                      <button
                        key={item.toLocaleLowerCase()}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleCustomEquipment(item)}
                        className={cx(
                          "fresh-pill border transition",
                          selected
                            ? "border-ink bg-ink text-paper"
                            : "border-paper-line bg-paper-soft text-ink-muted"
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </details>

        <p className="text-xs font-medium leading-5 text-ink-muted">
          {t.recipe.pantrySummary.replace(
            "{policy}",
            t.settings.pantryPolicies[preferences.pantryPolicy]
          )}
          {preferences.customPantryStaples.length > 0
            ? ` ${t.recipe.customPantryCount.replace("{count}", String(preferences.customPantryStaples.length))}`
            : ""}
        </p>

        {error ? (
          <p role="alert" className="rounded-[1rem] border border-tomato/20 bg-[#F3DDD3] p-3 text-sm font-bold leading-5 text-tomato">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={cancelGeneration} className="fresh-button-secondary">
              {t.actions.cancelGeneration}
            </button>
            <button type="button" disabled className="fresh-button-primary opacity-60">
              <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
              {t.recipe.generating}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={requestFoodCount === 0}
            onClick={() => void generate()}
            className="fresh-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.recipe.generate}
          </button>
        )}

        {recipes.length > 0 ? (
          <section className="space-y-4 border-t border-paper-line pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="fresh-eyebrow">{t.recipe.compareEyebrow}</p>
                <h3 className="mt-1 font-editorial text-xl font-black text-ink">
                  {viewingHistory ? t.recipe.historyResultTitle : t.recipe.compareTitle}
                </h3>
              </div>
              {viewingHistory ? (
                <span className="fresh-pill bg-paper">{t.recipe.historyBadge}</span>
              ) : null}
            </div>
            {recipes.map((recipe, index) => (
              <RecipeResultCard
                key={`${activeHistoryId ?? "current"}-${index}`}
                recipe={recipe}
                index={index}
                locale={locale}
                foodNames={foodNames}
                t={t}
                canRefine={!viewingHistory && activeRequest !== null}
                refining={refiningIndex === index}
                error={refineError?.index === index ? refineError.message : undefined}
                onRefine={(adjustment) => void refineRecipe(index, adjustment)}
                onCancel={cancelGeneration}
                onDismissError={() => setRefineError(null)}
              />
            ))}
          </section>
        ) : null}

        <p className="text-xs font-semibold leading-5 text-ink-muted">{t.recipe.boundary}</p>
      </div>
    </>
  );

  if (embedded) {
    return (
      <section
        aria-labelledby="recipe-dialog-title"
        className="overflow-hidden rounded-[1.6rem] border border-ink/20 bg-paper-soft text-ink shadow-lift"
      >
        {content}
      </section>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="recipe-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-[1.6rem] border border-ink/20 bg-paper-soft p-0 text-ink shadow-lift backdrop:bg-ink/45"
    >
      {content}
    </dialog>
  );
}
