import type { AppStateEnvelope, LocaleCode } from "../types/food";
import { APP_VERSION } from "./constants";

export const TALLY_FORM_ID = "ZjX92A";

export type FeedbackInstallMode = "standalone" | "browser";
export type ObservedFeedbackStep =
  | "added_food"
  | "handled_food"
  | "used_frozen_area"
  | "generated_recipe"
  | "updated_after_cooking";

const observedStepLabels: Record<ObservedFeedbackStep, string> = {
  added_food: "把食物添加到冰箱",
  handled_food: "记录吃掉、用一些、冷冻或丢弃",
  used_frozen_area: "使用冷冻区或把食物移回冰箱",
  generated_recipe: "生成菜谱建议",
  updated_after_cooking: "做完菜后更新冰箱"
};

interface FeedbackContext {
  locale: LocaleCode;
  installMode: FeedbackInstallMode;
  observedSteps: ObservedFeedbackStep[];
  entryPoint?: string;
}

type FeedbackState = Pick<AppStateEnvelope, "foods" | "recipeHistory">;

export function collectObservedFeedbackSteps(
  state: FeedbackState
): ObservedFeedbackStep[] {
  const actions = state.foods.flatMap((food) => food.actionHistory);
  const steps: ObservedFeedbackStep[] = [];

  if (state.foods.length > 0) steps.push("added_food");
  if (
    actions.some((action) =>
      ["partially_used", "eaten", "frozen", "discarded"].includes(action.type)
    )
  ) {
    steps.push("handled_food");
  }
  if (actions.some((action) => action.type === "frozen" || action.type === "restored")) {
    steps.push("used_frozen_area");
  }
  if (state.recipeHistory.length > 0) steps.push("generated_recipe");
  if (state.recipeHistory.some((entry) => Boolean(entry.cooked))) {
    steps.push("updated_after_cooking");
  }

  return steps;
}

function buildTallyParameters(context: FeedbackContext): URLSearchParams {
  return new URLSearchParams({
    app_version: APP_VERSION,
    locale: context.locale,
    install_mode: context.installMode,
    observed_steps: context.observedSteps
      .map((step) => observedStepLabels[step])
      .join(","),
    entry_point: context.entryPoint ?? "app_feedback"
  });
}

export function buildTallyEmbedUrl(context: FeedbackContext): string {
  const parameters = buildTallyParameters(context);
  parameters.set("alignLeft", "1");
  parameters.set("hideTitle", "1");
  parameters.set("transparentBackground", "1");
  parameters.set("dynamicHeight", "1");
  return `https://tally.so/embed/${TALLY_FORM_ID}?${parameters.toString()}`;
}

export function buildTallyPublicUrl(context: FeedbackContext): string {
  return `https://tally.so/r/${TALLY_FORM_ID}?${buildTallyParameters(context).toString()}`;
}

export function isTallyEvent(
  data: unknown,
  expectedEvent: "Tally.FormLoaded" | "Tally.FormSubmitted"
): boolean {
  if (typeof data !== "string") return false;
  if (data === expectedEvent || data.includes(`"${expectedEvent}"`)) return true;

  try {
    const parsed = JSON.parse(data) as { event?: unknown };
    return parsed.event === expectedEvent;
  } catch {
    return false;
  }
}
