import { CheckCircle2, Flame, Leaf, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { CHARACTERS } from "../lib/characters";
import { getGameProgress } from "../lib/game";

export function StatsPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const game = getGameProgress(state.foods);
  const rhythm = CHARACTERS.carrot;
  const record = CHARACTERS.mushroom;

  const recentActions = useMemo(() => {
    return state.foods
      .flatMap((food) => food.actionHistory.map((action) => ({ ...action, foodName: food.name })))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 8);
  }, [state.foods]);

  const cards = [
    { label: t.game.level, value: game.level, icon: Leaf, tone: "bg-leaf-100 text-leaf-700" },
    { label: t.game.streak, value: game.streakDays, icon: Flame, tone: "bg-[#F3DDD3] text-tomato" },
    { label: t.game.weeklyRescued, value: game.weeklyRescued, icon: CheckCircle2, tone: "bg-[#F3E4CD] text-carrot" },
    { label: t.game.totalRescued, value: game.totalRescued, icon: ShieldCheck, tone: "bg-[#DEE6E7] text-freezer" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t.stats.weeklyMission} title={t.pages.statsTitle} body={t.stats.savedDisclaimer} />

      <section className="fresh-card relative min-h-52 overflow-hidden p-5">
        <div className="relative z-10 max-w-[60%] py-1">
          <p className="fresh-eyebrow">{rhythm.role[locale]}</p>
          <h2 className="mt-2 font-editorial text-2xl font-black leading-tight tracking-[-0.03em] text-ink">
            {game.streakDays > 0 ? `${game.streakDays} ${t.game.streak}` : t.home.missionTitle}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-ink-muted">{t.stats.noPenalty}</p>
        </div>
        <img src={rhythm.asset} alt="" className="absolute -bottom-8 -right-8 h-48 w-48 object-contain object-bottom" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="fresh-card p-4">
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-full ${tone}`}>
                <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              </span>
              <p className="font-editorial text-3xl font-black tracking-tight text-ink">{value}</p>
            </div>
            <p className="mt-4 text-xs font-bold text-ink-muted">{label}</p>
          </article>
        ))}
      </section>

      <section className="fresh-card p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-end overflow-hidden rounded-[1rem] bg-[#E9DDD0]">
            <img src={record.asset} alt="" className="h-[108%] w-[108%] object-contain object-bottom" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="fresh-section-title text-lg">{t.game.experience}</h2>
              <span className="text-sm font-black text-leaf-700">{game.levelProgress}/60</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-line/60">
              <div className="h-full rounded-full bg-leaf-500 transition-all" style={{ width: `${(game.levelProgress / 60) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="fresh-eyebrow">Archive</p>
          <h2 className="fresh-section-title mt-1">{t.stats.recent}</h2>
        </div>
        {recentActions.length > 0 ? (
          <div className="fresh-card divide-y divide-paper-line overflow-hidden">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink">{action.foodName}</p>
                  <p className="mt-0.5 text-xs font-medium text-ink-muted">{new Date(action.at).toLocaleString(locale)}</p>
                </div>
                <span className="shrink-0 rounded-full border border-paper-line bg-paper px-3 py-1 text-[0.65rem] font-black text-leaf-700">
                  {t.historyActions[action.type]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="fresh-card p-5 text-sm font-medium text-ink-muted">{t.empty.stats}</div>
        )}
      </section>
    </div>
  );
}
