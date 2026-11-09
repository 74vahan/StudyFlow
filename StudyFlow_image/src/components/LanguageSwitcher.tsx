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
    <div className="inline-flex overflow-hidden rounded-lg border-[3px] border-ink">
      {locales.map((code, i) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
            i > 0 ? "border-l-[3px] border-ink" : ""
          } ${
            locale === code
              ? "bg-tangerine text-white"
              : "bg-surface text-ink hover:bg-mustard"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
