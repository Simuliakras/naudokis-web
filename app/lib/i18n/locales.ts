// Locale primitives — the supported locales, the default, and prefix handling.
//
// This module is deliberately a LEAF: it imports nothing. `route-segments.ts`,
// `routes.ts` and `landing-routes.ts` all need `Locale`/`defaultLocale`, and
// `i18n/config.ts` needs *them* to build the translating `localePath`. Keeping the
// primitives here is what makes that graph acyclic. Import from `i18n/config` in
// application code — it re-exports everything below plus `localePath`.
export const locales = ["lt", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "lt";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Strip a leading locale prefix from a pathname to get the bare path. The default
// locale is served unprefixed, so "/en/skelbimai" and "/lt/skelbimai" both
// reduce to "/skelbimai"; "/" stays "/". Built from `locales` so it stays correct
// when a locale is added.
//
// NOTE: this strips the PREFIX only — it does not translate segments. A bare path
// obtained this way is still in the *public* spelling of whatever locale it came
// from ("/listings", not "/skelbimai"). To get the internal spelling, follow it with
// `internalizeRoute` (see i18n/routes.ts).
const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
export function barePath(pathname: string): string {
  return pathname.replace(LOCALE_PREFIX, "") || "/";
}

// Single source of truth for locale URL construction. The default locale is
// served unprefixed, so its prefix is "" and its home is "/"; other locales are
// prefixed (`localePrefix("en") === "/en"`, `localeHome("en") === "/en"`).
//
// `localePrefix` returns a PREFIX ONLY. Never concatenate a route onto it —
// route segments are spelled differently per locale, so `localePrefix(l) + "/skelbimai"`
// produces "/en/skelbimai", which is not a real English URL. Use `localePath`.
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}
export function localeHome(locale: Locale): string {
  return localePrefix(locale) || "/";
}

// Split a path from its query/hash tail so segment translation only ever sees
// segments. Shared by every translator here and in routes.ts — two call sites pass
// paths that carry a query ("/invite?code=…", "/nuoma/x?page=2").
export function splitPathSuffix(path: string): [string, string] {
  const at = path.search(/[?#]/);
  return at === -1 ? [path, ""] : [path.slice(0, at), path.slice(at)];
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
