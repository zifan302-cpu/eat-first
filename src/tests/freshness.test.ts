import { describe, expect, it } from "vitest";
import { createFoodFromInput } from "../hooks/useFoodActions";
import { getFreshnessStage } from "../lib/freshness";

const today = new Date("2026-07-21T12:00:00.000Z");

function tomato(labelDate: string) {
  return createFoodFromInput(
    {
      name: "Tomato",
      category: "vegetable",
      dateLabelType: "use_by",
      labelDate
    },
    today
  );
}

describe("freshness stages", () => {
  it("maps use-by urgency to the four-stage visual system", () => {
    expect(getFreshnessStage(tomato("2026-07-26"), today)).toBe("fresh");
    expect(getFreshnessStage(tomato("2026-07-23"), today)).toBe("watch");
    expect(getFreshnessStage(tomato("2026-07-21"), today)).toBe("urgent");
    expect(getFreshnessStage(tomato("2026-07-20"), today)).toBe("check");
  });
});
