import { Plus, ScanLine } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarcodeScannerDialog } from "../components/BarcodeScannerDialog";
import { FutureFeatureCard } from "../components/FutureFeatureCard";
import { FoodForm, type RecentFoodSuggestion } from "../components/FoodForm";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import type { AddFoodInput } from "../hooks/useFoodActions";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { getQuickFoodTemplates } from "../lib/characters";

export function AddItemPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const actions = useFoodActions();
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);
  const [initial, setInitial] = useState<Partial<AddFoodInput> | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const quickTemplates = getQuickFoodTemplates(locale);

  const recentSuggestions: RecentFoodSuggestion[] = [...state.foods]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .reduce<RecentFoodSuggestion[]>((items, food) => {
      if (items.some((item) => item.normalizedName === food.normalizedName)) {
        return items;
      }
      return [
        ...items,
        {
          normalizedName: food.normalizedName,
          name: food.name,
          category: food.category,
          dateLabelType: food.dateLabelType
        }
      ];
    }, [])
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={t.quickAdd.eyebrow} title={t.pages.addTitle} body={t.quickAdd.body} />

      <FutureFeatureCard
        icon={ScanLine}
        eyebrow={t.barcode.eyebrow}
        title={t.barcode.title}
        body={t.barcode.body}
        actionLabel={t.barcode.action}
        badge={t.barcode.badge}
        onOpen={() => setBarcodeOpen(true)}
      />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-paper-line bg-paper-soft text-leaf-700">
            <Plus className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="fresh-section-title">{t.quickAdd.title}</h2>
        </div>
        <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-2">
          {quickTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setInitial(template.input);
                setFormKey((current) => current + 1);
                setSuccess(null);
              }}
              className="group w-[6.1rem] shrink-0 overflow-hidden rounded-[1.2rem] border border-paper-line bg-paper-soft p-2 text-left shadow-card transition hover:-translate-y-0.5 hover:border-leaf-500"
            >
              <div
                className="mx-auto grid h-[4.7rem] w-[4.7rem] place-items-center overflow-hidden rounded-[1rem] bg-paper"
                style={{ backgroundColor: template.character.soft }}
              >
                <img
                  src={template.character.asset}
                  alt=""
                  className="h-[108%] w-[108%] object-contain object-bottom transition group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-2 truncate text-center text-xs font-extrabold text-ink">
                {template.input.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {success ? (
        <p className="animate-fresh-pop rounded-[1rem] border border-leaf-500/20 bg-leaf-50 px-4 py-3 text-sm font-black text-leaf-700">
          {success}
        </p>
      ) : null}

      <section className="fresh-card p-4">
        <FoodForm
          key={formKey}
          initial={initial}
          locale={locale}
          t={t}
          submitLabel={t.actions.save}
          continueLabel={t.actions.saveAndAdd}
          recentSuggestions={recentSuggestions}
          onSubmit={(input, intent) => {
            actions.addFood(input);
            if (intent === "continue") {
              setSuccess(t.form.addedContinue);
              return true;
            }
            navigate("/");
            return true;
          }}
        />
      </section>

      <BarcodeScannerDialog
        open={barcodeOpen}
        locale={locale}
        t={t}
        onClose={() => setBarcodeOpen(false)}
        onUseDraft={(draft) => {
          setInitial(draft);
          setFormKey((current) => current + 1);
          setSuccess(null);
        }}
      />
    </div>
  );
}
