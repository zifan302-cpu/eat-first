import type { FoodItem } from "../types/food";
import { characterForFood } from "../lib/characters";
import { cx } from "../lib/ui";
import { CategoryIcon } from "./CategoryIcon";
import { getFreshnessStage } from "../lib/freshness";
import type { FreshnessStage } from "../lib/freshness";

interface FoodPortraitProps {
  food: FoodItem;
  size?: "sm" | "md" | "lg";
  rank?: number;
  className?: string;
}

const sizes = {
  sm: "h-12 w-12 rounded-[1rem]",
  md: "h-[4.5rem] w-[4.5rem] rounded-[1.2rem]",
  lg: "h-24 w-24 rounded-[1.5rem]"
};

const tomatoStateAssets: Record<FreshnessStage, string> = {
  fresh: "/art/tomato-states/tomato-fresh.png",
  watch: "/art/tomato-states/tomato-watch.png",
  urgent: "/art/tomato-states/tomato-urgent.png",
  check: "/art/tomato-states/tomato-check.png"
};

export function FoodPortrait({
  food,
  size = "md",
  rank,
  className
}: FoodPortraitProps): JSX.Element {
  const character = characterForFood(food);
  const stage = getFreshnessStage(food);
  const asset = character?.id === "tomato" ? tomatoStateAssets[stage] : character?.asset;

  return (
    <div
      className={cx(
        "relative grid shrink-0 place-items-center overflow-hidden border border-paper-line bg-paper-soft",
        sizes[size],
        className
      )}
    >
      {typeof rank === "number" ? (
        <span className="absolute left-1.5 top-1.5 z-10 grid h-6 min-w-6 place-items-center rounded-full border border-ink/15 bg-paper px-1 text-[0.65rem] font-black text-ink">
          {rank}
        </span>
      ) : null}
      {asset ? (
        <img
          src={asset}
          alt=""
          className={cx(
            "h-[108%] w-[108%] object-contain object-bottom",
            character?.id === "tomato" && "h-full w-full object-cover"
          )}
        />
      ) : (
        <CategoryIcon category={food.category} className="h-full w-full rounded-none border-0" />
      )}
      <span
        aria-hidden
        className={cx(
          "absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper-soft",
          stage === "fresh" && "bg-leaf-500",
          stage === "watch" && "bg-[#D4A53C]",
          stage === "urgent" && "bg-carrot",
          stage === "check" && "bg-tomato"
        )}
      />
    </div>
  );
}
