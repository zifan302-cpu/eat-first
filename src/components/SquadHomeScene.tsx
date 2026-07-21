import type { FoodItem, LocaleCode } from "../types/food";
import { sortActiveFoodsByPriority } from "../lib/priority";
import { quantityLabel } from "../lib/quantity";
import { cx } from "../lib/ui";
import { FoodPortrait } from "./FoodPortrait";

interface SquadHomeSceneProps {
  foods: FoodItem[];
  compact?: boolean;
  label: string;
  locale: LocaleCode;
  emptyLabel: string;
  moreLabel: string;
}

interface Representative {
  food: FoodItem;
  count: number;
}

function representatives(foods: FoodItem[]): Representative[] {
  return sortActiveFoodsByPriority(foods).reduce<Representative[]>((items, food) => {
    const existing = items.find((item) => item.food.normalizedName === food.normalizedName);
    if (existing) {
      existing.count += 1;
      return items;
    }
    items.push({ food, count: 1 });
    return items;
  }, []);
}

export function SquadHomeScene({
  foods,
  compact = false,
  label,
  locale,
  emptyLabel,
  moreLabel
}: SquadHomeSceneProps): JSX.Element {
  const allRepresentatives = representatives(foods);
  const visible = allRepresentatives.slice(0, 5);
  const hiddenCount = allRepresentatives.slice(5).reduce((sum, item) => sum + item.count, 0);

  return (
    <figure
      aria-label={label}
      className={cx(
        "relative overflow-hidden rounded-[1.65rem] border border-ink/20 bg-[#CCD8CF] shadow-lift",
        compact ? "min-h-52" : "min-h-[23rem]"
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-ink/15 bg-ink px-4 text-paper">
        <span className="text-[0.62rem] font-black tracking-[0.2em]">FRESH SQUAD</span>
        <span className="flex items-center gap-1.5 text-[0.62rem] font-extrabold text-paper/80">
          <span className="h-2 w-2 rounded-full bg-[#A8C38E]" />
          {foods.filter((food) => food.status === "active").length}
        </span>
      </div>

      <div className="m-3 min-h-[17.5rem] rounded-[1.2rem] border border-ink/15 bg-[#EEF0DF] p-4">
        {visible.length === 0 ? (
          <div className="grid min-h-[15rem] place-items-center text-center">
            <div>
              <span className="mx-auto block h-12 w-12 rounded-full border border-dashed border-ink/25 bg-paper-soft" />
              <p className="mt-4 max-w-52 text-sm font-bold leading-6 text-ink-muted">{emptyLabel}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {visible.map(({ food, count }) => (
              <div key={food.normalizedName} className="relative rounded-[1rem] border border-ink/10 bg-paper-soft/80 p-2 text-center shadow-card">
                <FoodPortrait food={food} size="lg" className="mx-auto border-0 bg-transparent" />
                {count > 1 ? (
                  <span className="absolute right-1.5 top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-black text-paper">×{count}</span>
                ) : null}
                <figcaption className="mt-1 truncate text-xs font-black text-ink">{food.name}</figcaption>
                <p className="mt-0.5 truncate text-[0.62rem] font-bold text-ink-muted">{quantityLabel(food, locale) ?? "·"}</p>
              </div>
            ))}
            {hiddenCount > 0 ? (
              <div className="grid min-h-32 place-items-center rounded-[1rem] border border-dashed border-ink/25 bg-paper/45 p-2 text-center">
                <div>
                  <p className="font-editorial text-2xl font-black text-ink">+{hiddenCount}</p>
                  <p className="mt-1 text-[0.65rem] font-bold text-ink-muted">{moreLabel}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </figure>
  );
}
