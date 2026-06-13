import { addDays } from "date-fns";
import type { FoodItem, PrimaryCta, PriorityResult } from "../types/food";
import { daysFromToday, isDateAfterToday, parseDateInput, toDateInputValue } from "./dates";

function result(
  score: number,
  verdict: PriorityResult["verdict"],
  primaryCta: PrimaryCta,
  secondaryCtas: PrimaryCta[],
  explanationKey: string
): PriorityResult {
  return { score, verdict, primaryCta, secondaryCtas, explanationKey };
}

export function getPriority(item: FoodItem, today = new Date()): PriorityResult {
  if (item.dateLabelType === "none") {
    return result(5, "no_date", "later", ["check"], "priority.noDate");
  }

  const days = daysFromToday(item.labelDate, today);
  if (typeof days !== "number") {
    return result(5, "no_date", "later", ["check"], "priority.noDate");
  }

  if (item.dateLabelType === "use_by") {
    if (days < 0) {
      return result(100, "expired_use_by", "discard", ["check"], "priority.expiredUseBy");
    }
    if (days === 0) {
      return result(95, "use_today", "eat", ["freeze", "later"], "priority.useToday");
    }
    if (days === 1) {
      return result(90, "use_soon", "eat", ["freeze", "later"], "priority.useTomorrow");
    }
    if (days <= 2) {
      return result(80, "use_soon", "eat", ["freeze", "later"], "priority.useSoon");
    }
    return result(Math.max(20, 70 - (days - 3) * 5), "normal", "eat", ["freeze", "later"], "priority.normalUseBy");
  }

  if (item.dateLabelType === "best_before") {
    if (days < 0) {
      return result(60, "quality_check", "check", ["later", "discard"], "priority.bestBeforePast");
    }
    if (days <= 1) {
      return result(50, "quality_check", "check", ["later"], "priority.bestBeforeSoon");
    }
    return result(15, "normal", "check", ["later"], "priority.bestBeforeNormal");
  }

  if (item.dateLabelType === "opened") {
    const openedDate = parseDateInput(item.labelDate);
    if (!openedDate) {
      return result(5, "no_date", "later", ["check"], "priority.noDate");
    }
    const shelfLife = item.openedShelfLifeDays ?? 2;
    const reminderDate = toDateInputValue(addDays(openedDate, shelfLife));
    const untilReminder = daysFromToday(reminderDate, today) ?? 999;
    if (untilReminder < 0) {
      return result(70, "opened_due", "check", ["discard", "later"], "priority.openedDue");
    }
    if (untilReminder <= 1) {
      return result(55, "opened_soon", "check", ["later"], "priority.openedSoon");
    }
    return result(25, "normal", "check", ["later"], "priority.openedNormal");
  }

  return result(5, "no_date", "later", ["check"], "priority.noDate");
}

export function getActiveFoods(foods: FoodItem[]): FoodItem[] {
  return foods.filter((food) => food.status === "active");
}

function sortFoodsByPriority(a: FoodItem, b: FoodItem, today = new Date()): number {
  const priorityDelta = getPriority(b, today).score - getPriority(a, today).score;
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const aDate = a.labelDate ?? "9999-12-31";
  const bDate = b.labelDate ?? "9999-12-31";
  if (aDate !== bDate) {
    return aDate.localeCompare(bDate);
  }

  return a.createdAt.localeCompare(b.createdAt);
}

export function getTopFoods(foods: FoodItem[], topN = 3, today = new Date()): FoodItem[] {
  return getActiveFoods(foods)
    .filter((food) => !isDateAfterToday(food.snoozedUntil, today))
    .sort((a, b) => sortFoodsByPriority(a, b, today))
    .slice(0, topN);
}

export function getSuggestedActions(item: FoodItem, today = new Date()): PrimaryCta[] {
  const priority = getPriority(item, today);
  return [priority.primaryCta, ...priority.secondaryCtas].filter(
    (action, index, actions) => actions.indexOf(action) === index
  );
}

export function sortActiveFoodsByPriority(foods: FoodItem[], today = new Date()): FoodItem[] {
  return getActiveFoods(foods).sort((a, b) => sortFoodsByPriority(a, b, today));
}
