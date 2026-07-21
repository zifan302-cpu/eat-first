import { RotateCcw, X } from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { useEffect } from "react";

export function UndoToast(): JSX.Element | null {
  const { undoEntry, undoState, dismissUndo } = useAppState();
  const { t } = useLocale();

  useEffect(() => {
    if (!undoEntry) return undefined;
    const timer = window.setTimeout(dismissUndo, 3800);
    return () => window.clearTimeout(timer);
  }, [dismissUndo, undoEntry]);

  if (!undoEntry) {
    return null;
  }

  const label = t.undo[undoEntry.notice.action];

  return (
    <div role="status" aria-live="polite" className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-2 rounded-[1rem] border border-ink bg-ink px-3 py-2 text-paper shadow-lift">
      <p className="min-w-0 flex-1 truncate text-sm font-bold">
        {undoEntry.notice.name} · {label}
      </p>
      <button
        type="button"
        onClick={undoState}
        className="flex min-h-9 items-center gap-1 rounded-xl bg-paper px-3 text-xs font-black text-ink"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        {t.actions.undo}
      </button>
      <button type="button" onClick={dismissUndo} aria-label={t.actions.close}>
        <X className="h-4 w-4 text-paper/70" aria-hidden />
      </button>
    </div>
  );
}
