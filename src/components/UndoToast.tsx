import { RotateCcw, X } from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { CHARACTERS } from "../lib/characters";

export function UndoToast(): JSX.Element | null {
  const { undoEntry, undoState, dismissUndo } = useAppState();
  const { t } = useLocale();

  if (!undoEntry) {
    return null;
  }

  const label = t.undo[undoEntry.notice.action];

  return (
    <div className="fixed inset-x-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-[1.1rem] border border-ink bg-ink p-3 text-paper shadow-lift">
      <img
        src={CHARACTERS.mushroom.asset}
        alt=""
        className="h-11 w-11 shrink-0 object-contain"
      />
      <p className="min-w-0 flex-1 text-sm font-bold">
        {undoEntry.notice.name} · {label}
      </p>
      <button
        type="button"
        onClick={undoState}
        className="flex min-h-10 items-center gap-1 rounded-xl bg-paper px-3 text-xs font-black text-ink"
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
