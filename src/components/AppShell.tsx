import type { PropsWithChildren } from "react";
import { BottomNav } from "./BottomNav";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { UndoToast } from "./UndoToast";
import { useLocale } from "../hooks/useLocale";

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const { t } = useLocale();

  return (
    <div className="paper-canvas relative min-h-screen text-ink">
      <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>
      <BottomNav t={t} />
      <UndoToast />
      <OnboardingOverlay />
    </div>
  );
}
