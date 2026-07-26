import { describe, expect, it } from "vitest";
import { getCompactFoodActions } from "../components/CompactFoodCard";
import {
  createFoodFromInput,
  markFoodEaten,
  markFoodFrozen,
  restoreFrozenFood,
  snoozeFoodUntilTomorrow,
  useFoodPart
} from "../hooks/useFoodActions";
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

  it("keeps a partially used item active and updates the remaining amount", () => {
    const item = createFoodFromInput(
      {
        name: "Tomatoes",
        category: "vegetable",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(today, 2)),
        quantityAmount: 4,
        quantityUnit: "item"
      },
      today
    );

    const [updated] = useFoodPart([item], item.id, 2, undefined, today);

    expect(updated.status).toBe("active");
    expect(updated.quantityAmount).toBe(2);
    expect(updated.actionHistory.at(-1)?.type).toBe("partially_used");
  });

  it("does not let a partial-use action increase or preserve a known amount", () => {
    const item = createFoodFromInput(
      {
        name: "Tomatoes",
        category: "vegetable",
        dateLabelType: "none",
        quantityAmount: 4,
        quantityUnit: "item"
      },
      today
    );

    expect(useFoodPart([item], item.id, 5, undefined, today)[0]).toBe(item);
    expect(useFoodPart([item], item.id, 4, undefined, today)[0]).toBe(item);
    expect(useFoodPart([item], item.id, Number.NaN, undefined, today)[0]).toBe(item);
  });

  it("restores a frozen item to the active fridge and records the transition", () => {
    const item = food("Peas", "best_before", 4);
    const frozen = markFoodFrozen([item], item.id, today)[0];
    const plannedUseDate = toDateInputValue(addCalendarDays(today, 1));
    const restored = restoreFrozenFood([frozen], item.id, plannedUseDate, today)[0];

    expect(restored.status).toBe("active");
    expect(restored.plannedUseDate).toBe(plannedUseDate);
    expect(restored.thawedAt).toBe(today.toISOString());
    expect(restored.actionHistory.at(-1)?.type).toBe("restored");
    expect(restored.actionHistory.at(-1)?.note).toBe(`planned-use:${plannedUseDate}`);
  });

  it("raises a thawed item planned for today without overriding its safety verdict", () => {
    const planned = {
      ...food("Peas", "none"),
      plannedUseDate: toDateInputValue(today)
    };
    const expired = {
      ...food("Fish", "use_by", -1),
      plannedUseDate: toDateInputValue(today)
    };

    expect(getPriority(planned, today)).toMatchObject({
      score: 92,
      primaryCta: "check",
      explanationKey: "priority.plannedToday"
    });
    expect(getCompactFoodActions(getPriority(planned, today))).toEqual(["check", "eat"]);
    expect(getPriority(expired, today)).toMatchObject({
      verdict: "expired_use_by",
      primaryCta: "discard",
      explanationKey: "priority.expiredUseBy"
    });
  });
});
