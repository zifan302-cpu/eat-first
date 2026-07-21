import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../lib/constants";
import { clearState, isImportableState, loadState, migrateState } from "../lib/storage";

describe("storage", () => {
  beforeEach(() => {
    clearState();
    localStorage.clear();
  });

  it("does not crash when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");

    expect(() => loadState()).not.toThrow();
    expect(loadState().foods).toHaveLength(0);
  });

  it("starts with an empty fridge", () => {
    expect(loadState().foods).toHaveLength(0);
  });

  it("rejects unrelated JSON imports", () => {
    expect(isImportableState({})).toBe(false);
    expect(isImportableState({ appId: "another-app", schemaVersion: "1.1.0", foods: [] })).toBe(false);
  });

  it("preserves foods when migrating the old demo schema", () => {
    const oldState = {
      appId: "eat-first",
      schemaVersion: "1.0.0",
      preferences: { locale: "zh-CN", topN: 3 },
      foods: [
        {
          id: "legacy-food",
          name: "Milk",
          normalizedName: "milk",
          category: "dairy_eggs",
          dateLabelType: "none",
          status: "active",
          source: "demo_seed",
          createdAt: "2026-06-10T12:00:00.000Z",
          updatedAt: "2026-06-10T12:00:00.000Z",
          actionHistory: []
        }
      ],
      meta: {
        createdAt: "2026-06-10T12:00:00.000Z",
        updatedAt: "2026-06-10T12:00:00.000Z",
        seededDemo: true
      }
    };

    const migrated = migrateState(oldState);

    expect(migrated.schemaVersion).toBe("1.2.0");
    expect(migrated.foods).toHaveLength(1);
    expect(migrated.foods[0].source).toBe("import");
  });

  it("derives structured quantity from an older text amount", () => {
    const migrated = migrateState({
      appId: "eat-first",
      schemaVersion: "1.1.0",
      preferences: { locale: "en-GB" },
      foods: [
        {
          id: "legacy-quantity",
          name: "Yogurt",
          normalizedName: "yogurt",
          category: "dairy_eggs",
          dateLabelType: "none",
          quantityText: "500 g",
          status: "active",
          source: "barcode",
          createdAt: "2026-06-10T12:00:00.000Z",
          updatedAt: "2026-06-10T12:00:00.000Z",
          actionHistory: []
        }
      ],
      meta: {}
    });

    expect(migrated.foods[0].quantityAmount).toBe(500);
    expect(migrated.foods[0].quantityUnit).toBe("g");
  });
});
