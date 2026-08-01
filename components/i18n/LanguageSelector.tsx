"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, localeLabels, localeCookieName, type Locale } from "@/i18n/config";

// Explicit selection — the highest-priority signal in the locale
// resolution order (selector > browser language > default). Writes the
// cookie next-intl's request config reads server-side, then refreshes so
// server components re-render with the new locale's messages. A plain
// cookie write + router.refresh() (rather than a full reload) keeps the
// in-memory Zustand session/assessment state intact across the switch.
export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const t = useTranslations("languageSelector");
  const router = useRouter();

  function handleChange(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className="f-10 txt-upp letter-spacing2" style={{ color: "#8A8478", display: "inline-flex", alignItems: "center", gap: 6 }}>
      {t("label")}
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        aria-label={t("label")}
        style={{
          background: "transparent",
          border: "1px solid #3a2f12",
          borderRadius: 6,
          color: "#EFE9DA",
          padding: "4px 8px",
          fontSize: 12,
        }}
      >
        {locales.map((l) => (
          <option key={l} value={l} style={{ color: "#111" }}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
