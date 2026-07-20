import { ShieldAlert, X } from "lucide-react";
import type { Messages } from "../i18n/en-GB";
import { CHARACTERS } from "../lib/characters";

interface SafetyBannerProps {
  t: Messages;
  onDismiss?: () => void;
}

export function SafetyBanner({ t, onDismiss }: SafetyBannerProps): JSX.Element {
  return (
    <section className="fresh-card flex gap-3 p-3.5">
      <div className="grid h-11 w-11 shrink-0 place-items-end overflow-hidden rounded-[0.9rem] bg-leaf-100">
        <img
          src={CHARACTERS.broccoli.asset}
          alt=""
          className="h-[110%] w-[110%] object-contain object-bottom"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="flex items-center gap-1.5 text-sm font-black text-ink">
          <ShieldAlert aria-hidden className="h-4 w-4 text-carrot" />
          {t.safety.title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-ink-muted">{t.safety.body}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          aria-label={t.actions.dismiss}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-ink-muted hover:bg-paper"
          onClick={onDismiss}
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
}
