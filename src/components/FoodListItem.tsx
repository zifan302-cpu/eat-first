import { ChevronRight } from "lucide-react";
import type { Messages } from "../i18n/en-GB";
import type { FoodItem, LocaleCode } from "../types/food";
import { daysFromToday } from "../lib/dates";
import { getPriority } from "../lib/priority";
import { quantityLabel } from "../lib/quantity";
import { FoodPortrait } from "./FoodPortrait";
import { PriorityBadge } from "./PriorityBadge";

interface FoodListItemProps {
  food: FoodItem;
  locale: LocaleCode;
  t: Messages;
  onOpen(food: FoodItem): void;
}

function compactDate(food: FoodItem, t: Messages): string {
  if (!food.labelDate || food.dateLabelType === "none") return t.dateTypes.none;
  const days = daysFromToday(food.labelDate);
  if (days === 0) return t.form.today;
  if (days === 1) return t.form.tomorrow;
  if (typeof days === "number" && days > 1) return `+${days}d`;
  if (typeof days === "number") return `${Math.abs(days)}d past`;
  return food.labelDate;
}

export function FoodListItem({ food, locale, t, onOpen }: FoodListItemProps): JSX.Element {
  const priority = getPriority(food);
  const amount = quantityLabel(food, locale);
  return (
    <article className="rounded-[1.05rem] border border-paper-line bg-paper-soft shadow-card">
      <button
        type="button"
        onClick={() => onOpen(food)}
        className="flex min-h-[5.25rem] w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <FoodPortrait food={food} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate font-editorial text-base font-black tracking-tight text-ink">{food.name}</span>
            <PriorityBadge priority={priority} t={t} />
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-ink-muted">
            {amount ? <span className="font-extrabold text-ink">{amount}</span> : null}
            <span>{t.dateTypes[food.dateLabelType]} · {compactDate(food, t)}</span>
          </span>
        </span>
        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>
    </article>
  );
}
