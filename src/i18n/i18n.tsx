"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import en from "@/i18n/locales/en.json";
import ru from "@/i18n/locales/ru.json";
import hy from "@/i18n/locales/hy.json";

export type Locale = "en" | "ru" | "hy";

const DICTS: Record<Locale, Record<string, unknown>> = { en, ru, hy };
const LOCALES: Locale[] = ["en", "ru", "hy"];
const STORAGE_KEY = "studyflow.locale";
const DEFAULT_LOCALE: Locale = "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  locales: Locale[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Resolve a dotted key ("task.title") against a nested dictionary object.
function resolve(dict: Record<string, unknown>, key: string): string {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as object)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : key;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback((key: string) => resolve(DICTS[locale], key), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, locales: LOCALES }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
