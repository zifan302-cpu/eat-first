import type { LucideIcon } from "lucide-react";
import { Check, LockKeyhole, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

interface FutureFeatureDialogProps {
  open: boolean;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  steps: readonly [string, string, string];
  boundary: string;
  pendingLabel: string;
  closeLabel: string;
  children?: ReactNode;
  onClose: () => void;
}

export function FutureFeatureDialog({
  open,
  icon: Icon,
  eyebrow,
  title,
  body,
  steps,
  boundary,
  pendingLabel,
  closeLabel,
  children,
  onClose
}: FutureFeatureDialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="future-feature-preview-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[88vh] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto rounded-[1.6rem] border border-ink/20 bg-paper-soft p-0 text-ink shadow-lift backdrop:bg-ink/45"
    >
      <div className="border-b border-paper-line bg-ink p-5 text-paper">
        <div className="flex items-center justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-[0.9rem] bg-paper/10 text-[#D8CFAE]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid h-10 w-10 place-items-center rounded-full text-paper/75 transition hover:bg-paper/10 hover:text-paper"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-5 text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#D8CFAE]">{eyebrow}</p>
        <h2 id="future-feature-preview-title" className="mt-2 font-editorial text-2xl font-black leading-tight tracking-[-0.03em]">
          {title}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-paper/72">{body}</p>
      </div>

      <div className="p-5">
        {children}
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 rounded-[1rem] border border-paper-line bg-paper px-3.5 py-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-leaf-100 text-xs font-black text-leaf-700">
                {index + 1}
              </span>
              <span className="text-sm font-bold leading-5 text-ink">{step}</span>
              <Check className="ml-auto h-4 w-4 shrink-0 text-leaf-500" aria-hidden />
            </li>
          ))}
        </ol>

        <div className="mt-4 flex gap-2.5 rounded-[1rem] bg-[#F3E4CD] p-3.5 text-[#70431C]">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="text-xs font-bold leading-5">{boundary}</p>
        </div>

        <button type="button" disabled className="fresh-button mt-5 w-full border-paper-line bg-paper-line/50 text-ink-muted">
          {pendingLabel}
        </button>
        <button type="button" onClick={onClose} className="mt-2 min-h-11 w-full text-sm font-black text-leaf-700">
          {closeLabel}
        </button>
      </div>
    </dialog>
  );
}
