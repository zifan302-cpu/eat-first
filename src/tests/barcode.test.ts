import { describe, expect, it } from "vitest";
import { parseScannedBarcode } from "../lib/barcode";

describe("barcode parsing", () => {
  it("keeps ordinary EAN codes", () => {
    expect(parseScannedBarcode(" 5012345678900 ")).toEqual({ gtin: "5012345678900" });
    expect(parseScannedBarcode("1501234567890")).toEqual({ gtin: "1501234567890" });
  });

  it("extracts a GS1 use-by date", () => {
    expect(parseScannedBarcode("(01)09501101530003(17)270615")).toEqual({
      gtin: "09501101530003",
      dateLabelType: "use_by",
      labelDate: "2027-06-15"
    });
  });

  it("understands GS1 Digital Link best-before data", () => {
    expect(parseScannedBarcode("https://id.gs1.org/01/09501101530003?15=271200")).toEqual({
      gtin: "09501101530003",
      dateLabelType: "best_before",
      labelDate: "2027-12-31"
    });
  });

  it("rejects arbitrary text", () => {
    expect(parseScannedBarcode("not a barcode")).toBeNull();
  });
});
