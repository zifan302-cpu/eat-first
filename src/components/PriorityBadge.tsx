import type { PriorityResult } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import { cx } from "../lib/ui";

const badgeClass: Record<PriorityResult["verdict"], string> = {
  expired_use_by: "border-tomato/25 bg-[#F3DDD3] text-tomato",
  use_today: "border-tomato/25 bg-[#F3DDD3] text-tomato",
  use_soon: "border-carrot/25 bg-[#F3E4CD] text-[#9A5B1F]",
  quality_check: "border-butter/40 bg-[#F1E7C9] text-ink",
  opened_due: "border-carrot/30 bg-[#F3E4CD] text-[#9A5B1F]",
  opened_soon: "border-butter/40 bg-[#F1E7C9] text-ink",
  normal: "border-leaf-500/20 bg-leaf-50 text-leaf-700",
  no_date: "border-paper-line bg-paper text-ink-muted"
};

interface PriorityBadgeProps {
  priority: PriorityResult;
  t: Messages;
}

export function PriorityBadge({ priority, t }: PriorityBadgeProps): JSX.Element {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-[0.66rem] font-black",
        badgeClass[priority.verdict]
      )}
    >
      {t.priority[priority.verdict]}
    </span>
  );
}
