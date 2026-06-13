import { useState } from "react";
import { Unlock, X } from "lucide-react";
import type { Messages } from "../i18n/en-GB";
import { isValidDemoProCode, unlockProGate } from "../lib/progate";
import { useAppState } from "../hooks/useAppState";

interface ProGateModalProps {
  open: boolean;
  t: Messages;
  onClose(): void;
}

export function ProGateModal({ open, t, onClose }: ProGateModalProps): JSX.Element | null {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { setState } = useAppState();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/35 px-4 pb-4 sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-md rounded-t-md bg-white p-4 shadow-soft sm:rounded-md">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-leaf-50 text-leaf-700">
            <Unlock aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{t.pro.title}</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">{t.pro.body}</p>
            <p className="mt-1 text-sm leading-6 text-stone-600">{t.pro.limit}</p>
          </div>
          <button
            type="button"
            aria-label={t.actions.close}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md hover:bg-stone-100"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t.settings.proCodePlaceholder}
            className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-200 px-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
          />
          <button
            type="button"
            className="min-h-12 rounded-md bg-leaf-500 px-4 text-sm font-bold text-white"
            onClick={() => {
              const unlocked = isValidDemoProCode(code);
              setState((current) => unlockProGate(current, code));
              setMessage(unlocked ? t.pro.success : t.pro.invalid);
              if (unlocked) {
                setCode("");
              }
            }}
          >
            {t.actions.unlock}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-stone-700">{message}</p> : null}
      </section>
    </div>
  );
}
