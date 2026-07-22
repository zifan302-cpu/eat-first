import { RecipeDialog } from "../components/RecipeDialog";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { getTopFoods } from "../lib/priority";
import { isRecipeEligible } from "../lib/recipes";

export function RecipesPage(): JSX.Element {
  const { state } = useAppState();
  const { locale, t } = useLocale();
  const foods = getTopFoods(state.foods, state.foods.length);
  const suggestedFoods = foods.filter(isRecipeEligible).slice(0, 3);

  return (
    <RecipeDialog
      open
      embedded
      suggestedFoods={suggestedFoods}
      foods={foods}
      locale={locale}
      preferences={state.preferences.recipe}
      t={t}
    />
  );
}
