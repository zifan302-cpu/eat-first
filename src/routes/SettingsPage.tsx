import { useMemo, useState } from "react";
import type { LocaleCode } from "../types/food";
import { SafetyBanner } from "../components/SafetyBanner";
import { useAppState } from "../hooks/useAppState";
import { useFoodActions } from "../hooks/useFoodActions";
import { useLocale } from "../hooks/useLocale";
import { clearState, createDefaultState, migrateState } from "../lib/storage";
import { isValidDemoProCode, unlockProGate } from "../lib/progate";
import { cx } from "../lib/ui";

export function SettingsPage(): JSX.Element {
  const { state, setState, replaceState } = useAppState();
  const actions = useFoodActions();
  const { locale, setLocale, t } = useLocale();
  const [code, setCode] = useState("");
  const [proMessage, setProMessage] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");

  const exportValue = useMemo(() => JSON.stringify(state, null, 2), [state]);

  function setLanguage(next: LocaleCode) {
    setLocale(next);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold leading-tight">{t.pages.settingsTitle}</h1>
      </header>

      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.settings.language}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["zh-CN", t.settings.zh],
            ["en-GB", t.settings.en]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLanguage(value as LocaleCode)}
              className={cx(
                "min-h-11 rounded-md border px-3 text-sm font-bold",
                locale === value
                  ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                  : "border-stone-200 bg-white text-stone-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.settings.installTitle}</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">{t.install.body}</p>
        <ol className="mt-3 space-y-2">
          {t.install.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm font-medium leading-6 text-stone-700">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-xs font-extrabold text-leaf-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.settings.demoUnlock}</h2>
        <p className="mt-1 text-sm font-semibold text-stone-600">
          {state.preferences.proUnlocked ? t.settings.proStatusUnlocked : t.settings.proStatusFree}
        </p>
        <p className="mt-1 text-sm leading-6 text-stone-600">{t.pro.body}</p>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t.settings.proCodePlaceholder}
            className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-200 px-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
          />
          <button
            type="button"
            onClick={() => {
              const unlocked = isValidDemoProCode(code);
              setState((current) => unlockProGate(current, code));
              setProMessage(unlocked ? t.pro.success : t.pro.invalid);
            }}
            className="min-h-12 rounded-md bg-leaf-500 px-4 text-sm font-bold text-white"
          >
            {t.actions.unlock}
          </button>
        </div>
        {proMessage ? <p className="mt-2 text-sm font-semibold text-stone-700">{proMessage}</p> : null}
      </section>

      <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.settings.data}</h2>
        <button
          type="button"
          onClick={() => setJsonText(exportValue)}
          className="min-h-12 w-full rounded-md border border-stone-200 px-4 text-sm font-bold text-stone-700"
        >
          {t.actions.exportJson}
        </button>
        <p className="text-xs font-medium text-stone-500">{t.settings.exportNote}</p>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          rows={6}
          className="w-full rounded-md border border-stone-200 px-3 py-3 text-xs font-medium outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        />
        <button
          type="button"
          onClick={() => {
            try {
              replaceState(migrateState(JSON.parse(jsonText)));
            } catch {
              replaceState(migrateState({}));
            }
          }}
          className="min-h-12 w-full rounded-md bg-stone-900 px-4 text-sm font-bold text-white"
        >
          {t.actions.importJson}
        </button>
        <p className="text-xs font-medium text-stone-500">{t.settings.importNote}</p>
        <button
          type="button"
          onClick={actions.resetDemo}
          className="min-h-12 w-full rounded-md border border-stone-200 px-4 text-sm font-bold text-stone-700"
        >
          {t.actions.resetDemo}
        </button>
        <p className="text-xs font-medium text-stone-500">{t.settings.resetNote}</p>
        <button
          type="button"
          onClick={() => {
            clearState();
            const empty = createDefaultState();
            empty.preferences.locale = locale;
            replaceState(empty);
          }}
          className="min-h-12 w-full rounded-md border border-tomato/25 px-4 text-sm font-bold text-tomato"
        >
          {t.actions.clearData}
        </button>
        <p className="text-xs font-medium text-stone-500">{t.settings.clearNote}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">{t.settings.foodSafety}</h2>
        <SafetyBanner t={t} />
      </section>

      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-extrabold">{t.settings.about}</h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">{t.settings.aboutBody}</p>
        <p className="mt-2 text-xs font-bold text-leaf-700">{t.app.version}</p>
      </section>
    </div>
  );
}
