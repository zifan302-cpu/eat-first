import {
  addDays,
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
  subDays
} from "date-fns";

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayInputValue(now = new Date()): string {
  return toDateInputValue(now);
}

export function addCalendarDays(date: Date, days: number): Date {
  return addDays(startOfDay(date), days);
}

export function subtractCalendarDays(date: Date, days: number): Date {
  return subDays(startOfDay(date), days);
}

export function parseDateInput(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : undefined;
}

export function daysFromToday(value: string | undefined, today = new Date()): number | undefined {
  const parsed = parseDateInput(value);
  if (!parsed) {
    return undefined;
  }
  return differenceInCalendarDays(parsed, startOfDay(today));
}

export function isDateAfterToday(value: string | undefined, today = new Date()): boolean {
  const days = daysFromToday(value, today);
  return typeof days === "number" && days > 0;
}

export function isoNow(now = new Date()): string {
  return now.toISOString();
}

export function nextDayInputValue(now = new Date()): string {
  return toDateInputValue(addCalendarDays(now, 1));
}
