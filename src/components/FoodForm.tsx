import { useState } from "react";
import type { DateLabelType, FoodCategory, LocaleCode } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import type { AddFoodInput } from "../hooks/useFoodActions";
import { nextDayInputValue, todayInputValue } from "../lib/dates";
import { guessCategoryFromName } from "../lib/nameNormalization";
import { CategorySelect } from "./CategorySelect";
import { DateLabelSegment } from "./DateLabelSegment";
import { QuickDateChips } from "./QuickDateChips";
import { cx } from "../lib/ui";

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
  onSubmit(input: AddFoodInput, intent: SubmitIntent): boolean | void;
  onCancel?: () => void;
}

const shelfLifeOptions = [1, 2, 3, 5, 7] as const;

export function FoodForm({
  initial,
  locale,
  t,
  submitLabel,
  continueLabel,
  recentSuggestions = [],
  onSubmit,
  onCancel
}: FoodFormProps): JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? "other");
  const [categoryTouched, setCategoryTouched] = useState(Boolean(initial?.category));
  const [dateLabelType, setDateLabelType] = useState<DateLabelType>(
    initial?.dateLabelType ?? "use_by"
  );
  const [labelDate, setLabelDate] = useState(initial?.labelDate ?? todayInputValue());
  const [openedShelfLifeDays, setOpenedShelfLifeDays] = useState(
    initial?.openedShelfLifeDays ?? 2
  );
  const [quantityText, setQuantityText] = useState(initial?.quantityText ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

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
      quantityText,
      note
    };
  }

  function submit(intent: SubmitIntent) {
    const input = buildInput();
    if (!input) {
      return;
    }

    const result = onSubmit(input, intent);
    if (intent === "continue" && result !== false) {
      setName("");
      setQuantityText("");
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
        <span className="mb-2 block text-sm font-bold text-stone-700">{t.form.name}</span>
        <input
          value={name}
          onChange={(event) => updateName(event.target.value)}
          placeholder={t.form.namePlaceholder}
          className="min-h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        />
      </label>

      {recentSuggestions.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-bold text-stone-700">{t.form.recentItems}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
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
                className="min-h-9 shrink-0 rounded-full border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-stone-700">{t.form.category}</span>
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
        <span className="mb-2 block text-sm font-bold text-stone-700">
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
            <span className="mb-2 block text-sm font-bold text-stone-700">{t.form.labelDate}</span>
            <input
              type="date"
              value={labelDate}
              onChange={(event) => setLabelDate(event.target.value)}
              className="min-h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            />
          </label>
          <QuickDateChips value={labelDate} onChange={setLabelDate} t={t} />
        </div>
      ) : null}

      {dateLabelType === "opened" ? (
        <div>
          <span className="mb-2 block text-sm font-bold text-stone-700">
            {t.form.openedShelfLifeDays}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {shelfLifeOptions.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setOpenedShelfLifeDays(days)}
                className={cx(
                  "min-h-10 rounded-md border px-1 text-sm font-semibold",
                  openedShelfLifeDays === days
                    ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                    : "border-stone-200 bg-white text-stone-600"
                )}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-stone-700">{t.form.quantityText}</span>
        <input
          value={quantityText}
          onChange={(event) => setQuantityText(event.target.value)}
          placeholder={t.form.quantityPlaceholder}
          className="min-h-12 w-full rounded-md border border-stone-200 bg-white px-3 text-base font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-stone-700">{t.form.note}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t.form.notePlaceholder}
          rows={3}
          className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-base font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        />
      </label>

      {error ? (
        <p className="rounded-md border border-tomato/20 bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
          {error}
        </p>
      ) : null}

      <div className={cx("grid gap-2", onCancel || continueLabel ? "grid-cols-2" : "grid-cols-1")}>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-md border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700"
          >
            {t.actions.cancel}
          </button>
        ) : null}
        {continueLabel ? (
          <button
            type="button"
            onClick={() => submit("continue")}
            className="min-h-12 rounded-md border border-leaf-500 bg-white px-4 text-sm font-bold text-leaf-700"
          >
            {continueLabel}
          </button>
        ) : null}
        <button
          type="submit"
          className={cx(
            "min-h-12 rounded-md bg-leaf-500 px-4 text-sm font-bold text-white",
            onCancel && continueLabel ? "col-span-2" : ""
          )}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
