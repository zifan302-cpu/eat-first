import { useMemo, useState } from "react";
import type { DateLabelType, FoodItem } from "../types/food";
import { EmptyState } from "../components/EmptyState";
import { FoodCard } from "../components/FoodCard";
import { FoodForm } from "../components/FoodForm";
import { useAppState } from "../hooks/useAppState";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { sortActiveFoodsByPriority } from "../lib/priority";
import { cx } from "../lib/ui";

type Filter = "all" | DateLabelType;

const filters: Filter[] = ["all", "use_by", "best_before", "opened", "none"];

export function FridgePage(): JSX.Element {
  const { state } = useAppState();
  const actions = useFoodActions();
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<FoodItem | null>(null);

  const foods = useMemo(() => {
    const active = sortActiveFoodsByPriority(state.foods);
    return filter === "all" ? active : active.filter((food) => food.dateLabelType === filter);
  }, [filter, state.foods]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold leading-tight">{t.pages.fridgeTitle}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-stone-600">{t.fridge.activeOnly}</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cx(
              "min-h-10 shrink-0 rounded-md border px-3 text-sm font-bold",
              filter === item
                ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                : "border-stone-200 bg-white text-stone-600"
            )}
          >
            {item === "all" ? t.filters.all : t.filters[item]}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        {foods.length > 0 ? (
          foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              t={t}
              onEat={actions.markEaten}
              onFreeze={actions.markFrozen}
              onLater={actions.snoozeUntilTomorrow}
              onDiscard={actions.markDiscarded}
              onEdit={setEditing}
              onDelete={(id) => {
                if (window.confirm(t.fridge.deleteConfirm)) {
                  actions.deleteFood(id);
                }
              }}
            />
          ))
        ) : (
          <EmptyState title={t.empty.fridge} />
        )}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/35 px-4 pb-4 sm:items-center sm:justify-center">
          <section className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-md bg-[#f8faf5] p-4 shadow-soft sm:rounded-md">
            <h2 className="mb-4 text-xl font-extrabold">{t.fridge.editTitle}</h2>
            <FoodForm
              initial={editing}
              locale={locale}
              t={t}
              submitLabel={t.actions.save}
              onCancel={() => setEditing(null)}
              onSubmit={(input) => {
                actions.updateFood(editing.id, input);
                setEditing(null);
              }}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
