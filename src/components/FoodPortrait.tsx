import type { FoodItem } from "../types/food";
import { characterForFood } from "../lib/characters";
import { cx } from "../lib/ui";

interface FoodPortraitProps {
  food: Pick<FoodItem, "name" | "normalizedName">;
  size?: "sm" | "md" | "lg";
  rank?: number;
  className?: string;
}

const sizes = {
  sm: "h-12 w-12 rounded-[1rem]",
  md: "h-[4.5rem] w-[4.5rem] rounded-[1.2rem]",
  lg: "h-24 w-24 rounded-[1.5rem]"
};

export function FoodPortrait({
  food,
  size = "md",
  rank,
  className
}: FoodPortraitProps): JSX.Element {
  const character = characterForFood(food);
  const initial = food.name.trim().slice(0, 1).toLocaleUpperCase();

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
      {character ? (
        <img
          src={character.asset}
          alt=""
          className="h-[108%] w-[108%] object-contain object-bottom"
        />
      ) : (
        <span className="font-editorial text-2xl font-black text-leaf-700">{initial}</span>
      )}
    </div>
  );
}
