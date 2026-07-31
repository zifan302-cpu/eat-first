import type { FoodItem, PriorityVerdict } from "../types/food";
import { getPriority } from "./priority";

export type FreshnessStage = "fresh" | "watch" | "urgent" | "check";

export function freshnessStageForVerdict(verdict: PriorityVerdict): FreshnessStage {
  if (verdict === "expired_use_by" || verdict === "quality_check" || verdict === "opened_due") {
    return "check";
  }
  if (verdict === "use_today") return "urgent";
  if (verdict === "use_soon" || verdict === "opened_soon" || verdict === "no_date") return "watch";
  return "fresh";
}

export function getFreshnessStage(food: FoodItem, today = new Date()): FreshnessStage {
  return freshnessStageForVerdict(getPriority(food, today).verdict);
}
