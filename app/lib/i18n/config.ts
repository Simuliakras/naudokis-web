// i18n configuration — the public import surface for locale + URL handling.
//
// The primitives live in ./locales (a dependency-free leaf, so the route translators
// can use them without an import cycle); this module re-exports them and adds
// `localePath`, the one function that turns an internal path into a real public URL.
export {
  locales,
  defaultLocale,
  isLocale,
  barePath,
  localePrefix,
  localeHome,
  splitPathSuffix,
  negotiateLocale,
  type Locale,
} from "./locales";

import { localeHome, localePrefix, splitPathSuffix, type Locale } from "./locales";
import { localizeRoute } from "./routes";

// Bare INTERNAL path → the public URL for `locale`.
//
// Two things happen here, and callers should not try to do either by hand:
//   1. route segments are translated ("/skelbimai" → "/listings" in English), and
//   2. the locale prefix is applied (the default locale is unprefixed).
//
// So `localePath("en", "/skelbimai")` is "/en/listings", not "/en/skelbimai". Pass
// the internal (Lithuanian) spelling — that is the vocabulary every path builder in
// the codebase emits (listingLandingPath, breadcrumb crumbs, the dictionaries' href
// tables). Passing an already-localized path would double-translate.
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const [route, suffix] = splitPathSuffix(localizeRoute(locale, normalized));
  if (route === "/") {
    return `${localeHome(locale)}${suffix}`;
  }
  return `${localePrefix(locale)}${route}${suffix}`;
}
