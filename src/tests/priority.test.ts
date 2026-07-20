import { describe, expect, it } from "vitest";
import { createFoodFromInput, markFoodEaten, snoozeFoodUntilTomorrow } from "../hooks/useFoodActions";
import { getActiveFoods, getPriority, getTopFoods } from "../lib/priority";
import { toDateInputValue, addCalendarDays } from "../lib/dates";

const today = new Date("2026-06-10T12:00:00.000Z");

function food(
  name: string,
  dateLabelType: "use_by" | "best_before" | "opened" | "none",
  offsetDays = 0
) {
  return createFoodFromInput(
    {
      name,
      category: "other",
      dateLabelType,
      labelDate: dateLabelType === "none" ? undefined : toDateInputValue(addCalendarDays(today, offsetDays)),
      openedShelfLifeDays: dateLabelType === "opened" ? 2 : undefined
    },
    today
  );
}

describe("priority rules", () => {
  it("prioritises use_by today over best_before today", () => {
    const useBy = food("Chicken", "use_by", 0);
    const bestBefore = food("Pasta", "best_before", 0);

    expect(getPriority(useBy, today).score).toBeGreaterThan(getPriority(bestBefore, today).score);
  });

  it("never uses eat as primary CTA for expired use_by", () => {
    const expired = food("Fish", "use_by", -1);

    expect(getPriority(expired, today).primaryCta).not.toBe("eat");
    expect(getPriority(expired, today).primaryCta).toBe("discard");
  });

  it("excludes snoozed items from top foods", () => {
    const urgent = food("Urgent", "use_by", 0);
    const soon = food("Soon", "use_by", 1);
    const normal = food("Normal", "best_before", 0);
    const snoozed = snoozeFoodUntilTomorrow([urgent], urgent.id, today)[0];

    const top = getTopFoods([snoozed, soon, normal], 3, today);

    expect(top.map((item) => item.id)).not.toContain(urgent.id);
    expect(top[0].id).toBe(soon.id);
  });

  it("removes marked eaten items from active foods", () => {
    const item = food("Milk", "opened", -4);
    const [eaten] = markFoodEaten([item], item.id, today);

    expect(eaten.status).toBe("eaten");
    expect(getActiveFoods([eaten])).toHaveLength(0);
  });
});
