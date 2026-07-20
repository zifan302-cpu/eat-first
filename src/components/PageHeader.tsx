import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, body, action }: PageHeaderProps): JSX.Element {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="fresh-eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-editorial text-[2rem] font-black leading-[1.08] tracking-[-0.035em] text-ink">
          {title}
        </h1>
        {body ? <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-ink-muted">{body}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
