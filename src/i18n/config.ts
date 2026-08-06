// Central locale registry — the single source of truth for which languages
// the Giantverse experience supports. Everything else (request config,
// language selector, cookie validation) reads from this list rather than
// repeating it, so adding a language is a one-file change.

export const locales = ["en", "ta", "kn", "hi", "te"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
  te: "తెలుగు",
};

export const localeCookieName = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

// Matches an Accept-Language header value (e.g. "ta-IN,ta;q=0.9,en;q=0.8")
// against our supported locales, in the browser's stated preference order.
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .map((tag) => tag.split("-")[0]); // "ta-IN" -> "ta"
  for (const tag of preferred) {
    if (isLocale(tag)) return tag;
  }
  return null;
}
