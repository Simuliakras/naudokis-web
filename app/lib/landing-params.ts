// Shared parsing of the landing/feed pages' searchParams. Both the pretty-URL
// landing routes and /skelbimai read these, so what counts as "page 2" or as a
// non-canonical (noindex) variant can never disagree between them.
import { parsePageParam, parseSortKey } from "@/app/lib/listings";
import { parsePriceParam, priceToCents, serializePriceParam } from "@/app/lib/price-range";
import { clampRangeToToday, datesToApiParams, parseDatesParam, serializeDatesParam } from "@/app/lib/date-filter";
import { todayInMarket } from "@/app/lib/dates";

export type LandingSearchParams = Record<string, string | string[] | undefined>;

// A repeated param (?q=a&q=b) arrives as an array — take the first value.
export function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function pageFromLandingSearch(sp: LandingSearchParams = {}): number {
  return parsePageParam(firstValue(sp.page));
}

// One parser for server prefetches and client-visible filters. Keeping the
// friendly `price` token alongside its API cents bounds lets pretty landing URLs
// hydrate the exact same React Query key as the interactive catalogue.
export function catalogueFiltersFromSearch(sp: LandingSearchParams = {}) {
  const priceRange = parsePriceParam(firstValue(sp.price));
  const priceCents = priceRange ? priceToCents(priceRange) : {};
  const delivery = firstValue(sp.delivery) === "1";
  // Clamp to the market's "today" so a stale past window never reaches the backend, which
  // answers a past-opening window with an empty page.
  //
  // The client cannot derive this date on its first render ("today" is not a server fact —
  // see use-market-today.ts), so a caller that renders FeedScreen from the URL rather than
  // from these filters must ALSO hand it this same date as `serverToday`, or its first key
  // is built from the raw window and misses this prefetch. /skelbimai does exactly that;
  // the pretty-URL landings instead pass the clamped `dates` token through initialFilters.
  //
  // todayInMarket() is read only when a date token is actually present: a page without one
  // stays time-independent (nothing to bake into an ISR'd render), and a dated URL is
  // dynamic (searchParams) and noindex anyway.
  const rawDates = parseDatesParam(firstValue(sp.dates));
  const dateRange = rawDates ? clampRangeToToday(rawDates, todayInMarket()) : null;
  return {
    q: firstValue(sp.q) ?? "",
    sort: parseSortKey(firstValue(sp.sort)),
    page: pageFromLandingSearch(sp),
    delivery,
    price: priceRange ? serializePriceParam(priceRange) : "",
    priceMinCents: priceCents.priceMinCents,
    priceMaxCents: priceCents.priceMaxCents,
    dates: serializeDatesParam(dateRange),
    ...datesToApiParams(dateRange),
    deliveryMethods: delivery ? ["user_delivery" as const] : undefined,
  };
}

// Free-text searches and sort/delivery/price variants create duplicate or thin
// states — crawlers may follow their links, but only the stable browse /
// category / city / category+city landing URLs get indexed.
export function hasNonCanonicalLandingSearch(sp: LandingSearchParams = {}): boolean {
  const q = firstValue(sp.q);
  const sort = firstValue(sp.sort);
  return Boolean(
    (q && q.trim()) ||
    (sort && sort !== "newest" && sort !== "recommended") ||
    firstValue(sp.delivery) === "1" ||
    firstValue(sp.price) ||
    firstValue(sp.dates),
  );
}
