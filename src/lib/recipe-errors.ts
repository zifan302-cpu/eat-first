export type RecipeErrorScope = "generation" | "refinement";

export type RecipeErrorMessageKey =
  | "notConfigured"
  | "rateLimited"
  | "timeout"
  | "upstreamUnavailable"
  | "constraintMismatch"
  | "invalidRequest"
  | "serverError"
  | "refinementFailed"
  | "refinementConstraintMismatch"
  | "refinementTimeout";

export function recipeErrorMessageKey(
  code: string,
  scope: RecipeErrorScope
): RecipeErrorMessageKey {
  if (code === "AI_NOT_CONFIGURED") return "notConfigured";
  if (code === "RATE_LIMITED") return "rateLimited";
  if (code === "AI_UPSTREAM_FAILED") return "upstreamUnavailable";
  if (code === "RECIPE_TIMEOUT") {
    return scope === "refinement" ? "refinementTimeout" : "timeout";
  }
  if (code === "RECIPE_CONSTRAINT_MISMATCH" || code === "RECIPE_GENERATION_FAILED") {
    return scope === "refinement" ? "refinementConstraintMismatch" : "constraintMismatch";
  }
  if (scope === "refinement") return "refinementFailed";
  if (code === "INVALID_RECIPE_REQUEST" || code === "PAYLOAD_TOO_LARGE") {
    return "invalidRequest";
  }
  return "serverError";
}
