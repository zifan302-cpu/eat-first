import { useMemo } from "react";
import type { LocaleCode } from "../types/food";
import { getMessages } from "../i18n";
import { useAppState } from "./useAppState";

export function useLocale() {
  const { state, setState } = useAppState();
  const locale = state.preferences.locale;

  return useMemo(
    () => ({
      locale,
      t: getMessages(locale),
      setLocale(nextLocale: LocaleCode) {
        setState((current) => ({
          ...current,
          preferences: {
            ...current.preferences,
            locale: nextLocale
          }
        }));
      }
    }),
    [locale, setState]
  );
}
