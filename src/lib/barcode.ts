import type { DateLabelType, FoodCategory, LocaleCode } from "../types/food";

export interface ParsedBarcode {
  gtin: string;
  dateLabelType?: Extract<DateLabelType, "use_by" | "best_before">;
  labelDate?: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  quantityText?: string;
  category: FoodCategory;
  categoryConfidence: "high" | "low";
}

function parseGs1Date(value: string): string | undefined {
  if (!/^\d{6}$/.test(value)) return undefined;
  const year = 2000 + Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const encodedDay = Number(value.slice(4, 6));
  if (month < 1 || month > 12) return undefined;

  const day = encodedDay === 0 ? new Date(Date.UTC(year, month, 0)).getUTCDate() : encodedDay;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

function extractAi(raw: string, ai: "01" | "15" | "17"): string | undefined {
  const parenthesized = raw.match(new RegExp(`\\(${ai}\\)(\\d{${ai === "01" ? 14 : 6}})`));
  if (parenthesized) return parenthesized[1];

  const compact = raw.replace(/^\][A-Z]\d/, "").replace(/\u001d/g, "");
  const compactMatch = compact.match(new RegExp(`${ai}(\\d{${ai === "01" ? 14 : 6}})`));
  return compactMatch?.[1];
}

export function parseScannedBarcode(rawValue: string): ParsedBarcode | null {
  const raw = rawValue.trim();
  if (!raw) return null;

  const containsGs1ApplicationIdentifiers =
    raw.includes("(01)") || /^\][A-Z]\d/.test(raw) || raw.includes("\u001d") || /^01\d{14}\d+/.test(raw);
  let gtin = containsGs1ApplicationIdentifiers ? extractAi(raw, "01") : undefined;
  let bestBefore = containsGs1ApplicationIdentifiers ? extractAi(raw, "15") : undefined;
  let useBy = containsGs1ApplicationIdentifiers ? extractAi(raw, "17") : undefined;

  try {
    const url = new URL(raw);
    gtin ??= url.pathname.match(/\/01\/(\d{8,14})(?:\/|$)/)?.[1];
    bestBefore ??= url.searchParams.get("15") ?? undefined;
    useBy ??= url.searchParams.get("17") ?? undefined;
  } catch {
    // Ordinary retail barcodes are not URLs.
  }

  gtin ??= /^\d{8,14}$/.test(raw) ? raw : undefined;
  if (!gtin) return null;

  const useByDate = useBy ? parseGs1Date(useBy) : undefined;
  const bestBeforeDate = bestBefore ? parseGs1Date(bestBefore) : undefined;
  if (useByDate) return { gtin, dateLabelType: "use_by", labelDate: useByDate };
  if (bestBeforeDate) {
    return { gtin, dateLabelType: "best_before", labelDate: bestBeforeDate };
  }
  return { gtin };
}

export async function lookupBarcodeProduct(
  code: string,
  locale: LocaleCode,
  signal?: AbortSignal
): Promise<BarcodeProduct | null> {
  const response = await fetch(`/api/barcode/${encodeURIComponent(code)}?locale=${locale}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("BARCODE_LOOKUP_FAILED");
  const data = (await response.json()) as { product?: BarcodeProduct };
  return data.product ?? null;
}
