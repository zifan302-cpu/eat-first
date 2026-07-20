import { Clock3, LoaderCircle, Users, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import type { FoodItem, LocaleCode } from "../types/food";
import { buildRecipeRequest, generateRecipeIdeas, isRecipeEligible, type RecipeIdea } from "../lib/recipes";

interface RecipeDialogProps {
  open: boolean;
  foods: FoodItem[];
  locale: LocaleCode;
  t: Messages;
  onClose: () => void;
}

export function RecipeDialog({ open, foods, locale, t, onClose }: RecipeDialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [servings, setServings] = useState(1);
  const [maxMinutes, setMaxMinutes] = useState(30);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [recipes, setRecipes] = useState<RecipeIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eligibleFoods = useMemo(() => foods.filter(isRecipeEligible), [foods]);
  const blockedCount = foods.length - eligibleFoods.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function generate() {
    if (eligibleFoods.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const request = buildRecipeRequest(eligibleFoods, locale, servings, maxMinutes, dietaryNotes);
      setRecipes(await generateRecipeIdeas(request));
    } catch (requestError) {
      const code = (requestError as Error).message;
      setError(code === "AI_NOT_CONFIGURED" ? t.recipe.notConfigured : t.recipe.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="recipe-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
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
            onClick={onClose}
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
            {eligibleFoods.map((food) => (
              <span key={food.id} className="fresh-pill bg-leaf-50">{food.name}</span>
            ))}
          </div>
          {eligibleFoods.length === 0 ? (
            <p className="rounded-[1rem] bg-[#F3E4CD] p-3 text-sm font-bold text-[#70431C]">
              {t.recipe.noFoods}
            </p>
          ) : null}
          {blockedCount > 0 ? (
            <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{t.recipe.expiredExcluded}</p>
          ) : null}
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
          <span className="mb-2 block text-sm font-black text-ink">{t.recipe.dietaryNotes}</span>
          <input
            value={dietaryNotes}
            maxLength={240}
            onChange={(event) => setDietaryNotes(event.target.value)}
            placeholder={t.recipe.dietaryPlaceholder}
            className="fresh-field"
          />
        </label>

        {error ? (
          <p className="rounded-[1rem] border border-tomato/20 bg-[#F3DDD3] p-3 text-sm font-bold leading-5 text-tomato">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={loading || eligibleFoods.length === 0}
          onClick={() => void generate()}
          className="fresh-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden /> : null}
          {loading ? t.recipe.generating : t.recipe.generate}
        </button>

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
