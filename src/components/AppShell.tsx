import type { PropsWithChildren } from "react";
import { BottomNav } from "./BottomNav";
import { useLocale } from "../hooks/useLocale";

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#fbf8ef] text-stone-950">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4">
        {children}
      </main>
      <BottomNav t={t} />
    </div>
  );
}
