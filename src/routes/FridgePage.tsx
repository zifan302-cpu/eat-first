import { useMemo, useState } from "react";
import type { DateLabelType, FoodCategory, FoodItem } from "../types/food";
import { EmptyState } from "../components/EmptyState";
import { FoodActionSheet } from "../components/FoodActionSheet";
import { FoodListItem } from "../components/FoodListItem";
import { FoodForm } from "../components/FoodForm";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { sortActiveFoodsByPriority } from "../lib/priority";
import { cx } from "../lib/ui";
import { categoryOptions } from "../i18n";
import { Search } from "lucide-react";

type Filter = "all" | DateLabelType;
type FridgeView = "current" | "frozen" | "history";

const filters: Filter[] = ["all", "use_by", "best_before", "opened", "none"];

export function FridgePage(): JSX.Element {
  const { state } = useAppState();
  const actions = useFoodActions();
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<FridgeView>("current");
  const [category, setCategory] = useState<"all" | FoodCategory>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const foods = useMemo(() => {
    const viewed =
      view === "current"
        ? sortActiveFoodsByPriority(state.foods)
        : state.foods
            .filter((food) =>
              view === "frozen"
                ? food.status === "frozen"
                : food.status === "eaten" || food.status === "discarded"
            )
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return viewed.filter((food) => {
      if (view === "current" && filter !== "all" && food.dateLabelType !== filter) return false;
      if (category !== "all" && food.category !== category) return false;
      return !query.trim() || food.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    });
  }, [category, filter, query, state.foods, view]);

  const viewLabels = {
    current: t.fridge.viewCurrent,
    frozen: t.fridge.viewFrozen,
    history: t.fridge.viewHistory
  };
  const countLabel =
    view === "current"
      ? t.fridge.activeOnly
      : view === "frozen"
        ? t.fridge.frozenOnly
        : t.fridge.historyOnly;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t.app.name}
        title={t.pages.fridgeTitle}
        body={`${countLabel} · ${foods.length}`}
      />

      <div className="grid grid-cols-3 gap-2 rounded-[1rem] border border-paper-line bg-paper-soft p-1.5">
        {(Object.keys(viewLabels) as FridgeView[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            aria-pressed={view === item}
            className={cx(
              "min-h-10 rounded-[0.75rem] px-2 text-xs font-black transition",
              view === item ? "bg-ink text-paper shadow-card" : "text-ink-muted"
            )}
          >
            {viewLabels[item]}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.fridge.searchPlaceholder}
          aria-label={t.fridge.searchPlaceholder}
          className="fresh-field pl-10"
        />
      </div>

      <div className={cx("grid gap-2", view === "current" ? "grid-cols-[1fr_auto]" : "grid-cols-1")}>
        {view === "current" ? (
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
        ) : null}
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as "all" | FoodCategory)}
          className={cx(
            "min-h-9 rounded-full border border-paper-line bg-paper-soft px-3 text-xs font-black text-ink",
            view === "current" ? "max-w-[8.5rem]" : "w-full"
          )}
          aria-label={t.form.category}
        >
          <option value="all">{t.filters.all}</option>
          {categoryOptions(locale).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <section className="space-y-2">
        {foods.length > 0 ? (
          foods.map((food) => (
            <FoodListItem
              key={food.id}
              food={food}
              locale={locale}
              t={t}
              onOpen={setSelected}
            />
          ))
        ) : (
          <EmptyState
            title={
              view === "current"
                ? t.empty.fridge
                : view === "frozen"
                  ? t.fridge.emptyFrozen
                  : t.fridge.emptyHistory
            }
            character={view === "frozen" ? "eggplant" : "broccoli"}
          />
        )}
      </section>

      {selected ? (
        <FoodActionSheet
          food={selected}
          locale={locale}
          t={t}
          onClose={() => setSelected(null)}
          onUsePart={actions.usePart}
          onUseAll={actions.markEaten}
          onFreeze={actions.markFrozen}
          onThaw={actions.restoreFrozen}
          onLater={actions.snoozeUntilTomorrow}
          onDiscard={actions.markDiscarded}
          onEdit={setEditing}
          onDelete={(id) => {
            if (window.confirm(t.fridge.deleteConfirm)) actions.deleteFood(id);
          }}
        />
      ) : null}

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
