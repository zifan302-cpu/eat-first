import { describe, expect, it } from "vitest";
import { parseQuantityText, quantityLabel } from "../lib/quantity";

describe("quantity helpers", () => {
  it("parses common barcode quantities", () => {
    expect(parseQuantityText("500 g")).toEqual({ amount: 500, unit: "g" });
    expect(parseQuantityText("1.5L")).toEqual({ amount: 1.5, unit: "l" });
  });

  it("formats structured quantities for the current locale", () => {
    const food = { quantityAmount: 2, quantityUnit: "pack" as const };
    expect(quantityLabel(food, "zh-CN")).toBe("2包");
    expect(quantityLabel(food, "en-GB")).toBe("2 packs");
  });
});
