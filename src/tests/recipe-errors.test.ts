import { describe, expect, it } from "vitest";
import { recipeErrorMessageKey } from "../lib/recipe-errors";

describe("recipe error messages", () => {
  it("separates configuration, upstream, timeout and contract failures", () => {
    expect(recipeErrorMessageKey("AI_NOT_CONFIGURED", "generation")).toBe("notConfigured");
    expect(recipeErrorMessageKey("AI_UPSTREAM_FAILED", "generation")).toBe("upstreamUnavailable");
    expect(recipeErrorMessageKey("RECIPE_TIMEOUT", "generation")).toBe("timeout");
    expect(recipeErrorMessageKey("RECIPE_CONSTRAINT_MISMATCH", "generation")).toBe("constraintMismatch");
  });

  it("keeps refinement failures local to the original option", () => {
    expect(recipeErrorMessageKey("RECIPE_TIMEOUT", "refinement")).toBe("refinementTimeout");
    expect(recipeErrorMessageKey("RECIPE_CONSTRAINT_MISMATCH", "refinement"))
      .toBe("refinementConstraintMismatch");
    expect(recipeErrorMessageKey("API_NOT_FOUND", "refinement")).toBe("refinementFailed");
  });
});
