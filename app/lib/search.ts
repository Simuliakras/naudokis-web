import { localePath, type Locale } from "@/app/lib/i18n/config";
import { listingLandingPath, type ListingLandingFilters } from "@/app/lib/landing-routes";

// Single source of truth for the listings-feed URL. The feed reads `q`
// (free-text search), `city` (exact city name) and `cat` (category id) — see
// app/[lang]/skelbimai. Only non-empty params are emitted and `q` is trimmed,
// so callers can pass raw input without pre-cleaning it.
export function listingSearchHref({
  q,
  city,
  cat,
  locale,
}: {
  q?: string;
  city?: string;
  cat?: string;
  locale?: Locale;
}): string {
  const params = new URLSearchParams();
  const query = q?.trim();
  if (query) {
    params.set("q", query);
  }
  if (city) {
    params.set("city", city);
  }
  if (cat) {
    params.set("cat", cat);
  }
  const qs = params.toString();
  const path = locale ? localePath(locale, "/skelbimai") : "/skelbimai";
  return qs ? `${path}?${qs}` : path;
}

export function listingLandingHref(filters: ListingLandingFilters & { locale: Locale }): string {
  return localePath(filters.locale, listingLandingPath(filters));
}

// The feed remembers its last URL (path + filters) per tab so other screens —
// e.g. the listing-detail nav search — can return to it with filters intact.
const LAST_FEED_KEY = "nk_last_feed";

export function rememberFeedUrl(url: string) {
  try {
    sessionStorage.setItem(LAST_FEED_KEY, url);
  } catch {
    // sessionStorage unavailable (privacy mode) — returning without filters is fine.
  }
}

export function lastFeedUrl(locale: Locale): string | null {
  try {
    const url = sessionStorage.getItem(LAST_FEED_KEY);
    // Ignore a URL recorded under another locale (the user switched language
    // since) — better to fall back to the bare feed than flip locales on them.
    // Must go through `localePath`: the English feed is "/en/listings", so a
    // prefix + "/skelbimai" test would reject every English visitor's own URL and
    // silently drop their filters.
    return url?.startsWith(localePath(locale, "/skelbimai")) ? url : null;
  } catch {
    return null;
  }
}
