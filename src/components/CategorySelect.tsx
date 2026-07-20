import type { FoodCategory, LocaleCode } from "../types/food";
import { categoryOptions } from "../i18n";

interface CategorySelectProps {
  value: FoodCategory;
  locale: LocaleCode;
  onChange(value: FoodCategory): void;
}

export function CategorySelect({ value, locale, onChange }: CategorySelectProps): JSX.Element {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as FoodCategory)}
      className="fresh-field"
    >
      {categoryOptions(locale).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
