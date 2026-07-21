import type { FoodItem, FoodQuantityUnit } from "../types/food";

const unitAliases: Array<[RegExp, FoodQuantityUnit]> = [
  [/^(?:items?|pieces?|pcs?|个|只|枚)$/i, "item"],
  [/^(?:portions?|servings?|份)$/i, "portion"],
  [/^(?:packs?|packets?|bags?|包|袋|盒)$/i, "pack"],
  [/^(?:bottles?|瓶)$/i, "bottle"],
  [/^g(?:rams?)?$/i, "g"],
  [/^kg|kilograms?$/i, "kg"],
  [/^ml|millilit(?:er|re)s?$/i, "ml"],
  [/^l|lit(?:er|re)s?$/i, "l"]
];

export function normalizeQuantityUnit(value?: string): FoodQuantityUnit | undefined {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;
  return unitAliases.find(([pattern]) => pattern.test(cleaned))?.[1];
}

export function parseQuantityText(value?: string): {
  amount?: number;
  unit?: FoodQuantityUnit;
} {
  const text = value?.trim();
  if (!text) return {};
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*([\p{L}]+)?/u);
  if (!match) return {};
  const amount = Number(match[1].replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return {};
  return { amount, unit: normalizeQuantityUnit(match[2]) };
}

export function quantityLabel(
  food: Pick<FoodItem, "quantityAmount" | "quantityUnit" | "quantityText">,
  locale: "zh-CN" | "en-GB"
): string | undefined {
  if (typeof food.quantityAmount !== "number") return food.quantityText;
  const labels: Record<FoodQuantityUnit, Record<"zh-CN" | "en-GB", string>> = {
    item: { "zh-CN": "个", "en-GB": "item" },
    portion: { "zh-CN": "份", "en-GB": "portion" },
    pack: { "zh-CN": "包", "en-GB": "pack" },
    bottle: { "zh-CN": "瓶", "en-GB": "bottle" },
    g: { "zh-CN": "克", "en-GB": "g" },
    kg: { "zh-CN": "千克", "en-GB": "kg" },
    ml: { "zh-CN": "毫升", "en-GB": "ml" },
    l: { "zh-CN": "升", "en-GB": "l" }
  };
  const unit = food.quantityUnit ?? "item";
  const amount = Number.isInteger(food.quantityAmount)
    ? food.quantityAmount.toString()
    : food.quantityAmount.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
  const suffix = labels[unit][locale];
  return locale === "zh-CN" ? `${amount}${suffix}` : `${amount} ${suffix}${food.quantityAmount === 1 ? "" : unit === "g" || unit === "kg" || unit === "ml" || unit === "l" ? "" : "s"}`;
}
