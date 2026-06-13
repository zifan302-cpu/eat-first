import { Check, Clock, Search, Snowflake, Trash2 } from "lucide-react";
import type { FoodItem, PrimaryCta, PriorityResult } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import { CATEGORY_ICONS } from "../lib/constants";
import { daysFromToday } from "../lib/dates";
import { getPriority } from "../lib/priority";
import { cx } from "../lib/ui";
import { PriorityBadge } from "./PriorityBadge";

interface CompactFoodCardProps {
  food: FoodItem;
  t: Messages;
  onEat(id: string): void;
  onFreeze(id: string): void;
  onLater(id: string): void;
  onDiscard(id: string): void;
}

const actionIcons: Record<PrimaryCta, typeof Check> = {
  eat: Check,
  freeze: Snowflake,
  check: Search,
  discard: Trash2,
  later: Clock
};

function dateStatus(food: FoodItem, t: Messages): string {
  if (food.dateLabelType === "none" || !food.labelDate) {
    return t.priority.noDate;
  }

  const days = daysFromToday(food.labelDate);
  if (typeof days !== "number") {
    return food.labelDate;
  }

  if (food.dateLabelType === "opened") {
    return `${t.dateTypes.opened} · ${food.labelDate}`;
  }
  if (days < 0) {
    return `${Math.abs(days)}d past`;
  }
  if (days === 0) {
    return t.form.today;
  }
  if (days === 1) {
    return t.form.tomorrow;
  }
  return `+${days}d`;
}

function compactActions(priority: PriorityResult): [PrimaryCta, PrimaryCta] {
  if (priority.verdict === "expired_use_by") {
    return ["discard", "later"];
  }
  if (priority.verdict === "use_today") {
    return ["eat", "freeze"];
  }
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
  if (priority.verdict === "no_date") {
    return ["later", "eat"];
  }
  return [priority.primaryCta, priority.secondaryCtas[0] ?? "later"];
}

export function CompactFoodCard({
  food,
  t,
  onEat,
  onFreeze,
  onLater,
  onDiscard
}: CompactFoodCardProps): JSX.Element {
  const priority = getPriority(food);
  const [primary, secondary] = compactActions(priority);
  const explanation = t.priority[priority.explanationKey.split(".")[1] as keyof typeof t.priority];
  const shortExplanation = explanation.split(".")[0];

  const handlers: Record<PrimaryCta, () => void> = {
    eat: () => onEat(food.id),
    freeze: () => onFreeze(food.id),
    check: () => window.alert(explanation),
    discard: () => onDiscard(food.id),
    later: () => onLater(food.id)
  };

  return (
    <article className="rounded-md border border-stone-200 bg-white p-3 shadow-soft">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-leaf-50 text-2xl">
          {CATEGORY_ICONS[food.category] ?? CATEGORY_ICONS.other}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 break-words text-base font-extrabold leading-tight text-stone-950">
              {food.name}
            </h3>
            <PriorityBadge priority={priority} t={t} />
          </div>
          <p className="mt-1 text-xs font-semibold text-stone-500">
            {t.dateTypes[food.dateLabelType]} · {dateStatus(food, t)}
          </p>
          <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium leading-5 text-stone-600">
            {shortExplanation}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        {[primary, secondary].map((action, index) => {
          const Icon = actionIcons[action];
          const isPrimary = index === 0;
          return (
            <button
              key={`${action}-${index}`}
              type="button"
              onClick={handlers[action]}
              className={cx(
                "flex min-h-10 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-bold",
                isPrimary
                  ? "border-leaf-500 bg-leaf-500 text-white"
                  : "border-stone-200 bg-[#fffaf0] text-stone-700"
              )}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {t.actions[action]}
            </button>
          );
        })}
      </div>
    </article>
  );
}
