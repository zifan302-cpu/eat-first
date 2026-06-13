import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../lib/constants";
import { clearState, loadState, seedDemoState } from "../lib/storage";

describe("storage", () => {
  beforeEach(() => {
    clearState();
    localStorage.clear();
  });

  it("does not crash when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");

    expect(() => loadState()).not.toThrow();
    expect(loadState().foods.length).toBeGreaterThanOrEqual(3);
  });

  it("seeds 15 active demo foods", () => {
    const state = seedDemoState(new Date("2026-06-10T12:00:00.000Z"));
    const active = state.foods.filter((food) => food.status === "active");

    expect(active).toHaveLength(15);
  });
});
