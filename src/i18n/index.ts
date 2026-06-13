import type { DateLabelType, FoodCategory, LocaleCode } from "../types/food";
import { CATEGORY_ICONS, DATE_LABEL_TYPES, FOOD_CATEGORIES } from "../lib/constants";
import { enGB, type Messages } from "./en-GB";
import { zhCN } from "./zh-CN";

export const dictionaries: Record<LocaleCode, Messages> = {
  "en-GB": enGB,
  "zh-CN": zhCN
};

export function getMessages(locale: LocaleCode): Messages {
  return dictionaries[locale] ?? enGB;
}

export function resolveLocale(input?: string): LocaleCode {
  return input?.toLowerCase().startsWith("zh") ? "zh-CN" : "en-GB";
}

export function dateLabelOptions(locale: LocaleCode): Array<{ value: DateLabelType; label: string }> {
  const t = getMessages(locale);
  return DATE_LABEL_TYPES.map((value) => ({ value, label: t.dateTypes[value] }));
}

export function categoryOptions(locale: LocaleCode): Array<{ value: FoodCategory; label: string }> {
  const t = getMessages(locale);
  return FOOD_CATEGORIES.map((value) => ({
    value,
    label: `${CATEGORY_ICONS[value]} ${t.categories[value]}`
  }));
}
