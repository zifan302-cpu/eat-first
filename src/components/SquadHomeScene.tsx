import { CHARACTERS } from "../lib/characters";
import { cx } from "../lib/ui";

interface SquadHomeSceneProps {
  compact?: boolean;
  label: string;
}

export function SquadHomeScene({ compact = false, label }: SquadHomeSceneProps): JSX.Element {
  return (
    <figure
      aria-label={label}
      className={cx(
        "relative overflow-hidden rounded-[1.65rem] border border-ink/20 bg-[#CCD8CF] shadow-lift",
        compact ? "h-56" : "h-[31rem]"
      )}
    >
      <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-between border-b border-ink/15 bg-ink px-4 text-paper">
        <span className="text-[0.62rem] font-black tracking-[0.2em]">FRESH SQUAD · 05</span>
        <span className="flex items-center gap-1.5 text-[0.62rem] font-extrabold text-paper/80">
          <span className="h-2 w-2 rounded-full bg-[#A8C38E]" />
          HOME
        </span>
      </div>

      <div className="absolute inset-x-3 bottom-3 top-14 overflow-hidden rounded-[1.2rem] border border-ink/15 bg-[#EEF0DF]">
        <div className="absolute left-4 top-4 h-12 w-16 rounded-lg border border-ink/10 bg-paper-soft p-2 shadow-[2px_2px_0_rgba(32,61,46,0.08)]">
          <div className="h-1.5 w-8 rounded-full bg-tomato/70" />
          <div className="mt-2 h-1.5 w-11 rounded-full bg-leaf-500/45" />
          <div className="mt-1.5 h-1.5 w-7 rounded-full bg-carrot/45" />
        </div>
        <div className="absolute right-5 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-ink/30 bg-paper-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          <span className="absolute h-3 w-0.5 -translate-y-1 bg-ink/70" />
          <span className="absolute h-0.5 w-2 translate-x-1 bg-ink/70" />
        </div>

        <div className="absolute inset-x-0 top-[43%] h-3 border-y border-ink/20 bg-[#C5B79A] shadow-[0_5px_0_rgba(32,61,46,0.08)]" />
        <div className="absolute inset-x-0 bottom-[30%] border-t border-dashed border-ink/15" />
        <div className="absolute bottom-0 left-[9%] right-[9%] h-[24%] rounded-t-[50%] bg-[#DCE3CE]" />

        <img
          src={CHARACTERS.carrot.asset}
          alt=""
          className={cx("absolute object-contain object-bottom", compact ? "left-[25%] top-[15%] h-[39%] w-[25%]" : "left-[22%] top-[13%] h-[33%] w-[27%]")}
        />
        <img
          src={CHARACTERS.mushroom.asset}
          alt=""
          className={cx("absolute object-contain object-bottom", compact ? "right-[20%] top-[19%] h-[34%] w-[25%]" : "right-[18%] top-[17%] h-[29%] w-[27%]")}
        />
        <img
          src={CHARACTERS.broccoli.asset}
          alt=""
          className={cx("absolute bottom-[2%] object-contain object-bottom", compact ? "left-[5%] h-[43%] w-[29%]" : "left-[3%] h-[42%] w-[31%]")}
        />
        <img
          src={CHARACTERS.tomato.asset}
          alt=""
          className={cx("absolute bottom-[3%] left-[35%] object-contain object-bottom", compact ? "h-[42%] w-[29%]" : "h-[40%] w-[30%]")}
        />
        <img
          src={CHARACTERS.eggplant.asset}
          alt=""
          className={cx("absolute bottom-[2%] right-[2%] object-contain object-bottom", compact ? "h-[44%] w-[31%]" : "h-[43%] w-[34%]")}
        />
      </div>
    </figure>
  );
}
