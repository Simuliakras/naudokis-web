// i18n configuration — supported locales and the default locale.
export const locales = ["lt", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "lt";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Strip a leading locale prefix from a pathname to get the bare (default-locale)
// path. The default locale is served unprefixed, so "/en/kategorijos" and
// "/lt/kategorijos" both reduce to "/kategorijos"; "/" stays "/". Built from
// `locales` so it stays correct when a locale is added.
const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
export function barePath(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX, "") || "/";
}

// Single source of truth for locale URL construction. The default locale is
// served unprefixed, so its prefix is "" and its home is "/"; other locales are
// prefixed (`localePrefix("en") === "/en"`, `localeHome("en") === "/en"`).
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}
export function localeHome(locale: Locale): string {
  return localePrefix(locale) || "/";
}

export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") {
    return localeHome(locale);
  }
  return `${localePrefix(locale)}${normalized}`;
}
