import {
  ChefHat,
  Clock3,
  LoaderCircle,
  PackageOpen,
  RefreshCw,
  Refrigerator,
  SlidersHorizontal
} from "lucide-react";
import { useState } from "react";
import type { Messages } from "../i18n/en-GB";
import type { RecipeAdjustment } from "../lib/recipes";
import { cx } from "../lib/ui";
import type {
  CookingEquipment,
  LocaleCode,
  RecipeAdjustmentKind,
  RecipeIdea
} from "../types/food";

interface RecipeResultCardProps {
  recipe: RecipeIdea;
  index: number;
  locale: LocaleCode;
  foodNames: Record<string, string>;
  t: Messages;
  canRefine: boolean;
  refining: boolean;
  onRefine: (adjustment: RecipeAdjustment) => void;
  onCancel: () => void;
}

const quickAdjustments: RecipeAdjustmentKind[] = [
  "shorter",
  "one_pan",
  "lunchbox",
  "different_method"
];

export function RecipeResultCard({
  recipe,
  index,
  locale,
  foodNames,
  t,
  canRefine,
  refining,
  onRefine,
  onCancel
}: RecipeResultCardProps): JSX.Element {
  const [removeIngredient, setRemoveIngredient] = useState("");
  const [missingPantry, setMissingPantry] = useState("");
  const formatNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  function equipmentLabel(item: string): string {
    return item in t.settings.equipmentLabels
      ? t.settings.equipmentLabels[item as CookingEquipment]
      : item;
  }

  function usedFoodLabel(foodId: string, amount?: number, unit?: keyof Messages["quantityUnits"]): string {
    const name = foodNames[foodId] ?? t.recipe.unknownHistoryFood;
    if (!amount || !unit) return name;
    return `${name} · ${formatNumber.format(amount)} ${t.quantityUnits[unit]}`;
  }

  function submitNamedAdjustment(kind: "remove_ingredient" | "missing_pantry", detail: string) {
    const normalized = detail.trim();
    if (!normalized) return;
    onRefine({ kind, detail: normalized });
  }

  return (
    <article className="relative rounded-[1.2rem] border border-paper-line bg-paper p-4 shadow-card">
      {refining ? (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.2rem] bg-paper/88 backdrop-blur-[1px]">
          <div className="text-center">
            <p className="flex items-center gap-2 text-sm font-black text-ink">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              {t.recipe.refiningOption}
            </p>
            <button type="button" onClick={onCancel} className="mt-3 text-xs font-black text-leaf-700">
              {t.actions.cancelGeneration}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-wider text-leaf-700">
            {t.recipe.option} {index + 1}
          </p>
          <h3 className="mt-1 font-editorial text-xl font-black leading-tight text-ink">
            {recipe.title}
          </h3>
        </div>
        <span className="fresh-pill shrink-0">
          {recipe.totalMinutes} {t.recipe.minutes}
        </span>
      </div>

      {recipe.differenceTags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.differenceTags.map((tag) => (
            <span key={tag} className="rounded-full bg-leaf-100 px-2.5 py-1 text-[0.65rem] font-black text-leaf-700">
              {t.recipe.differenceTags[tag]}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-sm font-bold leading-6 text-ink">{recipe.whyThisOption}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">{recipe.summary}</p>

      <div className="mt-4 grid gap-2">
        <div className="rounded-[0.9rem] bg-paper-soft p-3">
          <p className="flex items-center gap-2 text-xs font-black text-ink">
            <Refrigerator className="h-4 w-4 text-leaf-700" aria-hidden />
            {t.recipe.fridgeFoodsUsed}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recipe.usesFoods.map((food) => (
              <span key={food.foodId} className="fresh-pill bg-paper">
                {usedFoodLabel(food.foodId, food.estimatedAmount, food.estimatedUnit)}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[0.9rem] bg-paper-soft p-3">
            <p className="flex items-center gap-2 text-xs font-black text-ink">
              <ChefHat className="h-4 w-4 text-leaf-700" aria-hidden />
              {t.recipe.equipmentNeeded}
            </p>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-ink-muted">
              {recipe.equipment.length > 0
                ? recipe.equipment.map(equipmentLabel).join(t.recipe.summarySeparator)
                : t.recipe.basicEquipmentOnly}
            </p>
          </div>
          <div className="rounded-[0.9rem] bg-paper-soft p-3">
            <p className="flex items-center gap-2 text-xs font-black text-ink">
              <PackageOpen className="h-4 w-4 text-leaf-700" aria-hidden />
              {t.recipe.missingIngredients}
            </p>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-ink-muted">
              {recipe.missingIngredients.length > 0
                ? recipe.missingIngredients.join(t.recipe.summarySeparator)
                : t.recipe.nothingExtra}
            </p>
          </div>
        </div>
      </div>

      <details className="mt-4 rounded-[0.9rem] border border-paper-line">
        <summary className="cursor-pointer px-3 py-2.5 text-sm font-black text-leaf-700">
          {t.recipe.viewFullRecipe}
        </summary>
        <div className="border-t border-paper-line px-3 pb-3">
          <h4 className="mt-3 text-sm font-black text-ink">{t.recipe.ingredients}</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-medium leading-5 text-ink-muted">
            {recipe.ingredients.map((ingredient, ingredientIndex) => (
              <li key={`${ingredientIndex}-${ingredient}`}>{ingredient}</li>
            ))}
          </ul>
          <h4 className="mt-4 text-sm font-black text-ink">{t.recipe.steps}</h4>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm font-medium leading-5 text-ink-muted">
            {recipe.steps.map((step, stepIndex) => (
              <li key={`${stepIndex}-${step}`}>{step}</li>
            ))}
          </ol>
        </div>
      </details>

      {canRefine ? (
        <details className="mt-3 rounded-[0.9rem] border border-paper-line bg-paper-soft">
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-black text-leaf-700">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {t.recipe.adjustThisOption}
          </summary>
          <div className="space-y-3 border-t border-paper-line p-3">
            <div className="flex flex-wrap gap-2">
              {quickAdjustments.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  disabled={refining}
                  onClick={() => onRefine({ kind })}
                  className="fresh-pill border border-paper-line bg-paper text-ink transition hover:border-leaf-700"
                >
                  {t.recipe.adjustments[kind]}
                </button>
              ))}
            </div>

            {([
              ["remove_ingredient", removeIngredient, setRemoveIngredient, t.recipe.removeIngredientPlaceholder],
              ["missing_pantry", missingPantry, setMissingPantry, t.recipe.missingPantryPlaceholder]
            ] as const).map(([kind, value, setValue, placeholder]) => (
              <form
                key={kind}
                className="grid grid-cols-[1fr_auto] gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitNamedAdjustment(kind, value);
                }}
              >
                <label>
                  <span className="sr-only">{t.recipe.adjustments[kind]}</span>
                  <input
                    value={value}
                    maxLength={80}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={placeholder}
                    className="fresh-field"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!value.trim() || refining}
                  className={cx(
                    "min-h-11 rounded-[0.8rem] border border-leaf-700 px-3 text-xs font-black",
                    value.trim() ? "bg-leaf-700 text-paper" : "bg-paper-line text-ink-muted"
                  )}
                >
                  <RefreshCw className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                  {t.recipe.replaceOption}
                </button>
              </form>
            ))}
          </div>
        </details>
      ) : null}

      <p className="mt-3 flex items-center gap-1.5 text-[0.68rem] font-semibold text-ink-muted">
        <Clock3 className="h-3.5 w-3.5" aria-hidden />
        {t.recipe.estimateOnly}
      </p>
    </article>
  );
}
