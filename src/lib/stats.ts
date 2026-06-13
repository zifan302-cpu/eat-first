import { differenceInCalendarDays, parseISO } from "date-fns";
import type { FoodItem } from "../types/food";
import { daysFromToday } from "./dates";
import { getPriority } from "./priority";

export interface WeeklyStats {
  eatenCount: number;
  frozenCount: number;
  discardedCount: number;
  expiringSoonCount: number;
  estimatedSaved: number;
}

function withinLastSevenDays(value: string | undefined, today: Date): boolean {
  if (!value) {
    return false;
  }

  const days = differenceInCalendarDays(today, parseISO(value));
  return days >= 0 && days < 7;
}

export function getWeeklyStats(foods: FoodItem[], today = new Date()): WeeklyStats {
  const eatenRecently = foods.filter((food) => withinLastSevenDays(food.consumedAt, today));
  const frozenRecently = foods.filter((food) => withinLastSevenDays(food.frozenAt, today));
  const discardedRecently = foods.filter((food) => withinLastSevenDays(food.discardedAt, today));
  const savedFoods = [...eatenRecently, ...frozenRecently].filter((food) =>
    ["expired_use_by", "use_today", "use_soon"].includes(getPriority(food, today).verdict)
  );

  return {
    eatenCount: eatenRecently.length,
    frozenCount: frozenRecently.length,
    discardedCount: discardedRecently.length,
    expiringSoonCount: foods.filter((food) => {
      const days = daysFromToday(food.labelDate, today);
      return food.status === "active" && food.dateLabelType === "use_by" && typeof days === "number" && days >= 0 && days <= 2;
    }).length,
    estimatedSaved: savedFoods.length
  };
}
