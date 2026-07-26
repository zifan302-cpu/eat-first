import { Clock, History, Pencil, RotateCcw, Snowflake, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Messages } from "../i18n/en-GB";
import type { FoodItem, LocaleCode } from "../types/food";
import { quantityLabel } from "../lib/quantity";
import { FoodPortrait } from "./FoodPortrait";

interface FoodActionSheetProps {
  food: FoodItem;
  locale: LocaleCode;
  t: Messages;
  onClose(): void;
  onUsePart(id: string, remainingAmount?: number, remainingText?: string): void;
  onUseAll(id: string): void;
  onFreeze(id: string): void;
  onThaw(id: string): void;
  onLater(id: string): void;
  onDiscard(id: string): void;
  onEdit(food: FoodItem): void;
  onDelete(id: string): void;
}

export function FoodActionSheet({
  food,
  locale,
  t,
  onClose,
  onUsePart,
  onUseAll,
  onFreeze,
  onThaw,
  onLater,
  onDiscard,
  onEdit,
  onDelete
}: FoodActionSheetProps): JSX.Element {
  const [showPartial, setShowPartial] = useState(false);
  const [showFreezeAdvice, setShowFreezeAdvice] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(food.quantityAmount?.toString() ?? "");
  const [remainingText, setRemainingText] = useState(food.quantityText ?? "");
  const currentLabel = quantityLabel(food, locale);
  const numericRemaining = Number(remainingAmount);
  const partialIsInvalid =
    typeof food.quantityAmount === "number"
      ? !remainingAmount.trim() ||
        !Number.isFinite(numericRemaining) ||
        numericRemaining < 0 ||
        numericRemaining >= food.quantityAmount
      : !remainingText.trim();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function finish(action: () => void) {
    action();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/38 p-3 sm:items-center sm:justify-center" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-action-title"
        className="paper-canvas w-full max-w-md rounded-[1.55rem] border border-ink/15 p-4 shadow-lift"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start gap-3">
          <FoodPortrait food={food} size="sm" />
          <div className="min-w-0 flex-1">
            <h2 id="food-action-title" className="truncate font-editorial text-xl font-black text-ink">{food.name}</h2>
            <p className="mt-1 text-sm font-semibold text-ink-muted">{currentLabel ?? t.dateTypes[food.dateLabelType]}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t.actions.close} className="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-paper">
            <X aria-hidden className="h-5 w-5" />
          </button>
        </header>

        {showPartial && food.status === "active" ? (
          <div className="mt-4 rounded-[1.1rem] border border-leaf-500/25 bg-leaf-50 p-4">
            <h3 className="font-editorial text-lg font-black text-ink">{t.fridge.useSomeTitle}</h3>
            <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">{t.fridge.useSomeBody}</p>
            {typeof food.quantityAmount === "number" ? (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[0.25, 0.5, 0.75].map((usedFraction) => (
                    <button
                      key={usedFraction}
                      type="button"
                      onClick={() => setRemainingAmount((food.quantityAmount! * (1 - usedFraction)).toFixed(2).replace(/\.00$/, ""))}
                      className="min-h-10 rounded-xl border border-paper-line bg-paper text-xs font-black text-leaf-700"
                    >
                      {t.actions.useSome} {usedFraction * 100}%
                    </button>
                  ))}
                </div>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-black text-ink">{t.fridge.remainingAmount}</span>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" step="any" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value)} className="fresh-field" />
                    <span className="min-w-12 text-sm font-black text-ink-muted">{t.quantityUnits[food.quantityUnit ?? "item"]}</span>
                  </div>
                </label>
              </>
            ) : (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs font-black text-ink">{t.fridge.remainingText}</span>
                <input value={remainingText} onChange={(event) => setRemainingText(event.target.value)} placeholder={t.fridge.remainingPlaceholder} className="fresh-field" />
              </label>
            )}
            <button
              type="button"
              onClick={() => finish(() => onUsePart(food.id, remainingAmount ? Number(remainingAmount) : undefined, remainingText))}
              disabled={partialIsInvalid}
              className="fresh-button-primary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.fridge.savePartial}
            </button>
            {typeof food.quantityAmount === "number" && partialIsInvalid ? (
              <p className="mt-2 text-xs font-bold text-tomato">{t.recipe.invalidRemaining}</p>
            ) : null}
          </div>
        ) : showFreezeAdvice && food.status === "active" ? (
          <div className="mt-4 rounded-[1.1rem] border border-freezer/25 bg-[#E8EFF0] p-4">
            <h3 className="font-editorial text-lg font-black text-ink">{t.fridge.freezeTitle}</h3>
            <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">{t.fridge.freezeBody}</p>
            <p className="mt-3 text-xs font-black text-ink">{t.fridge.freezeTipsTitle}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs font-semibold leading-5 text-ink-muted">
              {t.fridge.freezeTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowFreezeAdvice(false)} className="fresh-button-secondary">
                {t.actions.cancel}
              </button>
              <button
                type="button"
                onClick={() => finish(() => onFreeze(food.id))}
                className="fresh-button-primary"
              >
                <Snowflake aria-hidden className="mr-2 inline h-4 w-4" />
                {t.fridge.confirmFreeze}
              </button>
            </div>
          </div>
        ) : food.status === "frozen" ? (
          <div className="mt-4 rounded-[1.1rem] border border-freezer/25 bg-[#E8EFF0] p-4">
            <h3 className="font-editorial text-lg font-black text-ink">{t.status.frozen}</h3>
            <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">{t.fridge.frozenBody}</p>
            <p className="mt-3 text-xs font-black text-ink">{t.fridge.thawTipsTitle}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs font-semibold leading-5 text-ink-muted">
              {t.fridge.thawTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => finish(() => onThaw(food.id))} className="fresh-button-primary">
                <RotateCcw aria-hidden className="mr-2 inline h-4 w-4" />
                {t.actions.thaw}
              </button>
              <button type="button" onClick={() => finish(() => onUseAll(food.id))} className="fresh-button-secondary">
                {t.actions.useAll}
              </button>
              <button type="button" onClick={() => finish(() => onEdit(food))} className="fresh-button-secondary">
                <Pencil aria-hidden className="mr-2 inline h-4 w-4" />
                {t.actions.edit}
              </button>
              <button type="button" onClick={() => finish(() => onDiscard(food.id))} className="fresh-button-secondary">
                <Trash2 aria-hidden className="mr-2 inline h-4 w-4" />
                {t.actions.discard}
              </button>
            </div>
          </div>
        ) : food.status === "active" ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setShowPartial(true)} className="fresh-button-primary">{t.actions.useSome}</button>
            <button type="button" onClick={() => finish(() => onUseAll(food.id))} className="fresh-button-secondary">{t.actions.useAll}</button>
            <button type="button" onClick={() => setShowFreezeAdvice(true)} className="fresh-button-secondary"><Snowflake aria-hidden className="mr-2 inline h-4 w-4" />{t.actions.freeze}</button>
            <button type="button" onClick={() => finish(() => onLater(food.id))} className="fresh-button-secondary"><Clock aria-hidden className="mr-2 inline h-4 w-4" />{t.actions.later}</button>
            <button type="button" onClick={() => finish(() => onEdit(food))} className="fresh-button-secondary"><Pencil aria-hidden className="mr-2 inline h-4 w-4" />{t.actions.edit}</button>
            <button type="button" onClick={() => finish(() => onDiscard(food.id))} className="fresh-button-secondary"><Trash2 aria-hidden className="mr-2 inline h-4 w-4" />{t.actions.discard}</button>
            <button type="button" onClick={() => finish(() => onDelete(food.id))} className="col-span-2 min-h-10 rounded-xl text-xs font-black text-tomato">{t.actions.delete}</button>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.1rem] border border-paper-line bg-paper-soft p-4">
            <h3 className="font-editorial text-lg font-black text-ink">{t.status[food.status]}</h3>
            <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">{t.fridge.completedBody}</p>
            <button
              type="button"
              onClick={() => finish(() => onDelete(food.id))}
              className="mt-3 min-h-10 w-full rounded-xl text-xs font-black text-tomato hover:bg-[#F3DDD3]"
            >
              {t.actions.delete}
            </button>
          </div>
        )}

        {food.actionHistory.length > 0 ? (
          <details className="mt-4 rounded-[0.95rem] border border-paper-line bg-paper">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-black text-leaf-700">
              <History className="h-4 w-4" aria-hidden />
              {t.fridge.actionHistory}
            </summary>
            <div className="space-y-2 border-t border-paper-line p-3">
              {food.actionHistory.slice(-5).reverse().map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-ink">{t.historyActions[item.type]}</span>
                  <time className="shrink-0 font-semibold text-ink-muted">
                    {new Date(item.at).toLocaleString(locale)}
                  </time>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </section>
    </div>
  );
}
