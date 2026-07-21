import {
  Apple,
  Carrot,
  CookingPot,
  Croissant,
  CupSoda,
  Drumstick,
  Fish,
  Milk,
  Package,
  Salad,
  Snowflake,
  Soup,
  UtensilsCrossed,
  Wheat
} from "lucide-react";
import type { FoodCategory } from "../types/food";
import { cx } from "../lib/ui";

interface CategoryIconProps {
  category: FoodCategory;
  className?: string;
}

const icons = {
  meat: Drumstick,
  fish: Fish,
  dairy_eggs: Milk,
  vegetable: Carrot,
  fruit: Apple,
  salad: Salad,
  leftovers: CookingPot,
  ready_meal: UtensilsCrossed,
  bakery: Croissant,
  drink: CupSoda,
  condiment: Soup,
  dry_goods: Wheat,
  frozen_food: Snowflake,
  other: Package
} satisfies Record<FoodCategory, typeof Package>;

const colors = {
  meat: "bg-[#F1DDD4] text-[#8F4634]",
  fish: "bg-[#DDE7E8] text-[#42636A]",
  dairy_eggs: "bg-[#F2E8C9] text-[#806B2F]",
  vegetable: "bg-leaf-100 text-leaf-700",
  fruit: "bg-[#F3DDD3] text-tomato",
  salad: "bg-[#E2E8CF] text-leaf-700",
  leftovers: "bg-[#E9DDD0] text-[#795448]",
  ready_meal: "bg-[#F3E4CD] text-[#80552E]",
  bakery: "bg-[#EFE0C6] text-[#835B2D]",
  drink: "bg-[#DDE9E6] text-[#39645A]",
  condiment: "bg-[#E9DDD0] text-[#795448]",
  dry_goods: "bg-[#EEE6D0] text-[#75633A]",
  frozen_food: "bg-[#DDE8EC] text-[#3C6470]",
  other: "bg-paper text-ink-muted"
} satisfies Record<FoodCategory, string>;

export function CategoryIcon({ category, className }: CategoryIconProps): JSX.Element {
  const Icon = icons[category];
  return (
    <span
      className={cx(
        "grid h-10 w-10 shrink-0 place-items-center rounded-[0.85rem] border border-ink/10",
        colors[category],
        className
      )}
    >
      <Icon aria-hidden className="h-5 w-5" strokeWidth={2.1} />
    </span>
  );
}
