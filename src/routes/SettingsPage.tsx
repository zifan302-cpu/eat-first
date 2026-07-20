import { useMemo, useState } from "react";
import type { LocaleCode } from "../types/food";
import { SafetyBanner } from "../components/SafetyBanner";
import { PageHeader } from "../components/PageHeader";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { clearState, createDefaultState, isImportableState, migrateState } from "../lib/storage";
import { CHARACTERS } from "../lib/characters";
import { cx } from "../lib/ui";

export function SettingsPage(): JSX.Element {
  const { state, replaceState } = useAppState();
  const { locale, setLocale, t } = useLocale();
  const [jsonText, setJsonText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const guardian = CHARACTERS.eggplant;

  const exportValue = useMemo(() => JSON.stringify(state, null, 2), [state]);

  function setLanguage(next: LocaleCode) {
    setLocale(next);
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={guardian.role[locale]} title={t.pages.settingsTitle} />

      <section className="fresh-card relative overflow-hidden p-4">
        <img
          src={guardian.asset}
          alt=""
          className="absolute -bottom-8 -right-7 h-40 w-40 object-contain object-bottom"
        />
        <div className="relative z-10 max-w-[62%] py-2">
          <h2 className="font-editorial text-lg font-black tracking-tight text-ink">{t.settings.language}</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-ink-muted">
            {t.settings.aboutBody}
          </p>
        </div>
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
                "min-h-11 rounded-[0.9rem] border px-3 text-sm font-black",
                locale === value
                  ? "border-ink bg-ink text-paper"
                  : "border-paper-line bg-paper text-ink"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="fresh-card p-4">
        <h2 className="fresh-section-title text-lg">{t.settings.installTitle}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">{t.install.body}</p>
        <ol className="mt-3 space-y-2">
          {t.install.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm font-medium leading-6 text-ink">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-leaf-500/20 bg-leaf-50 text-xs font-extrabold text-leaf-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="fresh-card space-y-3 p-4">
        <h2 className="fresh-section-title text-lg">{t.settings.data}</h2>
        <button
          type="button"
          onClick={() => setJsonText(exportValue)}
          className="fresh-button-secondary w-full"
        >
          {t.actions.exportJson}
        </button>
        <p className="text-xs font-medium text-ink-muted">{t.settings.exportNote}</p>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          rows={6}
          className="w-full rounded-[1rem] border border-paper-line bg-paper px-4 py-3 text-xs font-semibold outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100/70"
        />
        <button
          type="button"
          onClick={() => {
            try {
              const parsed = JSON.parse(jsonText) as unknown;
              if (!isImportableState(parsed)) {
                throw new Error("INVALID_IMPORT");
              }
              replaceState(migrateState(parsed));
              setImportMessage(t.settings.importSuccess);
            } catch {
              setImportMessage(t.settings.importError);
            }
          }}
          className="fresh-button-primary w-full"
        >
          {t.actions.importJson}
        </button>
        <p className="text-xs font-medium text-ink-muted">{t.settings.importNote}</p>
        {importMessage ? <p className="text-sm font-semibold text-ink">{importMessage}</p> : null}
        <button
          type="button"
          onClick={() => {
            clearState();
            const empty = createDefaultState();
            empty.preferences.locale = locale;
            replaceState(empty);
          }}
          className="fresh-button w-full border border-tomato/25 bg-paper-soft text-tomato"
        >
          {t.actions.clearData}
        </button>
        <p className="text-xs font-medium text-ink-muted">{t.settings.clearNote}</p>
      </section>

      <section>
        <h2 className="mb-3 fresh-section-title text-lg">{t.settings.foodSafety}</h2>
        <SafetyBanner t={t} />
      </section>

      <section className="fresh-card p-4">
        <h2 className="fresh-section-title text-lg">{t.settings.about}</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">{t.settings.aboutBody}</p>
        <p className="mt-2 text-xs font-bold text-leaf-700">{t.app.version}</p>
      </section>
    </div>
  );
}
