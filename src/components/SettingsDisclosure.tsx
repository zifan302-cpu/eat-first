import { ChevronDown, type LucideIcon } from "lucide-react";
import type { PropsWithChildren } from "react";

interface SettingsDisclosureProps extends PropsWithChildren {
  icon: LucideIcon;
  title: string;
  summary: string;
  defaultOpen?: boolean;
}

export function SettingsDisclosure({
  icon: Icon,
  title,
  summary,
  defaultOpen = false,
  children
}: SettingsDisclosureProps): JSX.Element {
  return (
    <details className="group fresh-card overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.85rem] bg-leaf-50 text-leaf-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-ink">{title}</span>
          <span className="mt-0.5 block text-xs font-medium leading-5 text-ink-muted">{summary}</span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-paper-line px-4 py-4">{children}</div>
    </details>
  );
}
