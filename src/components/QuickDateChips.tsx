import { addCalendarDays, toDateInputValue } from "../lib/dates";
import type { Messages } from "../i18n/en-GB";
import { cx } from "../lib/ui";

const offsets = [0, 1, 2, 3, 7] as const;

interface QuickDateChipsProps {
  value?: string;
  onChange(value: string): void;
  t: Messages;
}

export function QuickDateChips({ value, onChange, t }: QuickDateChipsProps): JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-2">
      {offsets.map((offset) => {
        const nextValue = toDateInputValue(addCalendarDays(new Date(), offset));
        const label = offset === 0 ? t.form.today : offset === 1 ? t.form.tomorrow : `+${offset}`;
        return (
          <button
            key={offset}
            type="button"
            onClick={() => onChange(nextValue)}
            className={cx(
              "min-h-10 rounded-md border px-2 text-sm font-semibold",
              value === nextValue
                ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                : "border-stone-200 bg-white text-stone-600"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
