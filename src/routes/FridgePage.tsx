import { useMemo, useState } from "react";
import type { DateLabelType, FoodItem } from "../types/food";
import { EmptyState } from "../components/EmptyState";
import { FoodCard } from "../components/FoodCard";
import { FoodForm } from "../components/FoodForm";
import { PageHeader } from "../components/PageHeader";
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
    <div className="space-y-5">
      <PageHeader
        eyebrow={t.app.name}
        title={t.pages.fridgeTitle}
        body={`${t.fridge.activeOnly} · ${foods.length}`}
      />

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cx(
              "min-h-9 shrink-0 rounded-full border px-3.5 text-xs font-black transition",
              filter === item
                ? "border-ink bg-ink text-paper"
                : "border-paper-line bg-paper-soft text-ink-muted"
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
          <EmptyState title={t.empty.fridge} character="broccoli" />
        )}
      </section>

      {editing ? (
        <div className="fixed inset-0 z-40 flex items-end bg-ink/38 px-4 pb-4 sm:items-center sm:justify-center">
          <section className="paper-canvas mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[1.6rem] border border-paper-line p-4 shadow-lift sm:rounded-[1.6rem]">
            <h2 className="mb-4 font-editorial text-xl font-black tracking-tight text-ink">{t.fridge.editTitle}</h2>
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
