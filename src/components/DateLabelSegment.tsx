import type { DateLabelType, LocaleCode } from "../types/food";
import { dateLabelOptions } from "../i18n";
import { cx } from "../lib/ui";

interface DateLabelSegmentProps {
  value: DateLabelType;
  locale: LocaleCode;
  onChange(value: DateLabelType): void;
}

export function DateLabelSegment({ value, locale, onChange }: DateLabelSegmentProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      {dateLabelOptions(locale).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cx(
            "min-h-11 rounded-[0.9rem] border px-3 text-sm font-bold transition",
            value === option.value
              ? "border-ink bg-ink text-paper"
              : "border-paper-line bg-paper text-ink-muted"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
