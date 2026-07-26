import { Check, ChefHat, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import { quantityLabel } from "../lib/quantity";
import { cx } from "../lib/ui";
import type {
  FoodItem,
  LocaleCode,
  RecipeCookedFoodUse,
  RecipeFoodUseOutcome,
  RecipeIdea
} from "../types/food";

interface RecipeCookedSheetProps {
  recipe: RecipeIdea;
  foods: FoodItem[];
  locale: LocaleCode;
  t: Messages;
  onClose(): void;
  onConfirm(uses: RecipeCookedFoodUse[]): void;
}

interface UsageDraft {
  foodId: string;
  outcome: RecipeFoodUseOutcome;
  remainingInput: string;
}

function initialDrafts(recipe: RecipeIdea, foods: FoodItem[]): UsageDraft[] {
  return recipe.usesFoods.map((recipeUse) => {
    const food = foods.find((item) => item.id === recipeUse.foodId);
    if (!food || food.status !== "active") {
      return { foodId: recipeUse.foodId, outcome: "not_used", remainingInput: "" };
    }
    if (
      typeof food.quantityAmount === "number" &&
      typeof recipeUse.estimatedAmount === "number" &&
      food.quantityUnit === recipeUse.estimatedUnit
    ) {
      const remaining = Math.max(0, food.quantityAmount - recipeUse.estimatedAmount);
      return {
        foodId: food.id,
        outcome: remaining === 0 ? "all" : "part",
        remainingInput: remaining === 0 ? "" : String(Number(remaining.toFixed(2)))
      };
    }
    return {
      foodId: food.id,
      outcome: typeof food.quantityAmount === "number" ? "not_used" : "part",
      remainingInput: ""
    };
  });
}

export function RecipeCookedSheet({
  recipe,
  foods,
  locale,
  t,
  onClose,
  onConfirm
}: RecipeCookedSheetProps): JSX.Element {
  const [drafts, setDrafts] = useState<UsageDraft[]>(() => initialDrafts(recipe, foods));
  const formatNumber = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    [locale]
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const invalidFoodIds = new Set(
    drafts.flatMap((draft) => {
      if (draft.outcome !== "part") return [];
      const food = foods.find((item) => item.id === draft.foodId);
      if (!food || typeof food.quantityAmount !== "number") return [];
      const remaining = Number(draft.remainingInput);
      return draft.remainingInput.trim() !== "" &&
        Number.isFinite(remaining) &&
        remaining >= 0 &&
        remaining < food.quantityAmount
        ? []
        : [food.id];
    })
  );

  function updateDraft(foodId: string, patch: Partial<UsageDraft>) {
    setDrafts((current) =>
      current.map((draft) => (draft.foodId === foodId ? { ...draft, ...patch } : draft))
    );
  }

  function confirm() {
    if (invalidFoodIds.size > 0) return;
    onConfirm(
      drafts.map((draft) => {
        const food = foods.find((item) => item.id === draft.foodId);
        if (
          draft.outcome === "part" &&
          food &&
          typeof food.quantityAmount === "number"
        ) {
          return {
            foodId: draft.foodId,
            outcome: "part",
            remainingAmount: Number(draft.remainingInput)
          };
        }
        return { foodId: draft.foodId, outcome: draft.outcome };
      })
    );
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-ink/45 p-3 sm:items-center sm:justify-center"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-cooked-title"
        className="paper-canvas max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.55rem] border border-ink/15 p-4 shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
            <ChefHat className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="fresh-eyebrow">{recipe.title}</p>
            <h2 id="recipe-cooked-title" className="mt-1 font-editorial text-xl font-black text-ink">
              {t.recipe.confirmUseTitle}
            </h2>
            <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">
              {t.recipe.confirmUseBody}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-paper"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="mt-4 space-y-3">
          {recipe.usesFoods.map((recipeUse) => {
            const food = foods.find((item) => item.id === recipeUse.foodId);
            const draft = drafts.find((item) => item.foodId === recipeUse.foodId);
            if (!draft) return null;
            const currentAmount = food ? quantityLabel(food, locale) : undefined;
            const estimate =
              recipeUse.estimatedAmount && recipeUse.estimatedUnit
                ? `${formatNumber.format(recipeUse.estimatedAmount)} ${t.quantityUnits[recipeUse.estimatedUnit]}`
                : undefined;
            const unavailable = !food || food.status !== "active";

            return (
              <article key={recipeUse.foodId} className="rounded-[1rem] border border-paper-line bg-paper p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-ink">
                      {food?.name ?? t.recipe.unknownHistoryFood}
                    </h3>
                    <div className="mt-1 space-y-0.5 text-[0.68rem] font-semibold text-ink-muted">
                      {currentAmount ? (
                        <p>{t.recipe.currentAmount.replace("{amount}", currentAmount)}</p>
                      ) : null}
                      {estimate ? (
                        <p>{t.recipe.estimatedUse.replace("{amount}", estimate)}</p>
                      ) : null}
                    </div>
                  </div>
                  {unavailable ? (
                    <span className="fresh-pill bg-paper-soft text-ink-muted">
                      {t.status[food?.status ?? "eaten"]}
                    </span>
                  ) : null}
                </div>

                {unavailable ? (
                  <p className="mt-3 text-xs font-semibold leading-5 text-ink-muted">
                    {t.recipe.missingCurrentFood}
                  </p>
                ) : (
                  <>
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {([
                        ["all", t.recipe.outcomeAll],
                        ["part", t.recipe.outcomePart],
                        ["not_used", t.recipe.outcomeNone]
                      ] as const).map(([outcome, label]) => (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => updateDraft(food.id, { outcome })}
                          className={cx(
                            "min-h-10 rounded-[0.8rem] border px-2 text-[0.68rem] font-black transition",
                            draft.outcome === outcome
                              ? "border-ink bg-ink text-paper"
                              : "border-paper-line bg-paper-soft text-ink-muted"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {draft.outcome === "part" && typeof food.quantityAmount === "number" ? (
                      <label className="mt-3 block">
                        <span className="mb-1.5 block text-xs font-black text-ink">
                          {t.recipe.remainingAfterCooking}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={food.quantityAmount}
                            step="any"
                            value={draft.remainingInput}
                            onChange={(event) =>
                              updateDraft(food.id, { remainingInput: event.target.value })
                            }
                            className="fresh-field"
                          />
                          <span className="min-w-12 text-sm font-black text-ink-muted">
                            {t.quantityUnits[food.quantityUnit ?? "item"]}
                          </span>
                        </div>
                        {invalidFoodIds.has(food.id) ? (
                          <span className="mt-1.5 block text-xs font-bold text-tomato">
                            {t.recipe.invalidRemaining}
                          </span>
                        ) : null}
                      </label>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
          <button type="button" onClick={onClose} className="fresh-button-secondary">
            {t.actions.cancel}
          </button>
          <button
            type="button"
            disabled={invalidFoodIds.size > 0}
            onClick={confirm}
            className="fresh-button-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="mr-2 inline h-4 w-4" aria-hidden />
            {t.recipe.confirmAndUpdate}
          </button>
        </div>
      </section>
    </div>
  );
}
