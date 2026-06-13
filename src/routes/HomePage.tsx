import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { CompactFoodCard } from "../components/CompactFoodCard";
import { EmptyState } from "../components/EmptyState";
import { InstallHint } from "../components/InstallHint";
import { SafetyBanner } from "../components/SafetyBanner";
import { useAppState } from "../hooks/useAppState";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { getTopFoods } from "../lib/priority";
import { isoNow } from "../lib/dates";

export function HomePage(): JSX.Element {
  const { state, setState } = useAppState();
  const actions = useFoodActions();
  const { t } = useLocale();
  const topFoods = getTopFoods(state.foods, state.preferences.topN);

  return (
    <div className="space-y-4">
      <header className="pt-1">
        <p className="text-sm font-bold uppercase text-leaf-700">
          {t.app.name}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-stone-950">
          {t.pages.homeTitle}
        </h1>
        <p className="mt-2 text-base font-medium leading-6 text-stone-600">{t.app.valueLine}</p>
      </header>

      {state.preferences.showSafetyBanner ? (
        <SafetyBanner
          t={t}
          onDismiss={() =>
            setState((current) => ({
              ...current,
              preferences: { ...current.preferences, showSafetyBanner: false }
            }))
          }
        />
      ) : null}

      {!state.preferences.installHintDismissedAt ? (
        <InstallHint
          t={t}
          onDismiss={() =>
            setState((current) => ({
              ...current,
              preferences: {
                ...current.preferences,
                installHintDismissedAt: isoNow()
              }
            }))
          }
        />
      ) : null}

      <section className="space-y-3">
        {topFoods.length > 0 ? (
          topFoods.map((food) => (
            <CompactFoodCard
              key={food.id}
              food={food}
              t={t}
              onEat={actions.markEaten}
              onFreeze={actions.markFrozen}
              onLater={actions.snoozeUntilTomorrow}
              onDiscard={actions.markDiscarded}
            />
          ))
        ) : (
          <EmptyState
            title={t.empty.top}
            action={
              <Link
                to="/add"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf-500 px-4 text-sm font-bold text-white"
              >
                <Plus aria-hidden className="h-4 w-4" />
                {t.nav.add}
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
