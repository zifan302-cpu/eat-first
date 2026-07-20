import type { CharacterProfile } from "../lib/characters";
import { cx } from "../lib/ui";

interface CharacterAvatarProps {
  character: CharacterProfile;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  hero: "h-40 w-40"
};

export function CharacterAvatar({
  character,
  size = "md",
  className
}: CharacterAvatarProps): JSX.Element {
  return (
    <div
      className={cx(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[1.25rem] border border-paper-line bg-paper-soft",
        sizes[size],
        className
      )}
      style={{ backgroundColor: character.soft }}
    >
      <img
        src={character.asset}
        alt=""
        className="h-[108%] w-[108%] object-contain object-bottom"
      />
    </div>
  );
}
