import { Smartphone, X } from "lucide-react";
import type { Messages } from "../i18n/en-GB";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

interface InstallHintProps {
  t: Messages;
  onDismiss?: () => void;
}

export function InstallHint({ t, onDismiss }: InstallHintProps): JSX.Element {
  const install = useInstallPrompt();

  return (
    <section className="flex items-center gap-3 rounded-md border border-leaf-500/15 bg-white px-3 py-3 shadow-soft">
      <Smartphone aria-hidden className="h-5 w-5 shrink-0 text-leaf-700" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold">{t.install.title}</h2>
        <p className="mt-1 text-xs leading-5 text-stone-600">{t.install.body}</p>
      </div>
      {install.canPrompt ? (
        <button
          type="button"
          className="min-h-9 rounded-md bg-leaf-500 px-3 text-xs font-bold text-white"
          onClick={install.promptInstall}
        >
          {t.install.title}
        </button>
      ) : null}
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
