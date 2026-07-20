import { describe, expect, it } from "vitest";
import { createFoodFromInput, markFoodEaten, markFoodFrozen } from "../hooks/useFoodActions";
import { characterForFood } from "../lib/characters";
import { addCalendarDays, toDateInputValue } from "../lib/dates";
import { getGameProgress } from "../lib/game";

const today = new Date("2026-07-16T12:00:00.000Z");

function create(name: string) {
  return createFoodFromInput(
    {
      name,
      category: "dairy_eggs",
      dateLabelType: "use_by",
      labelDate: toDateInputValue(today)
    },
    today
  );
}

describe("fresh squad progress", () => {
  it("counts eaten and frozen actions as rescues", () => {
    const milk = create("Milk");
    const eggs = create("Eggs");
    const eaten = markFoodEaten([milk], milk.id, today)[0];
    const frozen = markFoodFrozen([eggs], eggs.id, today)[0];

    const progress = getGameProgress([eaten, frozen], today);

    expect(progress.rescuedToday).toBe(2);
    expect(progress.totalRescued).toBe(2);
    expect(progress.levelProgress).toBe(24);
  });

  it("keeps a gentle streak across consecutive rescue days", () => {
    const yesterday = addCalendarDays(today, -1);
    const first = create("Milk");
    const second = create("Eggs");
    const eatenYesterday = markFoodEaten([first], first.id, yesterday)[0];
    const frozenToday = markFoodFrozen([second], second.id, today)[0];

    expect(getGameProgress([eatenYesterday, frozenToday], today).streakDays).toBe(2);
  });

  it("uses only approved ingredient identities for character art", () => {
    expect(characterForFood(create("Tomato"))?.id).toBe("tomato");
    expect(characterForFood(create("Mushroom"))?.id).toBe("mushroom");
    expect(characterForFood(create("Milk"))).toBeUndefined();
  });
});
