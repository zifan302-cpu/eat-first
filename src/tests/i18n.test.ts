import { beforeEach, describe, expect, it } from "vitest";
import { getMessages, resolveLocale } from "../i18n";
import { guessCategoryFromName } from "../lib/nameNormalization";
import { clearState, createDefaultState, loadState, saveState } from "../lib/storage";

describe("i18n", () => {
  beforeEach(() => {
    clearState();
    localStorage.clear();
  });

  it("resolves Chinese browser language to zh-CN", () => {
    expect(resolveLocale("zh-Hans-CN")).toBe("zh-CN");
    expect(getMessages("zh-CN").pages.homeTitle).toBe("今天先吃什么");
  });

  it("persists locale selection through the state envelope", () => {
    const state = createDefaultState(new Date("2026-06-10T12:00:00.000Z"));
    state.preferences.locale = "zh-CN";
    saveState(state);

    expect(loadState().preferences.locale).toBe("zh-CN");
  });

  it("guesses common food categories locally", () => {
    expect(guessCategoryFromName("chicken")).toBe("meat");
    expect(guessCategoryFromName("牛奶")).toBe("dairy_eggs");
    expect(guessCategoryFromName("mystery pantry thing")).toBe("other");
  });
});
