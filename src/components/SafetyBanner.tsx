import { ShieldAlert, X } from "lucide-react";
import type { Messages } from "../i18n/en-GB";

interface SafetyBannerProps {
  t: Messages;
  onDismiss?: () => void;
}

export function SafetyBanner({ t, onDismiss }: SafetyBannerProps): JSX.Element {
  return (
    <section className="flex gap-3 rounded-md border border-amberline/30 bg-white px-3 py-3 shadow-soft">
      <ShieldAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-amberline" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-stone-900">{t.safety.title}</h2>
        <p className="mt-1 text-xs leading-5 text-stone-600">{t.safety.body}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label={t.actions.dismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-stone-500 hover:bg-stone-100"
          onClick={onDismiss}
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
}
