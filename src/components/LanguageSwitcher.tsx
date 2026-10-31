"use client";

import { useI18n, type Locale } from "@/i18n/i18n";

const LABELS: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  hy: "ՀՅ",
};

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();

  return (
    <div className="inline-flex overflow-hidden rounded-md border border-black/10 dark:border-white/15">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === code
              ? "bg-foreground text-background"
              : "text-foreground/70 hover:bg-foreground/5"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
