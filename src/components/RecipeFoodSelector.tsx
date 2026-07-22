import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import type { FoodItem } from "../types/food";

export type RecipeFoodRole = "suggested" | "required" | "available" | "excluded";

interface RecipeFoodSelectorProps {
  foods: FoodItem[];
  roles: Record<string, RecipeFoodRole>;
  t: Messages;
  notice?: string | null;
  onRoleChange: (foodId: string, role: RecipeFoodRole) => void;
}

export function RecipeFoodSelector({
  foods,
  roles,
  t,
  notice,
  onRoleChange
}: RecipeFoodSelectorProps): JSX.Element {
  const [query, setQuery] = useState("");
  const visibleFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return foods;
    return foods.filter((food) => food.name.toLocaleLowerCase().includes(normalizedQuery));
  }, [foods, query]);

  return (
    <details className="group rounded-[1rem] border border-paper-line bg-paper">
      <summary className="cursor-pointer list-none px-4 py-3 marker:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-black text-ink">{t.recipe.adjustFoods}</span>
            <span className="mt-0.5 block text-xs font-medium text-ink-muted">
              {t.recipe.adjustFoodsHint}
            </span>
          </span>
          <span className="shrink-0 text-xs font-black text-leaf-700 group-open:hidden">
            {t.recipe.adjust}
          </span>
        </span>
      </summary>

      <div className="space-y-3 border-t border-paper-line p-3">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <span className="sr-only">{t.recipe.searchFoods}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.recipe.searchFoods}
            className="fresh-field pl-9"
          />
        </label>

        {notice ? (
          <p className="rounded-[0.8rem] bg-[#F3E4CD] px-3 py-2 text-xs font-bold leading-5 text-[#70431C]">
            {notice}
          </p>
        ) : null}

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {visibleFoods.map((food) => (
            <label
              key={food.id}
              className="flex items-center gap-3 rounded-[0.9rem] border border-paper-line bg-paper-soft px-3 py-2.5"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-ink">{food.name}</span>
                <span className="block truncate text-xs font-medium text-ink-muted">
                  {food.quantityAmount && food.quantityUnit
                    ? `${food.quantityAmount} ${t.quantityUnits[food.quantityUnit]}`
                    : food.quantityText || t.recipe.quantityUnknown}
                </span>
              </span>
              <span className="sr-only">{t.recipe.foodRole}</span>
              <select
                value={roles[food.id] ?? "available"}
                onChange={(event) =>
                  onRoleChange(food.id, event.target.value as RecipeFoodRole)
                }
                className="min-h-9 max-w-[8.2rem] rounded-[0.75rem] border border-paper-line bg-paper px-2 text-xs font-bold text-ink outline-none focus:border-leaf-500"
              >
                <option value="suggested">{t.recipe.roleSuggested}</option>
                <option value="required">{t.recipe.roleRequired}</option>
                <option value="available">{t.recipe.roleAvailable}</option>
                <option value="excluded">{t.recipe.roleExcluded}</option>
              </select>
            </label>
          ))}
        </div>

        {visibleFoods.length === 0 ? (
          <p className="py-3 text-center text-sm font-semibold text-ink-muted">
            {t.recipe.noFoodMatches}
          </p>
        ) : null}
      </div>
    </details>
  );
}
