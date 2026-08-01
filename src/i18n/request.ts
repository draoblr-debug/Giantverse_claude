import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookieName, matchAcceptLanguage } from "./config";

// Locale resolution order (per the localization spec): explicit selection
// (the cookie the LanguageSelector writes) > browser language > default.
// There's no URL-based locale routing here — the app's flow is a
// single-page-app-like journey through Zustand-managed state, so a
// cookie/context locale (next-intl's "no routing" mode) fits without
// touching every route file.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookieName)?.value;

  const headerList = await headers();
  const fromBrowser = matchAcceptLanguage(headerList.get("accept-language"));

  const locale = isLocale(fromCookie) ? fromCookie : fromBrowser ?? defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
