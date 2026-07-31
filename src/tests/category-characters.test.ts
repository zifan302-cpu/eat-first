import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CATEGORY_CHARACTER_ASSETS,
  categoryCharacterStateForFood,
  categoryCharacterStateForVerdict,
  type CategoryCharacterState
} from "../lib/categoryCharacters";
import { FOOD_CATEGORIES } from "../lib/constants";

describe("category character assets", () => {
  const states: CategoryCharacterState[] = ["fresh", "use_soon", "expired"];

  it("maps every food category across all three states", () => {
    expect(Object.keys(CATEGORY_CHARACTER_ASSETS)).toEqual(states);
    for (const state of states) {
      expect(Object.keys(CATEGORY_CHARACTER_ASSETS[state])).toEqual(FOOD_CATEGORIES);
    }
  });

  it("keeps every runtime image present and within the PWA asset budget", () => {
    for (const state of states) {
      for (const category of FOOD_CATEGORIES) {
        const publicPath = CATEGORY_CHARACTER_ASSETS[state][category].replace(/^\//, "");
        const filePath = resolve("public", publicPath);

        expect(existsSync(filePath), `${state}/${category} asset should exist`).toBe(true);
        const size = statSync(filePath).size;
        expect(size, `${state}/${category} asset should not be empty`).toBeGreaterThan(0);
        expect(size, `${state}/${category} asset should remain under 120 KB`).toBeLessThan(120_000);
      }
    }
  });

  it("uses date semantics without treating missing dates as expiring", () => {
    expect(categoryCharacterStateForVerdict("normal")).toBe("fresh");
    expect(categoryCharacterStateForVerdict("no_date")).toBe("fresh");
    expect(categoryCharacterStateForVerdict("use_soon")).toBe("use_soon");
    expect(categoryCharacterStateForVerdict("use_today")).toBe("use_soon");
    expect(categoryCharacterStateForVerdict("quality_check")).toBe("expired");
    expect(categoryCharacterStateForVerdict("expired_use_by")).toBe("expired");
  });

  it("keeps an approaching Best before date distinct from a date that has passed", () => {
    const today = new Date("2026-07-31T12:00:00Z");
    const food = {
      dateLabelType: "best_before",
      labelDate: "2026-08-01"
    } as Parameters<typeof categoryCharacterStateForFood>[0];

    expect(categoryCharacterStateForFood(food, "quality_check", today)).toBe("use_soon");
    expect(
      categoryCharacterStateForFood({ ...food, labelDate: "2026-07-30" }, "quality_check", today)
    ).toBe("expired");
  });
});
