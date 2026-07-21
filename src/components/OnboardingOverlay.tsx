import { ArrowRight, Check, LockKeyhole, Target } from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { SquadHomeScene } from "./SquadHomeScene";

export function OnboardingOverlay(): JSX.Element | null {
  const { state, setState } = useAppState();
  const { t } = useLocale();

  if (state.preferences.hasSeenOnboarding) return null;

  return (
    <div className="paper-canvas fixed inset-0 z-50 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pb-8 pt-5">
        <SquadHomeScene
          compact
          foods={state.foods}
          label={t.squad.sceneLabel}
          locale={state.preferences.locale}
          emptyLabel={t.squad.emptyScene}
          moreLabel={t.squad.moreMembers}
        />

        <div className="flex flex-1 flex-col pt-6">
          <p className="fresh-eyebrow">{t.onboarding.eyebrow}</p>
          <h1 className="mt-2 font-editorial text-[2.4rem] font-black leading-[1.02] tracking-[-0.045em] text-ink">
            {t.onboarding.title}
          </h1>
          <p className="mt-4 text-base font-medium leading-7 text-ink-muted">{t.onboarding.body}</p>

          <div className="mt-6 divide-y divide-paper-line border-y border-paper-line">
            {[
              [Target, t.onboarding.pointDecision],
              [Check, t.onboarding.pointGame],
              [LockKeyhole, t.onboarding.pointPrivacy]
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof Target;
              return (
                <div key={label as string} className="flex items-center gap-3 py-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-100 text-leaf-700">
                    <ItemIcon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                  </span>
                  <span className="text-sm font-bold leading-5 text-ink">{label as string}</span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setState((current) => ({
                ...current,
                preferences: { ...current.preferences, hasSeenOnboarding: true }
              }))
            }
            className="fresh-button-primary mt-7 flex min-h-14 items-center justify-center gap-2 text-base"
          >
            {t.onboarding.start}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
