import { describe, expect, it } from "vitest";
import {
  buildTallyEmbedUrl,
  buildTallyPublicUrl,
  collectObservedFeedbackSteps,
  isTallyEvent
} from "../lib/feedback";
import type { AppStateEnvelope } from "../types/food";

function feedbackState(
  foods: unknown[] = [],
  recipeHistory: unknown[] = []
): Pick<AppStateEnvelope, "foods" | "recipeHistory"> {
  return { foods, recipeHistory } as Pick<
    AppStateEnvelope,
    "foods" | "recipeHistory"
  >;
}

describe("feedback context", () => {
  it("includes only objectively observed trial steps", () => {
    const state = feedbackState([
      {
        actionHistory: [{ type: "created" }]
      }
    ]);

    expect(collectObservedFeedbackSteps(state)).toEqual(["added_food"]);
  });

  it("recognises handling, freezer and recipe-loop activity", () => {
    const state = feedbackState(
      [
        {
          actionHistory: [
            { type: "partially_used" },
            { type: "frozen" },
            { type: "restored" }
          ]
        }
      ],
      [{ cooked: { cookedAt: "2026-07-26T12:00:00.000Z" } }]
    );

    expect(collectObservedFeedbackSteps(state)).toEqual([
      "added_food",
      "handled_food",
      "used_frozen_area",
      "generated_recipe",
      "updated_after_cooking"
    ]);
  });

  it("builds Tally URLs with hidden context and embed settings", () => {
    const context = {
      locale: "zh-CN" as const,
      installMode: "standalone" as const,
      observedSteps: ["added_food", "generated_recipe"] as const
    };
    const embedUrl = new URL(buildTallyEmbedUrl({ ...context, observedSteps: [...context.observedSteps] }));
    const publicUrl = new URL(buildTallyPublicUrl({ ...context, observedSteps: [...context.observedSteps] }));

    expect(embedUrl.origin).toBe("https://tally.so");
    expect(embedUrl.pathname).toBe("/embed/ZjX92A");
    expect(embedUrl.searchParams.get("app_version")).toBe("0.11.4");
    expect(embedUrl.searchParams.get("locale")).toBe("zh-CN");
    expect(embedUrl.searchParams.get("install_mode")).toBe("standalone");
    expect(embedUrl.searchParams.get("entry_point")).toBe("app_feedback");
    expect(embedUrl.searchParams.get("observed_steps")).toBe(
      "把食物添加到冰箱,生成菜谱建议"
    );
    expect(embedUrl.searchParams.get("dynamicHeight")).toBe("1");
    expect(publicUrl.pathname).toBe("/r/ZjX92A");
    expect(publicUrl.searchParams.get("app_version")).toBe("0.11.4");
    expect(publicUrl.searchParams.has("dynamicHeight")).toBe(false);
  });

  it("accepts only matching Tally event messages", () => {
    expect(isTallyEvent("Tally.FormLoaded", "Tally.FormLoaded")).toBe(true);
    expect(
      isTallyEvent(
        JSON.stringify({ event: "Tally.FormSubmitted" }),
        "Tally.FormSubmitted"
      )
    ).toBe(true);
    expect(isTallyEvent({ event: "Tally.FormLoaded" }, "Tally.FormLoaded")).toBe(
      false
    );
    expect(isTallyEvent("Tally.FormLoaded", "Tally.FormSubmitted")).toBe(false);
  });
});
