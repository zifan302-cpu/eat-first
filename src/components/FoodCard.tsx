import { Check, Clock, Pencil, Search, Snowflake, Trash2 } from "lucide-react";
import type { FoodItem, PrimaryCta } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import { CATEGORY_ICONS } from "../lib/constants";
import { daysFromToday } from "../lib/dates";
import { getPriority } from "../lib/priority";
import { cx } from "../lib/ui";
import { PriorityBadge } from "./PriorityBadge";

interface FoodCardProps {
  food: FoodItem;
  t: Messages;
  onEat(id: string): void;
  onFreeze(id: string): void;
  onLater(id: string): void;
  onDiscard(id: string): void;
  onCheck?: (id: string) => void;
  onEdit?: (food: FoodItem) => void;
  onDelete?: (id: string) => void;
}

function dateStatus(food: FoodItem, t: Messages): string {
  if (food.dateLabelType === "none" || !food.labelDate) {
    return t.priority.noDate;
  }

  const days = daysFromToday(food.labelDate);
  if (typeof days !== "number") {
    return food.labelDate;
  }

  if (food.dateLabelType === "opened") {
    return `${t.dateTypes.opened}: ${food.labelDate}`;
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

function orderedActions(primary: PrimaryCta): PrimaryCta[] {
  const base: PrimaryCta[] =
    primary === "discard"
      ? ["discard", "check", "later"]
      : primary === "check"
        ? ["check", "eat", "freeze", "later", "discard"]
        : ["eat", "freeze", "later", "discard"];

  return base.filter((item, index) => base.indexOf(item) === index);
}

const actionIcons: Record<PrimaryCta, typeof Check> = {
  eat: Check,
  freeze: Snowflake,
  check: Search,
  discard: Trash2,
  later: Clock
};

export function FoodCard({
  food,
  t,
  onEat,
  onFreeze,
  onLater,
  onDiscard,
  onCheck,
  onEdit,
  onDelete
}: FoodCardProps): JSX.Element {
  const priority = getPriority(food);
  const actions = orderedActions(priority.primaryCta);
  const explanation = t.priority[priority.explanationKey.split(".")[1] as keyof typeof t.priority];

  const handlers: Record<PrimaryCta, () => void> = {
    eat: () => onEat(food.id),
    freeze: () => onFreeze(food.id),
    check: () => (onCheck ? onCheck(food.id) : window.alert(explanation)),
    discard: () => onDiscard(food.id),
    later: () => onLater(food.id)
  };

  return (
    <article className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-leaf-50 text-2xl">
          {CATEGORY_ICONS[food.category] ?? CATEGORY_ICONS.other}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-lg font-extrabold leading-tight text-stone-950">
              {food.name}
            </h3>
            <PriorityBadge priority={priority} t={t} />
          </div>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {t.dateTypes[food.dateLabelType]} · {dateStatus(food, t)}
          </p>
        </div>
        {onEdit || onDelete ? (
          <div className="flex shrink-0 gap-1">
            {onEdit ? (
              <button
                type="button"
                aria-label={t.actions.edit}
                onClick={() => onEdit(food)}
                className="grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100"
              >
                <Pencil aria-hidden className="h-4 w-4" />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                aria-label={t.actions.delete}
                onClick={() => onDelete(food.id)}
                className="grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{explanation}</p>

      {food.quantityText || food.note ? (
        <p className="mt-2 text-xs font-medium text-stone-500">
          {[food.quantityText, food.note].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = actionIcons[action];
          const isPrimary = action === priority.primaryCta;
          return (
            <button
              key={action}
              type="button"
              onClick={handlers[action]}
              className={cx(
                "flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold",
                isPrimary
                  ? "border-leaf-500 bg-leaf-500 text-white"
                  : "border-stone-200 bg-white text-stone-700"
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
