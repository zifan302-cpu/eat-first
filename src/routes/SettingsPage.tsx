import {
  ChefHat,
  Database,
  Download,
  Info,
  Languages,
  ShieldCheck,
  Smartphone,
  Upload
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CustomTagEditor } from "../components/CustomTagEditor";
import { PageHeader } from "../components/PageHeader";
import { SafetyBanner } from "../components/SafetyBanner";
import { SettingsDisclosure } from "../components/SettingsDisclosure";
import { useAppState } from "../hooks/useAppState";
import { useLocale } from "../hooks/useLocale";
import { COOKING_EQUIPMENT, COOKING_EQUIPMENT_GROUPS, PANTRY_STAPLES } from "../lib/constants";
import { clearState, createDefaultState, isImportableState, migrateState } from "../lib/storage";
import { cx } from "../lib/ui";
import type { CookingEquipment, LocaleCode, PantryStaple, UserPreferences } from "../types/food";

const servingsOptions = [1, 2, 3, 4] as const;
const timeOptions = [15, 30, 45, 60] as const;

export function SettingsPage(): JSX.Element {
  const { state, setState, replaceState } = useAppState();
  const { locale, setLocale, t } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [clearArmed, setClearArmed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone === true
    );
  }, []);

  function setLanguage(next: LocaleCode) {
    setLocale(next);
  }

  function updateRecipePreferences(patch: Partial<UserPreferences["recipe"]>) {
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        recipe: {
          ...current.preferences.recipe,
          ...patch
        }
      }
    }));
  }

  function updateEquipment(item: CookingEquipment, enabled: boolean) {
    updateRecipePreferences({
      equipment: {
        ...state.preferences.recipe.equipment,
        [item]: enabled
      }
    });
  }

  function updatePantryStaple(item: PantryStaple, enabled: boolean) {
    updateRecipePreferences({
      pantryStaples: {
        ...state.preferences.recipe.pantryStaples,
        [item]: enabled
      }
    });
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fridge-fresh-squad-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setDataMessage(t.settings.backupDownloaded);
  }

  async function restoreBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isImportableState(parsed)) throw new Error("INVALID_IMPORT");
      replaceState(migrateState(parsed));
      setDataMessage(t.settings.importSuccess);
      setClearArmed(false);
    } catch {
      setDataMessage(t.settings.importError);
    }
  }

  const selectedEquipmentCount = COOKING_EQUIPMENT.filter(
    (item) => state.preferences.recipe.equipment[item]
  ).length + state.preferences.recipe.customEquipment.length;
  const selectedPantryCount = PANTRY_STAPLES.filter(
    (item) => state.preferences.recipe.pantryStaples[item]
  ).length + state.preferences.recipe.customPantryStaples.length;

  return (
    <div className="space-y-4">
      <PageHeader eyebrow={t.nav.settings} title={t.pages.settingsTitle} />

      <SettingsDisclosure
        icon={Languages}
        title={t.settings.general}
        summary={t.settings.language}
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-2">
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
      </SettingsDisclosure>

      <SettingsDisclosure
        icon={ChefHat}
        title={t.settings.cooking}
        summary={t.settings.cookingBody}
        defaultOpen
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-ink">{t.settings.cuisine}</span>
            <select
              value={state.preferences.recipe.cuisine}
              onChange={(event) =>
                updateRecipePreferences({
                  cuisine: event.target.value as UserPreferences["recipe"]["cuisine"]
                })
              }
              className="fresh-field"
            >
              <option value="auto">{t.recipe.cuisineAuto}</option>
              <option value="chinese_home">{t.recipe.cuisineChinese}</option>
              <option value="global_everyday">{t.recipe.cuisineGlobal}</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-sm font-black text-ink">{t.settings.defaultServings}</span>
              <select
                value={state.preferences.recipe.defaultServings}
                onChange={(event) =>
                  updateRecipePreferences({
                    defaultServings: Number(event.target.value) as 1 | 2 | 3 | 4
                  })
                }
                className="fresh-field"
              >
                {servingsOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-ink">{t.settings.defaultTime}</span>
              <select
                value={state.preferences.recipe.defaultMaxMinutes}
                onChange={(event) =>
                  updateRecipePreferences({
                    defaultMaxMinutes: Number(event.target.value) as 15 | 30 | 45 | 60
                  })
                }
                className="fresh-field"
              >
                {timeOptions.map((value) => (
                  <option key={value} value={value}>{value} {t.recipe.minutes}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-black text-ink">{t.settings.dietaryNotes}</span>
            <input
              value={state.preferences.recipe.dietaryNotes}
              maxLength={240}
              onChange={(event) => updateRecipePreferences({ dietaryNotes: event.target.value })}
              placeholder={t.recipe.dietaryPlaceholder}
              className="fresh-field"
            />
          </label>

          <details className="rounded-[1rem] border border-paper-line bg-paper">
            <summary className="cursor-pointer list-none px-4 py-3 marker:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-black text-ink">{t.settings.equipment}</span>
                  <span className="block text-xs font-medium text-ink-muted">
                    {t.settings.selectedCount.replace("{count}", String(selectedEquipmentCount))}
                  </span>
                </span>
                <span className="text-xs font-black text-leaf-700">{t.settings.manage}</span>
              </span>
            </summary>
            <div className="space-y-4 border-t border-paper-line p-3">
              {(Object.entries(COOKING_EQUIPMENT_GROUPS) as Array<[
                keyof typeof COOKING_EQUIPMENT_GROUPS,
                CookingEquipment[]
              ]>).map(([group, items]) => (
                <fieldset key={group}>
                  <legend className="mb-2 text-xs font-black uppercase tracking-wide text-ink-muted">
                    {t.settings.equipmentGroups[group]}
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => (
                      <label
                        key={item}
                        className="flex min-h-11 items-center gap-2 rounded-[0.9rem] border border-paper-line bg-paper-soft px-3 text-sm font-bold text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={state.preferences.recipe.equipment[item]}
                          onChange={(event) => updateEquipment(item, event.target.checked)}
                          className="h-4 w-4 accent-leaf-700"
                        />
                        {t.settings.equipmentLabels[item]}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <CustomTagEditor
                items={state.preferences.recipe.customEquipment}
                maxItems={8}
                label={t.settings.customEquipment}
                hint={t.settings.customEquipmentHint}
                placeholder={t.settings.customEquipmentPlaceholder}
                addLabel={t.settings.addCustom}
                duplicateMessage={t.settings.customDuplicate}
                limitMessage={t.settings.customEquipmentLimit}
                removeLabel={t.settings.removeCustom}
                onChange={(customEquipment) => updateRecipePreferences({ customEquipment })}
              />
            </div>
          </details>

          <div className="space-y-3 rounded-[1rem] border border-paper-line bg-paper p-3">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-ink">{t.settings.pantryPolicy}</span>
              <select
                value={state.preferences.recipe.pantryPolicy}
                onChange={(event) =>
                  updateRecipePreferences({
                    pantryPolicy: event.target.value as UserPreferences["recipe"]["pantryPolicy"]
                  })
                }
                className="fresh-field"
              >
                <option value="strict">{t.settings.pantryPolicies.strict}</option>
                <option value="everyday">{t.settings.pantryPolicies.everyday}</option>
                <option value="flexible">{t.settings.pantryPolicies.flexible}</option>
              </select>
            </label>

            <details>
              <summary className="cursor-pointer text-sm font-black text-leaf-700">
                {t.settings.pantryStaples} · {t.settings.selectedCount.replace("{count}", String(selectedPantryCount))}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PANTRY_STAPLES.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-10 items-center gap-2 rounded-[0.8rem] bg-paper-soft px-3 text-xs font-bold text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={state.preferences.recipe.pantryStaples[item]}
                      onChange={(event) => updatePantryStaple(item, event.target.checked)}
                      className="h-4 w-4 accent-leaf-700"
                    />
                    {t.settings.pantryLabels[item]}
                  </label>
                ))}
              </div>
            </details>

            <CustomTagEditor
              items={state.preferences.recipe.customPantryStaples}
              maxItems={12}
              label={t.settings.customPantry}
              hint={t.settings.customPantryHint}
              placeholder={t.settings.customPantryPlaceholder}
              addLabel={t.settings.addCustom}
              duplicateMessage={t.settings.customDuplicate}
              limitMessage={t.settings.customPantryLimit}
              removeLabel={t.settings.removeCustom}
              onChange={(customPantryStaples) =>
                updateRecipePreferences({ customPantryStaples })
              }
            />
          </div>
        </div>
      </SettingsDisclosure>

      <SettingsDisclosure
        icon={Smartphone}
        title={t.settings.installTitle}
        summary={installed ? t.settings.installed : t.settings.installSummary}
      >
        {installed ? (
          <p className="text-sm font-bold leading-6 text-leaf-700">{t.settings.installed}</p>
        ) : (
          <>
            <p className="text-sm leading-6 text-ink-muted">{t.install.body}</p>
            <ol className="mt-3 space-y-2">
              {t.install.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm font-medium leading-6 text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-50 text-xs font-extrabold text-leaf-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </SettingsDisclosure>

      <SettingsDisclosure
        icon={Database}
        title={t.settings.data}
        summary={t.settings.dataSummary}
      >
        <div className="space-y-3">
          <button type="button" onClick={downloadBackup} className="fresh-button-secondary w-full">
            <Download className="mr-2 inline h-4 w-4" aria-hidden />
            {t.actions.downloadBackup}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="fresh-button-secondary w-full"
          >
            <Upload className="mr-2 inline h-4 w-4" aria-hidden />
            {t.actions.restoreBackup}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void restoreBackup(file);
              event.target.value = "";
            }}
          />
          {dataMessage ? <p className="text-sm font-semibold text-leaf-700">{dataMessage}</p> : null}
          {clearArmed ? (
            <p className="rounded-[0.9rem] bg-[#F3DDD3] p-3 text-sm font-bold leading-5 text-tomato">
              {t.settings.clearConfirm}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (!clearArmed) {
                setClearArmed(true);
                return;
              }
              clearState();
              const empty = createDefaultState();
              empty.preferences.locale = locale;
              replaceState(empty);
              setClearArmed(false);
              setDataMessage(null);
            }}
            className="fresh-button w-full border border-tomato/25 bg-paper-soft text-tomato"
          >
            {clearArmed ? t.actions.confirmClear : t.actions.clearData}
          </button>
        </div>
      </SettingsDisclosure>

      <SettingsDisclosure
        icon={ShieldCheck}
        title={t.settings.foodSafety}
        summary={t.settings.safetySummary}
      >
        <SafetyBanner t={t} />
      </SettingsDisclosure>

      <section className="fresh-card flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.85rem] bg-paper-soft text-leaf-700">
          <Info className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-black text-ink">{t.settings.about}</h2>
          <p className="mt-0.5 text-xs font-medium leading-5 text-ink-muted">{t.settings.aboutBody}</p>
          <p className="mt-1 text-xs font-bold text-leaf-700">{t.app.version}</p>
        </div>
      </section>
    </div>
  );
}
