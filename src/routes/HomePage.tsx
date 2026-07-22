import { ArrowRight, CheckCircle2, Plus, WandSparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CompactFoodCard } from "../components/CompactFoodCard";
import { FutureFeatureCard } from "../components/FutureFeatureCard";
import { PageHeader } from "../components/PageHeader";
import { SafetyBanner } from "../components/SafetyBanner";
import { useAppState } from "../hooks/useAppState";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { CHARACTERS } from "../lib/characters";
import { getGameProgress } from "../lib/game";
import { getTopFoods } from "../lib/priority";

export function HomePage(): JSX.Element {
  const { state, setState } = useAppState();
  const actions = useFoodActions();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const topFoods = getTopFoods(state.foods, state.preferences.topN);
  const game = getGameProgress(state.foods);
  const captain = CHARACTERS.tomato;
  const scout = CHARACTERS.broccoli;
  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date());
  const progress = (game.missionProgress / game.missionTarget) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={today}
        title={t.app.name}
        action={
          <div className="rounded-full border border-paper-line bg-paper-soft px-3 py-2 text-center shadow-card">
            <p className="text-lg font-black leading-none text-tomato">{game.streakDays}</p>
            <p className="mt-1 text-[0.58rem] font-black uppercase tracking-wider text-ink-muted">
              {t.game.streak}
            </p>
          </div>
        }
      />

      <section className="relative min-h-[15rem] overflow-hidden rounded-[1.65rem] border border-ink bg-ink p-5 text-paper shadow-lift">
        <div className="relative z-10 max-w-[61%]">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.17em] text-[#D8CFAE]">
            {t.game.mission} · {game.missionProgress}/{game.missionTarget}
          </p>
          <h2 className="mt-3 font-editorial text-[1.75rem] font-black leading-[1.05] tracking-[-0.035em]">
            {game.missionComplete ? t.home.missionComplete : t.home.missionTitle}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-paper/72">{t.home.missionBody}</p>
        </div>

        <img
          src={captain.asset}
          alt={captain.name[locale]}
          className="animate-fresh-float absolute -bottom-7 -right-10 h-56 w-56 object-contain object-bottom"
        />

        <div className="absolute inset-x-5 bottom-5 z-20">
          <div className="h-2 overflow-hidden rounded-full bg-paper/16">
            <div
              className="h-full rounded-full bg-[#E6B84B] transition-all duration-500"
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="fresh-card grid grid-cols-3 divide-x divide-paper-line overflow-hidden">
        {[
          [game.rescuedToday, t.home.rescuedToday],
          [game.activeCount, t.home.fridgeCount],
          [game.weeklyRescued, t.game.weeklyRescued]
        ].map(([value, label]) => (
          <div key={label} className="px-3 py-4 text-center">
            <p className="font-editorial text-2xl font-black tracking-tight text-ink">{value}</p>
            <p className="mt-1 text-[0.66rem] font-bold leading-4 text-ink-muted">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="fresh-eyebrow">Eat first</p>
            <h2 className="fresh-section-title mt-1">{t.home.topTitle}</h2>
          </div>
          {topFoods.length > 0 ? (
            <Link to="/fridge" className="flex items-center gap-1 text-xs font-black text-leaf-700">
              {t.nav.fridge}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>

        <div className="space-y-3">
          {topFoods.length > 0 ? (
            topFoods.map((food, index) => (
              <CompactFoodCard
                key={food.id}
                food={food}
                rank={index + 1}
                t={t}
                onEat={actions.markEaten}
                onFreeze={actions.markFrozen}
                onLater={actions.snoozeUntilTomorrow}
                onDiscard={actions.markDiscarded}
              />
            ))
          ) : (
            <div className="fresh-card relative min-h-56 overflow-hidden p-5">
              <div className="relative z-10 max-w-[60%] py-2">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-leaf-500/20 bg-leaf-100 text-leaf-700">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-editorial text-xl font-black tracking-tight text-ink">
                  {t.home.emptyTitle}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-ink-muted">{t.home.emptyBody}</p>
                <Link to="/add" className="fresh-button-primary mt-4 inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden />
                  {t.home.addFirst}
                </Link>
              </div>
              <img
                src={scout.asset}
                alt=""
                className="absolute -bottom-8 -right-8 h-48 w-48 object-contain object-bottom"
              />
            </div>
          )}
        </div>
      </section>

      <FutureFeatureCard
        icon={WandSparkles}
        eyebrow={t.recipe.eyebrow}
        title={t.recipe.title}
        body={t.recipe.body}
        actionLabel={t.recipe.action}
        badge={t.recipe.badge}
        onOpen={() => navigate("/recipes")}
      />

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

    </div>
  );
}
