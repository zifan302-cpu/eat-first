import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FoodForm, type RecentFoodSuggestion } from "../components/FoodForm";
import { useAppState } from "../hooks/useAppState";
import { ProGateModal } from "../components/ProGateModal";
import { ProLimitError, useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";

export function AddItemPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const actions = useFoodActions();
  const navigate = useNavigate();
  const [showPro, setShowPro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold leading-tight">{t.pages.addTitle}</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-stone-600">{t.app.subtitle}</p>
      </header>

      {error ? (
        <p className="rounded-md border border-tomato/20 bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-leaf-500/20 bg-leaf-50 px-3 py-2 text-sm font-semibold text-leaf-700">
          {success}
        </p>
      ) : null}

      <FoodForm
        locale={locale}
        t={t}
        submitLabel={t.actions.save}
        continueLabel={t.actions.saveAndAdd}
        recentSuggestions={recentSuggestions}
        onSubmit={(input, intent) => {
          try {
            actions.addFood(input);
            setError(null);
            if (intent === "continue") {
              setSuccess(t.form.addedContinue);
              return true;
            }
            navigate("/");
            return true;
          } catch (cause) {
            if (cause instanceof ProLimitError) {
              setError(t.form.proLimit);
              setSuccess(null);
              setShowPro(true);
              return false;
            }
            throw cause;
          }
        }}
      />

      <ProGateModal open={showPro} t={t} onClose={() => setShowPro(false)} />
    </div>
  );
}
