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
