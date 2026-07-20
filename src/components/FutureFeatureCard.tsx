import type { LucideIcon } from "lucide-react";

interface FutureFeatureCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  badge: string;
  onOpen: () => void;
}

export function FutureFeatureCard({
  icon: Icon,
  eyebrow,
  title,
  body,
  actionLabel,
  badge,
  onOpen
}: FutureFeatureCardProps): JSX.Element {
  return (
    <section className="fresh-card overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] bg-[#DEE6E7] text-freezer">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="fresh-eyebrow">{eyebrow}</p>
            <span className="rounded-full bg-paper px-2 py-1 text-[0.58rem] font-black text-ink-muted">{badge}</span>
          </div>
          <h2 className="mt-1 font-editorial text-lg font-black tracking-[-0.025em] text-ink">{title}</h2>
          <p className="mt-1.5 text-xs font-medium leading-5 text-ink-muted">{body}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-12 w-full items-center justify-center border-t border-paper-line bg-paper px-4 text-sm font-black text-leaf-700 transition hover:bg-leaf-50"
      >
        {actionLabel}
      </button>
    </section>
  );
}
