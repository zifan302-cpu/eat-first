import type { PriorityResult } from "../types/food";
import type { Messages } from "../i18n/en-GB";
import { cx } from "../lib/ui";

const badgeClass: Record<PriorityResult["verdict"], string> = {
  expired_use_by: "border-tomato/30 bg-tomato/10 text-tomato",
  use_today: "border-tomato/30 bg-tomato/10 text-tomato",
  use_soon: "border-amberline/40 bg-amberline/15 text-amberline",
  quality_check: "border-butter/60 bg-butter/25 text-stone-800",
  opened_due: "border-amberline/40 bg-amberline/15 text-amberline",
  opened_soon: "border-butter/60 bg-butter/20 text-stone-800",
  normal: "border-leaf-500/20 bg-leaf-50 text-leaf-700",
  no_date: "border-stone-200 bg-stone-100 text-stone-600"
};

interface PriorityBadgeProps {
  priority: PriorityResult;
  t: Messages;
}

export function PriorityBadge({ priority, t }: PriorityBadgeProps): JSX.Element {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold",
        badgeClass[priority.verdict]
      )}
    >
      {t.priority[priority.verdict]}
    </span>
  );
}
