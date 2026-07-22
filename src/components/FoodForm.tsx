import { useEffect, useMemo, useState } from "react";
import type { DateLabelType, FoodCategory, FoodQuantityUnit, LocaleCode } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import type { AddFoodInput } from "../hooks/useFoodActions";
import { nextDayInputValue, todayInputValue } from "../lib/dates";
import { guessCategoryFromName } from "../lib/nameNormalization";
import { CategorySelect } from "./CategorySelect";
import { DateLabelSegment } from "./DateLabelSegment";
import { QuickDateChips } from "./QuickDateChips";
import { cx } from "../lib/ui";
import { FOOD_QUANTITY_UNITS } from "../lib/constants";
import { parseQuantityText } from "../lib/quantity";

export interface RecentFoodSuggestion {
  normalizedName: string;
  name: string;
  category: FoodCategory;
  dateLabelType: DateLabelType;
}

type SubmitIntent = "save" | "continue";

interface FoodFormProps {
  initial?: Partial<AddFoodInput>;
  locale: LocaleCode;
  t: Messages;
  submitLabel: string;
  continueLabel?: string;
  recentSuggestions?: RecentFoodSuggestion[];
  draftStorageKey?: string;
  onSubmit(input: AddFoodInput, intent: SubmitIntent): boolean | void;
  onCancel?: () => void;
}

const shelfLifeOptions = [1, 2, 3, 5, 7] as const;

function loadDraft(key?: string): Partial<AddFoodInput> | undefined {
  if (!key) return undefined;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "null") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Partial<AddFoodInput>) : undefined;
  } catch {
    return undefined;
  }
}

export function FoodForm({
  initial,
  locale,
  t,
  submitLabel,
  continueLabel,
  recentSuggestions = [],
  draftStorageKey,
  onSubmit,
  onCancel
}: FoodFormProps): JSX.Element {
  const formInitial = useMemo(
    () => initial ?? loadDraft(draftStorageKey),
    [draftStorageKey, initial]
  );
  const parsedInitialQuantity = parseQuantityText(formInitial?.quantityText);
  const [name, setName] = useState(formInitial?.name ?? "");
  const [category, setCategory] = useState<FoodCategory>(formInitial?.category ?? "other");
  const [categoryTouched, setCategoryTouched] = useState(Boolean(formInitial?.category));
  const [dateLabelType, setDateLabelType] = useState<DateLabelType>(
    formInitial?.dateLabelType ?? "use_by"
  );
  const [labelDate, setLabelDate] = useState(formInitial?.labelDate ?? todayInputValue());
  const [openedShelfLifeDays, setOpenedShelfLifeDays] = useState(
    formInitial?.openedShelfLifeDays ?? 2
  );
  const [quantityAmount, setQuantityAmount] = useState(
    formInitial?.quantityAmount?.toString() ?? parsedInitialQuantity.amount?.toString() ?? ""
  );
  const [quantityUnit, setQuantityUnit] = useState<FoodQuantityUnit>(
    formInitial?.quantityUnit ?? parsedInitialQuantity.unit ?? "item"
  );
  const [quantityText, setQuantityText] = useState(
    parsedInitialQuantity.amount ? "" : formInitial?.quantityText ?? ""
  );
  const [note, setNote] = useState(formInitial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!draftStorageKey) return;
    const draft: Partial<AddFoodInput> = {
      name,
      category,
      dateLabelType,
      labelDate,
      openedShelfLifeDays,
      quantityAmount: quantityAmount ? Number(quantityAmount) : undefined,
      quantityUnit,
      quantityText,
      note,
      barcode: formInitial?.barcode,
      source: formInitial?.source
    };
    try {
      sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch {
      // Draft recovery is best-effort when browser storage is unavailable.
    }
  }, [
    formInitial?.barcode,
    category,
    dateLabelType,
    draftStorageKey,
    formInitial?.source,
    labelDate,
    name,
    note,
    openedShelfLifeDays,
    quantityAmount,
    quantityText,
    quantityUnit
  ]);

  function clearDraft() {
    if (!draftStorageKey) return;
    try {
      sessionStorage.removeItem(draftStorageKey);
    } catch {
      // The form remains usable even when browser storage is unavailable.
    }
  }

  function updateName(nextName: string) {
    setName(nextName);
    if (!categoryTouched || category === "other") {
      const guessed = guessCategoryFromName(nextName);
      if (guessed !== "other") {
        setCategory(guessed);
      }
    }
  }

  function buildInput(): AddFoodInput | null {
    if (!name.trim()) {
      setError(t.form.requiredName);
      return null;
    }
    if (dateLabelType !== "none" && !labelDate) {
      setError(t.form.requiredDate);
      return null;
    }

    setError(null);
    return {
      name,
      category,
      dateLabelType,
      labelDate: dateLabelType === "none" ? undefined : labelDate,
      openedShelfLifeDays: dateLabelType === "opened" ? openedShelfLifeDays : undefined,
      quantityAmount: quantityAmount ? Number(quantityAmount) : undefined,
      quantityUnit: quantityAmount ? quantityUnit : undefined,
      quantityText,
      barcode: formInitial?.barcode,
      note,
      source: formInitial?.source
    };
  }

  function submit(intent: SubmitIntent) {
    const input = buildInput();
    if (!input) {
      return;
    }

    const result = onSubmit(input, intent);
    if (result !== false) clearDraft();
    if (intent === "continue" && result !== false) {
      setName("");
      setQuantityText("");
      setQuantityAmount("");
      setNote("");
      setLabelDate(dateLabelType === "none" ? "" : nextDayInputValue());
      setCategoryTouched(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit("save");
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-black text-ink">{t.form.name}</span>
        <input
          value={name}
          onChange={(event) => updateName(event.target.value)}
          placeholder={t.form.namePlaceholder}
          className="fresh-field"
        />
      </label>

      {formInitial?.barcode ? (
        <p className="rounded-[0.9rem] border border-paper-line bg-paper px-3 py-2 text-xs font-bold text-ink-muted">
          {t.barcode.codeLabel}: <span className="font-mono text-ink">{formInitial.barcode}</span>
        </p>
      ) : null}

      {recentSuggestions.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-black text-ink">{t.quickAdd.recent}</p>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {recentSuggestions.map((item) => (
              <button
                key={item.normalizedName}
                type="button"
                onClick={() => {
                  setName(item.name);
                  setCategory(item.category);
                  setDateLabelType(item.dateLabelType);
                  if (item.dateLabelType !== "none" && !labelDate) {
                    setLabelDate(nextDayInputValue());
                  }
                  setCategoryTouched(false);
                }}
                className="min-h-9 shrink-0 rounded-full border border-paper-line bg-paper px-3 text-xs font-bold text-leaf-700"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-black text-ink">{t.form.category}</span>
        <CategorySelect
          value={category}
          locale={locale}
          onChange={(value) => {
            setCategory(value);
            setCategoryTouched(true);
          }}
        />
      </label>

      <div>
        <span className="mb-2 block text-sm font-black text-ink">
          {t.form.dateLabelType}
        </span>
        <DateLabelSegment
          value={dateLabelType}
          locale={locale}
          onChange={(value) => {
            setDateLabelType(value);
            if (value !== "none" && !labelDate) {
              setLabelDate(todayInputValue());
            }
          }}
        />
      </div>

      {dateLabelType !== "none" ? (
        <div className="space-y-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-ink">{t.form.labelDate}</span>
            <input
              type="date"
              value={labelDate}
              onChange={(event) => setLabelDate(event.target.value)}
              className="fresh-field"
            />
          </label>
          <QuickDateChips value={labelDate} onChange={setLabelDate} t={t} />
        </div>
      ) : null}

      {dateLabelType === "opened" ? (
        <div>
          <span className="mb-2 block text-sm font-black text-ink">
            {t.form.openedShelfLifeDays}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {shelfLifeOptions.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setOpenedShelfLifeDays(days)}
                className={cx(
                  "min-h-10 rounded-[0.8rem] border px-1 text-sm font-bold",
                  openedShelfLifeDays === days
                    ? "border-ink bg-ink text-paper"
                    : "border-paper-line bg-paper text-ink-muted"
                )}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-black text-ink">{t.form.quantityText}</span>
        <div className="grid grid-cols-[1fr_1.15fr] gap-2">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantityAmount}
            onChange={(event) => setQuantityAmount(event.target.value)}
            placeholder={t.form.quantityAmount}
            className="fresh-field"
          />
          <select
            value={quantityUnit}
            onChange={(event) => setQuantityUnit(event.target.value as FoodQuantityUnit)}
            className="fresh-field"
            aria-label={t.form.quantityUnit}
          >
            {FOOD_QUANTITY_UNITS.map((unit) => (
              <option key={unit} value={unit}>{t.quantityUnits[unit]}</option>
            ))}
          </select>
        </div>
        {!quantityAmount ? (
          <input
            value={quantityText}
            onChange={(event) => setQuantityText(event.target.value)}
            placeholder={t.form.quantityPlaceholder}
            className="fresh-field mt-2"
          />
        ) : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-black text-ink">{t.form.note}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t.form.notePlaceholder}
          rows={3}
          className="w-full rounded-[1rem] border border-paper-line bg-paper-soft px-4 py-3 text-base font-semibold text-ink outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100/70"
        />
      </label>

      {error ? (
        <p className="rounded-[1rem] border border-tomato/20 bg-[#F3DDD3] px-4 py-3 text-sm font-bold text-tomato">
          {error}
        </p>
      ) : null}

      <div className={cx("grid gap-2", onCancel || continueLabel ? "grid-cols-2" : "grid-cols-1")}>
        {onCancel ? (
          <button
            type="button"
            onClick={() => {
              clearDraft();
              onCancel();
            }}
            className="fresh-button-secondary"
          >
            {t.actions.cancel}
          </button>
        ) : null}
        {continueLabel ? (
          <button
            type="button"
            onClick={() => submit("continue")}
            className="fresh-button-secondary border-leaf-500 text-leaf-700"
          >
            {continueLabel}
          </button>
        ) : null}
        <button
          type="submit"
          className={cx(
            "fresh-button-primary",
            onCancel && continueLabel ? "col-span-2" : ""
          )}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
