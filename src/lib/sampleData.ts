import { addMonths } from "date-fns";
import type { FoodItem, FoodSource } from "../types/food";
import { addCalendarDays, isoNow, subtractCalendarDays, toDateInputValue } from "./dates";
import { normalizeFoodName } from "./nameNormalization";

let fallbackCounter = 0;

function createId(prefix: string, now: Date): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  fallbackCounter += 1;
  return `${prefix}-${toDateInputValue(now)}-${Date.now()}-${fallbackCounter}`;
}

export function createFoodItem(
  input: Omit<
    FoodItem,
    | "id"
    | "normalizedName"
    | "status"
    | "source"
    | "createdAt"
    | "updatedAt"
    | "actionHistory"
  >,
  source: FoodSource,
  now = new Date()
): FoodItem {
  const at = isoNow(now);
  const id = createId("food", now);

  return {
    id,
    ...input,
    normalizedName: normalizeFoodName(input.name),
    status: "active",
    source,
    createdAt: at,
    updatedAt: at,
    actionHistory: [
      {
        id: createId("action", now),
        type: "created",
        at
      }
    ]
  };
}

export function createDemoFoods(now = new Date()): FoodItem[] {
  return [
    createFoodItem(
      {
        name: "Chicken breast",
        category: "meat",
        dateLabelType: "use_by",
        labelDate: toDateInputValue(now),
        quantityText: "2 pieces"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Salad bag",
        category: "salad",
        dateLabelType: "use_by",
        labelDate: toDateInputValue(addCalendarDays(now, 1)),
        quantityText: "1 bag"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Milk",
        category: "dairy_eggs",
        dateLabelType: "opened",
        labelDate: toDateInputValue(subtractCalendarDays(now, 4)),
        openedShelfLifeDays: 3,
        quantityText: "Half bottle",
        note: "Opened date is a reminder only."
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Pasta",
        category: "dry_goods",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addMonths(now, 1)),
        quantityText: "1 pack"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Salmon fillet",
        category: "fish",
        dateLabelType: "use_by",
        labelDate: toDateInputValue(addCalendarDays(now, 1)),
        quantityText: "2 fillets"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Greek yogurt",
        category: "dairy_eggs",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(now, 2)),
        quantityText: "1 tub"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Strawberries",
        category: "fruit",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(now, 2)),
        quantityText: "1 box"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Broccoli",
        category: "vegetable",
        dateLabelType: "use_by",
        labelDate: toDateInputValue(addCalendarDays(now, 3)),
        quantityText: "1 head"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Eggs",
        category: "dairy_eggs",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(now, 5)),
        quantityText: "6 eggs"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Leftover rice",
        category: "leftovers",
        dateLabelType: "opened",
        labelDate: toDateInputValue(subtractCalendarDays(now, 2)),
        openedShelfLifeDays: 2,
        quantityText: "1 box"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Ham slices",
        category: "meat",
        dateLabelType: "opened",
        labelDate: toDateInputValue(subtractCalendarDays(now, 3)),
        openedShelfLifeDays: 3,
        quantityText: "Half pack"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Orange juice",
        category: "drink",
        dateLabelType: "opened",
        labelDate: toDateInputValue(subtractCalendarDays(now, 5)),
        openedShelfLifeDays: 5,
        quantityText: "Half bottle"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Bread",
        category: "bakery",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(now, 1)),
        quantityText: "Half loaf"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Frozen dumplings",
        category: "frozen_food",
        dateLabelType: "none",
        quantityText: "1 bag"
      },
      "demo_seed",
      now
    ),
    createFoodItem(
      {
        name: "Soy sauce",
        category: "condiment",
        dateLabelType: "best_before",
        labelDate: toDateInputValue(addCalendarDays(now, 90)),
        quantityText: "1 bottle"
      },
      "demo_seed",
      now
    )
  ];
}
