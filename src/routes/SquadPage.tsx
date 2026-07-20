import { ArrowRight, CheckCircle2, Clock3, Leaf, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { SquadHomeScene } from "../components/SquadHomeScene";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { getGameProgress } from "../lib/game";

export function SquadPage(): JSX.Element {
  const { state } = useAppState();
  const { t } = useLocale();
  const game = getGameProgress(state.foods);
  const status = game.missionComplete
    ? t.squad.missionComplete
    : game.activeCount > 0
      ? t.squad.missionInProgress
      : t.squad.quiet;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t.squad.eyebrow} title={t.pages.squadTitle} body={t.squad.intro} />

      <SquadHomeScene label={t.squad.sceneLabel} />

      <section className="fresh-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="fresh-eyebrow">{t.squad.today}</p>
            <h2 className="mt-1 font-editorial text-xl font-black tracking-[-0.025em] text-ink">{status}</h2>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
            {game.missionComplete ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <Clock3 className="h-5 w-5" aria-hidden />}
          </span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-paper-line/60">
          <div
            className="h-full rounded-full bg-leaf-500"
            style={{ width: `${(game.missionProgress / game.missionTarget) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-bold text-ink-muted">
          {game.missionProgress}/{game.missionTarget} · {t.game.mission}
        </p>

        <div className="mt-5 grid grid-cols-3 divide-x divide-paper-line border-y border-paper-line py-4 text-center">
          <div>
            <UsersRound className="mx-auto h-4 w-4 text-leaf-700" aria-hidden />
            <p className="mt-1.5 font-editorial text-2xl font-black text-ink">5</p>
            <p className="text-[0.65rem] font-bold text-ink-muted">{t.squad.residents}</p>
          </div>
          <div>
            <Leaf className="mx-auto h-4 w-4 text-leaf-700" aria-hidden />
            <p className="mt-1.5 font-editorial text-2xl font-black text-ink">{game.level}</p>
            <p className="text-[0.65rem] font-bold text-ink-muted">{t.squad.level}</p>
          </div>
          <div>
            <CheckCircle2 className="mx-auto h-4 w-4 text-leaf-700" aria-hidden />
            <p className="mt-1.5 font-editorial text-2xl font-black text-ink">{game.totalRescued}</p>
            <p className="text-[0.65rem] font-bold text-ink-muted">{t.game.totalRescued}</p>
          </div>
        </div>

        <Link to="/stats" className="mt-4 flex min-h-11 items-center justify-between rounded-xl font-extrabold text-leaf-700">
          {t.squad.viewProgress}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      <section className="border-l-2 border-carrot pl-4">
        <p className="text-sm font-black text-ink">{t.squad.homeNoteTitle}</p>
        <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">{t.squad.homeNoteBody}</p>
      </section>
    </div>
  );
}
