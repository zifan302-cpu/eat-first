import { Clock3, Trash2 } from "lucide-react";
import type { Messages } from "../i18n/en-GB";
import type { LocaleCode, RecipeHistoryEntry } from "../types/food";

interface RecipeHistoryPanelProps {
  history: RecipeHistoryEntry[];
  locale: LocaleCode;
  t: Messages;
  onOpen: (entry: RecipeHistoryEntry) => void;
  onClear: () => void;
}

export function RecipeHistoryPanel({
  history,
  locale,
  t,
  onOpen,
  onClear
}: RecipeHistoryPanelProps): JSX.Element | null {
  if (history.length === 0) return null;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <details className="rounded-[1rem] border border-paper-line bg-paper">
      <summary className="cursor-pointer list-none px-4 py-3 marker:hidden">
        <span className="flex items-center gap-3">
          <Clock3 className="h-4 w-4 text-leaf-700" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-ink">{t.recipe.historyTitle}</span>
            <span className="block text-xs font-medium text-ink-muted">
              {t.recipe.historyCount.replace("{count}", String(history.length))}
            </span>
          </span>
        </span>
      </summary>
      <div className="border-t border-paper-line p-3">
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onOpen(entry)}
              className="w-full rounded-[0.9rem] bg-paper-soft p-3 text-left transition hover:bg-leaf-50"
            >
              <span className="block text-xs font-black text-ink">
                {entry.recipes.map((recipe) => recipe.title).join(t.recipe.historySeparator)}
              </span>
              <span className="mt-1 block text-[0.68rem] font-semibold text-ink-muted">
                {dateFormatter.format(new Date(entry.createdAt))}
                {t.recipe.summarySeparator}{entry.servings} {t.recipe.peopleUnit}
                {t.recipe.summarySeparator}{entry.maxMinutes} {t.recipe.minutes}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-[0.8rem] text-xs font-black text-tomato hover:bg-[#F3DDD3]"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t.recipe.clearHistory}
        </button>
      </div>
    </details>
  );
}
