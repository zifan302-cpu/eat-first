import { Check, Clock, Search, Snowflake, Trash2 } from "lucide-react";
import type { FoodItem, PrimaryCta, PriorityResult } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import { getPriority } from "../lib/priority";
import { cx } from "../lib/ui";
import { FoodPortrait } from "./FoodPortrait";
import { PriorityBadge } from "./PriorityBadge";

interface CompactFoodCardProps {
  food: FoodItem;
  rank: number;
  t: Messages;
  onAction(food: FoodItem, action: PrimaryCta): void;
}

const actionIcons: Record<PrimaryCta, typeof Check> = {
  eat: Check,
  freeze: Snowflake,
  check: Search,
  discard: Trash2,
  later: Clock
};

export function getCompactFoodActions(priority: PriorityResult): [PrimaryCta, PrimaryCta] {
  if (
    priority.explanationKey === "priority.plannedToday" ||
    priority.explanationKey === "priority.plannedTomorrow"
  ) {
    const secondary =
      priority.secondaryCtas.find((action) => action !== priority.primaryCta) ??
      (priority.primaryCta === "check" ? "eat" : "later");
    return [priority.primaryCta, secondary];
  }
  if (priority.verdict === "expired_use_by") return ["discard", "later"];
  if (priority.verdict === "use_today") return ["eat", "freeze"];
  if (priority.verdict === "use_soon") {
    return ["eat", priority.secondaryCtas.includes("freeze") ? "freeze" : "later"];
  }
  if (
    priority.verdict === "quality_check" ||
    priority.verdict === "opened_due" ||
    priority.verdict === "opened_soon"
  ) {
    return ["check", "eat"];
  }
  if (priority.verdict === "no_date") return ["later", "eat"];
  return [priority.primaryCta, priority.secondaryCtas[0] ?? "later"];
}

export function CompactFoodCard({
  food,
  rank,
  t,
  onAction
}: CompactFoodCardProps): JSX.Element {
  const priority = getPriority(food);
  const [primary, secondary] = getCompactFoodActions(priority);
  const explanation =
    t.priority[priority.explanationKey.split(".")[1] as keyof typeof t.priority];

  return (
    <article className="fresh-card animate-fresh-pop overflow-hidden p-3.5">
      <div className="flex gap-3">
        <FoodPortrait food={food} rank={rank} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-editorial text-lg font-black tracking-tight text-ink">{food.name}</h3>
              <p className="mt-0.5 text-xs font-bold text-ink-muted">
                {t.dateTypes[food.dateLabelType]}
                {food.labelDate ? ` · ${food.labelDate}` : ""}
              </p>
            </div>
            <PriorityBadge priority={priority} t={t} />
          </div>
          <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-ink-muted">
            {explanation}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {[primary, secondary].map((action, index) => {
          const Icon = actionIcons[action];
          return (
            <button
              key={`${action}-${index}`}
              type="button"
              onClick={() => onAction(food, action)}
              className={cx(
                "flex min-h-11 items-center justify-center gap-2 rounded-[0.9rem] border px-3 text-sm font-extrabold transition active:translate-y-px",
                index === 0
                  ? "border-ink bg-ink text-paper"
                  : "border-paper-line bg-paper text-ink"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.actions[action]}
            </button>
          );
        })}
      </div>
    </article>
  );
}
