import { describe, expect, it } from "vitest";
import { buildDailyReminderCalendar } from "../lib/habit";

describe("daily reminder calendar", () => {
  it("creates a recurring local-time reminder without a backend", () => {
    const calendar = buildDailyReminderCalendar(
      "en-GB",
      "18:30",
      new Date("2026-07-27T10:00:00.000Z")
    );

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("DTSTART:20260727T183000");
    expect(calendar).toContain("RRULE:FREQ=DAILY");
    expect(calendar).toContain("BEGIN:VALARM");
    expect(calendar).toContain("UID:eat-first-daily-reminder@local");
  });

  it("falls back to 18:00 for an invalid time", () => {
    expect(
      buildDailyReminderCalendar("zh-CN", "99:99", new Date("2026-07-27T10:00:00.000Z"))
    ).toContain("DTSTART:20260727T180000");
  });
});
