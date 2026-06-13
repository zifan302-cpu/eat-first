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
      className="min-h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
    >
      {categoryOptions(locale).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
