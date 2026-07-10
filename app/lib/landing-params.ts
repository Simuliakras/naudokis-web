// Shared parsing of the landing/feed pages' searchParams. Both the pretty-URL
// landing routes and /skelbimai read these, so what counts as "page 2" or as a
// non-canonical (noindex) variant can never disagree between them.
import { parsePageParam } from "@/app/lib/listings";

export type LandingSearchParams = Record<string, string | string[] | undefined>;

// A repeated param (?q=a&q=b) arrives as an array — take the first value.
export function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function pageFromLandingSearch(sp: LandingSearchParams = {}): number {
  return parsePageParam(firstValue(sp.page));
}

// Free-text searches and sort/delivery/price variants create duplicate or thin
// states — crawlers may follow their links, but only the stable browse /
// category / city / category+city landing URLs get indexed.
export function hasNonCanonicalLandingSearch(sp: LandingSearchParams = {}): boolean {
  const q = firstValue(sp.q);
  const sort = firstValue(sp.sort);
  return Boolean(
    (q && q.trim()) ||
    (sort && sort !== "recommended") ||
    firstValue(sp.delivery) === "1" ||
    firstValue(sp.price),
  );
}
