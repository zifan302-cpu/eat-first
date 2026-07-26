import type { LocaleCode } from "../types/food";

function escapeCalendarText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function compactLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildDailyReminderCalendar(
  locale: LocaleCode,
  reminderTime: string,
  startDate = new Date()
): string {
  const safeTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)
    ? reminderTime
    : "18:00";
  const [hours, minutes] = safeTime.split(":");
  const date = compactLocalDate(startDate);
  const title = locale === "zh-CN" ? "看一眼冰箱，先处理最需要的食物" : "Check the fridge and eat first";
  const description =
    locale === "zh-CN"
      ? "打开 Eat First，查看今天优先处理的食材。"
      : "Open Eat First and review today’s priority foods.";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eat First//Daily fridge reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:eat-first-daily-reminder@local",
    `DTSTAMP:${stamp}`,
    `DTSTART:${date}T${hours}${minutes}00`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}
