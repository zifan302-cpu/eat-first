import { Clock3, LoaderCircle, Users, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import { COOKING_APPLIANCES } from "../lib/constants";
import {
  buildRecipeRequest,
  generateRecipeIdeas,
  isRecipeEligible,
  type RecipeIdea
} from "../lib/recipes";
import { cx } from "../lib/ui";
import type {
  CookingAppliance,
  FoodItem,
  LocaleCode,
  RecipeCuisinePreference,
  UserPreferences
} from "../types/food";

interface RecipeDialogProps {
  open: boolean;
  priorityFoods: FoodItem[];
  foods: FoodItem[];
  locale: LocaleCode;
  preferences: UserPreferences["recipe"];
  t: Messages;
  onClose: () => void;
}

export function RecipeDialog({
  open,
  priorityFoods,
  foods,
  locale,
  preferences,
  t,
  onClose
}: RecipeDialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const wasOpenRef = useRef(false);
  const [servings, setServings] = useState<number>(preferences.defaultServings);
  const [maxMinutes, setMaxMinutes] = useState<number>(preferences.defaultMaxMinutes);
  const [dietaryNotes, setDietaryNotes] = useState(preferences.dietaryNotes);
  const [cuisine, setCuisine] = useState<RecipeCuisinePreference>(preferences.cuisine);
  const [appliances, setAppliances] = useState<CookingAppliance[]>([]);
  const [selectedSupportingIds, setSelectedSupportingIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligiblePriorityFoods = useMemo(
    () => priorityFoods.filter(isRecipeEligible).slice(0, 3),
    [priorityFoods]
  );
  const priorityIds = useMemo(
    () => new Set(eligiblePriorityFoods.map((food) => food.id)),
    [eligiblePriorityFoods]
  );
  const supportingFoods = useMemo(
    () => foods.filter((food) => isRecipeEligible(food) && !priorityIds.has(food.id)).slice(0, 5),
    [foods, priorityIds]
  );
  const blockedCount = foods.filter((food) => !isRecipeEligible(food)).length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setServings(preferences.defaultServings);
      setMaxMinutes(preferences.defaultMaxMinutes);
      setDietaryNotes(preferences.dietaryNotes);
      setCuisine(preferences.cuisine);
      setAppliances(
        COOKING_APPLIANCES.filter((appliance) => preferences.appliances[appliance])
      );
      setSelectedSupportingIds(supportingFoods.map((food) => food.id));
      setRecipes([]);
      setError(null);
    }
    if (!open && wasOpenRef.current) {
      requestRef.current?.abort();
      requestRef.current = null;
      setLoading(false);
    }
    wasOpenRef.current = open;
  }, [open, preferences, supportingFoods]);

  useEffect(() => () => requestRef.current?.abort(), []);

  function closeDialog() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    onClose();
  }

  function toggleSupportingFood(id: string) {
    setSelectedSupportingIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 5)
    );
  }

  function toggleAppliance(appliance: CookingAppliance) {
    setAppliances((current) =>
      current.includes(appliance)
        ? current.filter((item) => item !== appliance)
        : [...current, appliance]
    );
  }

  function errorMessage(code: string): string {
    if (code === "AI_NOT_CONFIGURED") return t.recipe.notConfigured;
    if (code === "RATE_LIMITED") return t.recipe.rateLimited;
    if (code === "RECIPE_TIMEOUT") return t.recipe.timeout;
    if (code === "RECIPE_GENERATION_FAILED") return t.recipe.invalidResponse;
    return t.recipe.error;
  }

  async function generate() {
    if (eligiblePriorityFoods.length === 0) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const selectedSupportingFoods = supportingFoods.filter((food) =>
        selectedSupportingIds.includes(food.id)
      );
      const request = buildRecipeRequest(eligiblePriorityFoods, selectedSupportingFoods, {
        locale,
        cuisine,
        servings,
        maxMinutes,
        dietaryNotes,
        appliances
      });
      setRecipes(await generateRecipeIdeas(request, controller.signal));
    } catch (requestError) {
      if ((requestError as Error).name !== "AbortError") {
        setError(errorMessage((requestError as Error).message));
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  const applianceLabels: Record<CookingAppliance, string> = {
    oven: t.settings.applianceOven,
    microwave: t.settings.applianceMicrowave,
    air_fryer: t.settings.applianceAirFryer,
    rice_cooker: t.settings.applianceRiceCooker
  };

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
      <header className="border-b border-paper-line bg-ink p-5 text-paper">
        <div className="flex items-center justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[0.9rem] bg-paper/10 text-[#D8CFAE]">
            <WandSparkles className="h-5 w-5" aria-hidden />
          </span>
          <button
            type="button"
            onClick={closeDialog}
            aria-label={t.actions.close}
            className="grid h-10 w-10 place-items-center rounded-full text-paper/75 hover:bg-paper/10"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#D8CFAE]">
          {t.recipe.eyebrow}
        </p>
        <h2 id="recipe-dialog-title" className="mt-2 font-editorial text-2xl font-black leading-tight">
          {t.recipe.dialogTitle}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-paper/72">{t.recipe.dialogBody}</p>
      </header>

      <div className="space-y-5 p-5">
        <section>
          <p className="mb-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-ink-muted">
            {t.recipe.currentFoods}
          </p>
          <div className="flex flex-wrap gap-2">
            {eligiblePriorityFoods.map((food) => (
              <span key={food.id} className="fresh-pill bg-leaf-50">{food.name}</span>
            ))}
          </div>
          {eligiblePriorityFoods.length === 0 ? (
            <p className="rounded-[1rem] bg-[#F3E4CD] p-3 text-sm font-bold text-[#70431C]">
              {t.recipe.noFoods}
            </p>
          ) : null}
          {blockedCount > 0 ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{t.recipe.expiredExcluded}</p>
          ) : null}
        </section>

        <section>
          <p className="text-sm font-black text-ink">{t.recipe.supportingFoods}</p>
          <p className="mt-1 text-xs font-medium leading-5 text-ink-muted">{t.recipe.supportingHint}</p>
          {supportingFoods.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {supportingFoods.map((food) => {
                const selected = selectedSupportingIds.includes(food.id);
                return (
                  <button
                    key={food.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleSupportingFood(food.id)}
                    className={cx(
                      "fresh-pill border transition",
                      selected
                        ? "border-leaf-700 bg-leaf-700 text-paper"
                        : "border-paper-line bg-paper text-ink-muted"
                    )}
                  >
                    {food.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-ink-muted">{t.recipe.noSupporting}</p>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink">
              <Users className="h-4 w-4" aria-hidden /> {t.recipe.servings}
            </span>
            <select value={servings} onChange={(event) => setServings(Number(event.target.value))} className="fresh-field">
              {[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-black text-ink">
              <Clock3 className="h-4 w-4" aria-hidden /> {t.recipe.maxTime}
            </span>
            <select value={maxMinutes} onChange={(event) => setMaxMinutes(Number(event.target.value))} className="fresh-field">
              {[15, 30, 45, 60].map((value) => <option key={value} value={value}>{value} {t.recipe.minutes}</option>)}
            </select>
          </label>
        </div>

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

        <fieldset>
          <legend className="mb-2 text-sm font-black text-ink">{t.settings.appliances}</legend>
          <div className="flex flex-wrap gap-2">
            {COOKING_APPLIANCES.map((appliance) => {
              const selected = appliances.includes(appliance);
              return (
                <button
                  key={appliance}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleAppliance(appliance)}
                  className={cx(
                    "fresh-pill border transition",
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-paper-line bg-paper text-ink-muted"
                  )}
                >
                  {applianceLabels[appliance]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <p className="rounded-[1rem] border border-tomato/20 bg-[#F3DDD3] p-3 text-sm font-bold leading-5 text-tomato">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => requestRef.current?.abort()} className="fresh-button-secondary">
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
            disabled={eligiblePriorityFoods.length === 0}
            onClick={() => void generate()}
            className="fresh-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.recipe.generate}
          </button>
        )}

        {recipes.length > 0 ? (
          <section className="space-y-4 border-t border-paper-line pt-5">
            {recipes.map((recipe, index) => (
              <article key={`${recipe.title}-${index}`} className="rounded-[1.2rem] border border-paper-line bg-paper p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.62rem] font-black uppercase tracking-wider text-leaf-700">
                      {t.recipe.option} {index + 1}
                    </p>
                    <h3 className="mt-1 font-editorial text-xl font-black leading-tight text-ink">{recipe.title}</h3>
                  </div>
                  <span className="fresh-pill shrink-0">{recipe.totalMinutes} {t.recipe.minutes}</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-ink-muted">{recipe.summary}</p>
                <h4 className="mt-4 text-sm font-black text-ink">{t.recipe.ingredients}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium leading-5 text-ink-muted">
                  {recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
                </ul>
                <h4 className="mt-4 text-sm font-black text-ink">{t.recipe.steps}</h4>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm font-medium leading-5 text-ink-muted">
                  {recipe.steps.map((step, stepIndex) => <li key={`${stepIndex}-${step}`}>{step}</li>)}
                </ol>
              </article>
            ))}
          </section>
        ) : null}

        <p className="text-xs font-semibold leading-5 text-ink-muted">{t.recipe.boundary}</p>
      </div>
    </dialog>
  );
}
