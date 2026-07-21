import { differenceInCalendarDays, parseISO, startOfDay, subDays } from "date-fns";
import type { FoodActionRecord, FoodItem } from "../types/food";
import { getActiveFoods } from "./priority";

export interface GameProgress {
  handledToday: number;
  rescuedToday: number;
  weeklyRescued: number;
  weeklyDiscarded: number;
  missionTarget: number;
  missionProgress: number;
  missionComplete: boolean;
  streakDays: number;
  totalRescued: number;
  level: number;
  levelProgress: number;
  activeCount: number;
}

interface TimedAction extends FoodActionRecord {
  foodId: string;
}

function allActions(foods: FoodItem[]): TimedAction[] {
  return foods.flatMap((food) =>
    food.actionHistory.map((action) => ({ ...action, foodId: food.id }))
  );
}

function isOnDay(value: string, day: Date): boolean {
  return differenceInCalendarDays(startOfDay(day), startOfDay(parseISO(value))) === 0;
}

function withinDays(value: string, today: Date, days: number): boolean {
  const difference = differenceInCalendarDays(startOfDay(today), startOfDay(parseISO(value)));
  return difference >= 0 && difference < days;
}

export function getGameProgress(foods: FoodItem[], today = new Date()): GameProgress {
  const actions = allActions(foods);
  const handledTypes = new Set(["partially_used", "eaten", "frozen", "discarded"]);
  const rescuedTypes = new Set(["partially_used", "eaten", "frozen"]);
  const handledToday = actions.filter(
    (action) => handledTypes.has(action.type) && isOnDay(action.at, today)
  ).length;
  const rescuedToday = actions.filter(
    (action) => rescuedTypes.has(action.type) && isOnDay(action.at, today)
  ).length;
  const weeklyRescued = actions.filter(
    (action) => rescuedTypes.has(action.type) && withinDays(action.at, today, 7)
  ).length;
  const weeklyDiscarded = actions.filter(
    (action) => action.type === "discarded" && withinDays(action.at, today, 7)
  ).length;
  const totalRescued = actions.filter((action) => rescuedTypes.has(action.type)).length;
  const activeCount = getActiveFoods(foods).length;
  const missionTarget = Math.min(3, Math.max(1, activeCount + handledToday));
  const missionProgress = Math.min(handledToday, missionTarget);

  const activeDays = new Set(
    actions
      .filter((action) => rescuedTypes.has(action.type))
      .map((action) => startOfDay(parseISO(action.at)).toISOString())
  );
  let cursor = startOfDay(today);
  if (!activeDays.has(cursor.toISOString())) {
    cursor = subDays(cursor, 1);
  }
  let streakDays = 0;
  while (activeDays.has(cursor.toISOString())) {
    streakDays += 1;
    cursor = subDays(cursor, 1);
  }

  const experience = totalRescued * 12;
  const level = Math.floor(experience / 60) + 1;
  const levelProgress = experience % 60;

  return {
    handledToday,
    rescuedToday,
    weeklyRescued,
    weeklyDiscarded,
    missionTarget,
    missionProgress,
    missionComplete: missionProgress >= missionTarget,
    streakDays,
    totalRescued,
    level,
    levelProgress,
    activeCount
  };
}
