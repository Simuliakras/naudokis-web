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

// Pick a locale from an Accept-Language header, highest q-value first, falling back
// to the default. Used only for the app-link URLs (see lib/app-links.ts): those are
// baked into transactional emails and the app's universal-link claims, so they are
// always unprefixed and cannot carry a locale — the browser's preference is the only
// signal there is. Every other URL on the site keeps the simple rule: unprefixed
// means Lithuanian.
export function negotiateLocale(header: string | null): Locale {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((entry) => entry.tag && Number.isFinite(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    // Match on the primary subtag: "en-GB" and "en" both mean English.
    const primary = tag.split("-")[0];
    if (isLocale(primary)) {
      return primary;
    }
  }
  return defaultLocale;
}
