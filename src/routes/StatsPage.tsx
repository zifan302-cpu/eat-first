import { useMemo } from "react";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { getWeeklyStats } from "../lib/stats";

export function StatsPage(): JSX.Element {
  const { state } = useAppState();
  const { t } = useLocale();
  const stats = getWeeklyStats(state.foods);

  const recentActions = useMemo(() => {
    return state.foods
      .flatMap((food) =>
        food.actionHistory.map((action) => ({
          ...action,
          foodName: food.name
        }))
      )
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 5);
  }, [state.foods]);

  const cards = [
    { label: t.stats.eaten, value: stats.eatenCount },
    { label: t.stats.frozen, value: stats.frozenCount },
    { label: t.stats.discarded, value: stats.discardedCount },
    { label: t.stats.expiringSoon, value: stats.expiringSoonCount },
    { label: t.stats.estimatedSaved, value: `£${stats.estimatedSaved}` }
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold leading-tight">{t.pages.statsTitle}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-stone-600">
          {t.stats.savedDisclaimer}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => (
          <article
            key={card.label}
            className={index === 4 ? "col-span-2 rounded-md border border-leaf-500/20 bg-white p-4 shadow-soft" : "rounded-md border border-stone-200 bg-white p-4 shadow-soft"}
          >
            <p className="text-sm font-bold text-stone-500">{card.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-stone-950">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.stats.recent}</h2>
        {recentActions.length > 0 ? (
          <div className="mt-3 space-y-3">
            {recentActions.map((action) => (
              <div key={action.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-stone-900">{action.foodName}</p>
                <p className="text-xs font-medium text-stone-500">
                  {action.type} · {new Date(action.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-stone-500">{t.empty.stats}</p>
        )}
      </section>
    </div>
  );
}
