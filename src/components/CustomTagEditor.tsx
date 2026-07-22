import { Plus, X } from "lucide-react";
import { useState } from "react";

interface CustomTagEditorProps {
  items: string[];
  maxItems: number;
  label: string;
  hint: string;
  placeholder: string;
  addLabel: string;
  duplicateMessage: string;
  limitMessage: string;
  removeLabel: string;
  onChange: (items: string[]) => void;
}

export function CustomTagEditor({
  items,
  maxItems,
  label,
  hint,
  placeholder,
  addLabel,
  duplicateMessage,
  limitMessage,
  removeLabel,
  onChange
}: CustomTagEditorProps): JSX.Element {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    const nextItem = draft.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!nextItem) return;
    if (items.some((item) => item.toLocaleLowerCase() === nextItem.toLocaleLowerCase())) {
      setError(duplicateMessage);
      return;
    }
    if (items.length >= maxItems) {
      setError(limitMessage);
      return;
    }
    onChange([...items, nextItem]);
    setDraft("");
    setError(null);
  }

  return (
    <section className="space-y-3 rounded-[0.9rem] bg-paper-soft p-3">
      <div>
        <h4 className="text-sm font-black text-ink">{label}</h4>
        <p className="mt-0.5 text-xs font-medium leading-5 text-ink-muted">{hint}</p>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.toLocaleLowerCase()}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-paper-line bg-paper pl-3 pr-1.5 text-xs font-bold text-ink"
            >
              {item}
              <button
                type="button"
                onClick={() => {
                  onChange(items.filter((current) => current !== item));
                  setError(null);
                }}
                aria-label={removeLabel.replace("{name}", item)}
                className="grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-paper-line/60"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <form
        className="grid grid-cols-[1fr_auto] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addItem();
        }}
      >
        <label>
          <span className="sr-only">{label}</span>
          <input
            value={draft}
            maxLength={24}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            className="fresh-field"
          />
        </label>
        <button
          type="submit"
          disabled={!draft.trim()}
          className="min-h-11 rounded-[0.9rem] border border-leaf-700 bg-leaf-700 px-3 text-xs font-black text-paper disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Plus className="mr-1 inline h-4 w-4" aria-hidden />
          {addLabel}
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-xs font-bold leading-5 text-tomato">{error}</p>
      ) : null}
    </section>
  );
}
