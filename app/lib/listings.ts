// Listing data layer — browse listings + single-listing detail from the Naudokis backend.
import { useQuery, useInfiniteQuery, keepPreviousData, skipToken } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";
import { API_BASE } from "./api";

/* ---------------- Backend shapes ---------------- */
type ApiImage = { url: string; blurhash?: string };
type ApiCategoryName = { lt: string; en: string };

type ApiListing = {
  id: string;
  title: string;
  city: string | null;
  price_per_day_cents: number;
  rating_average: number | null;
  rating_count: number;
  status: string;
  images: ApiImage[];
  delivery_types_available?: string[];
  category_path?: string[]; // [top-level id, ...subcategories] — not guaranteed on browse items
  owner_id?: string; // groups a lister's items client-side (backend has no owner_id filter yet)
};

type ListingsResponse = {
  success: boolean;
  data: { items: ApiListing[]; count: number; has_more: boolean; next_token?: string };
};

type ApiAttributeDisplay = {
  id: string;
  name_lt: string;
  name_en: string;
  unit?: string;
  display_order: number;
  deprecated: boolean;
  orphan: boolean;
  value_label_lt?: string;
  value_label_en?: string;
};

// Owner block on the detail endpoint. Per the backend `ListingOwner` contract
// every field but `name` is optional, and the detail owner has no completed-rentals
// count (that lives only on the browse-card summary) — the host card uses
// `total_listings` instead.
type ApiOwner = {
  id?: string;
  name: string;
  business_name?: string | null;
  is_business?: boolean;
  verified?: boolean;
  rating_average?: number;
  rating_count?: number;
  total_listings?: number;
  avatar?: string;
  member_since?: string; // ISO date — host-card tenure line, rendered only when present
  avg_response_time_hours?: number | null;
};

// A delivery option on the listing. Only the fields the handover section reads are
// modelled; `type` is "pickup" | "user_delivery" on the wire.
type ApiDeliveryMethod = {
  type: string;
  delivery_radius_km?: number;
};

// Faithful (read-only) model of the backend `ListingDetail` contract — only the
// fields this site reads. `owner` / `attributes_display` / `city` are
// contract-optional (an owner-less or attribute-less listing is valid). The
// listing-level rating is intentionally absent here: the average, count and
// distribution all come from the separate /review-stats endpoint (see fetchReviewStats).
type ApiListingDetail = {
  id: string;
  title: string;
  description: string;
  city?: string;
  price_per_day_cents: number;
  deposit_amount_cents?: number | null;
  minimum_rental_days?: number;
  maximum_rental_days?: number;
  cancellation_policy?: string;
  delivery_methods?: ApiDeliveryMethod[];
  images?: ApiImage[];
  category_names: ApiCategoryName[];
  category_path?: string[]; // [top-level id, ...subcategories] — drives the similar-items query
  attributes_display?: ApiAttributeDisplay[];
  owner?: ApiOwner;
  owner_name?: string;
};

type ListingDetailResponse = { success: boolean; data: ApiListingDetail };

// GET /listings/{id}/review-stats — listing-level rating count + per-star
// distribution (anonymously accessible). rating_distribution keys are "1".."5".
type ApiReviewStats = {
  rating_average: number | null;
  rating_count: number;
  rating_distribution: Record<string, number>;
};

type ReviewStatsResponse = { success: boolean; data: ApiReviewStats };

// GET /listings/{id}/reviews — public reviews page. Only the fields the review
// card renders are modelled (the wire also carries reviewer/reviewee identity and
// review context the bridge site doesn't surface).
type ApiPublicReview = {
  review_id: string;
  reviewer_name: string;
  reviewer_photo_url?: string;
  rating: number;
  comment: string;
  created_at: string;
};

type PublicReviewsResponse = {
  success: boolean;
  data: { reviews: ApiPublicReview[]; count: number; has_more: boolean; next_token?: string };
};

/* ---------------- View models ---------------- */
export type Offer = {
  id: string;
  title: string;
  city?: string; // absent when the backend listing has no city — the card hides the row
  price: string;
  priceCents: number; // raw per-day price — the feed's client-side price bands filter on it
  img?: string;
  rating?: string; // formatted value, present only when ratingCount > 0
  ratingCount: number; // raw count, for building the localized review label
  hasDelivery: boolean; // derived client-side from delivery_types_available — see note in fetchListings
  category?: string; // top-level category id — tints the empty-photo placeholder (optional on the wire)
  ownerId?: string; // groups a lister's items client-side ("more from this owner" rail)
};

// Stable "photo safeguard" ordering — surface photo-bearing listings first so a feed
// page or band isn't a wall of category-icon placeholders. Apply per page (or to a
// one-shot list), never across accumulated infinite-scroll pages: re-sorting the
// full list would reshuffle cards the user has already scrolled past. Array.sort is
// stable, so order within the has-photo / no-photo groups is preserved (the
// placeholder stays the graceful fallback for the occasional no-photo item).
export function photoFirst<T extends { img?: string | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.img ? 0 : 1) - (b.img ? 0 : 1));
}

/* ---------------- Filters ---------------- */
// Backend `/listings` accepts q, city, category_id and a sort key. "delivery" is
// NOT a backend param, so the "Su pristatymu" toggle is applied client-side.
export type SortKey = "recommended" | "price_asc" | "price_desc" | "rating_desc";

// Narrow an untrusted value (e.g. a `?sort=` query param) to a valid SortKey,
// falling back to the backend default. Type-safe — no `as` cast needed.
export function parseSortKey(value: string | null | undefined): SortKey {
  if (value === "price_asc" || value === "price_desc" || value === "rating_desc") {
    return value;
  }
  return "recommended";
}

export type ListingFilters = {
  q?: string;
  city?: string;
  category?: string; // category id == backend category_id (also the URL slug)
  sort?: SortKey;
};

export type ListingAttribute = { id: string; label: string; value: string };

export type ListingReview = { name: string; date: string; stars: number; text: string; avatar: string | null };
export type RatingBucket = { stars: number; count: number };

// Summarized delivery options for the handover section.
export type ListingDelivery = { pickup: boolean; delivery: boolean; radiusKm: number | null };

export type ListingOwner = {
  id?: string; // wire owner id — keys the "more from this owner" rail (names aren't unique)
  name: string;
  verified: boolean;
  listingsCount: number; // owner.total_listings — host-card "listings" stat
  rating?: string;
  ratingCount: number;
  avatar: string | null;
  memberSinceYear?: number; // from member_since — tenure trust line, only when on the wire
  responseTimeHours?: number | null; // from avg_response_time_hours — only when non-null
};

export type ListingDetail = {
  id: string;
  title: string;
  city: string;
  price: string;
  priceCents: number; // raw per-day price, for the booking-panel breakdown math
  deposit: string | null; // formatted refundable deposit; null when the listing takes none
  minDays: number;
  maxDays: number;
  cancellation: string; // policy tier id ("flexible" | "moderate" | "strict" | …)
  insuranceIncluded: boolean; // derived from the insurance_included display attribute
  categoryId?: string; // top-level category id (category_path[0]) — similar-items query key
  delivery: ListingDelivery;
  description: string;
  rating?: string; // localized display string ("4,9" / "4.9")
  ratingValue: number; // raw numeric average, for star rendering / math
  ratingCount: number;
  images: string[];
  tags: string[];
  attributes: ListingAttribute[];
  owner: ListingOwner | null; // null when the listing has no owner block / owner_name
  reviews: ListingReview[];
  ratingBreakdown: RatingBucket[]; // [5★…1★] counts; empty when no reviews
};

/* ---------------- Formatting ---------------- */
// Cents → localized price string, in the "15 €" (lt) / "€15" (en) format.
export function formatPrice(cents: number, locale: Locale): string {
  const euros = cents / 100;
  const n =
    cents % 100 === 0
      ? String(Math.round(euros))
      : euros.toFixed(2).replace(".", locale === "lt" ? "," : ".");
  return locale === "lt" ? `${n} €` : `€${n}`;
}

export function formatRating(average: number, locale: Locale): string {
  return average.toFixed(1).replace(".", locale === "lt" ? "," : ".");
}

function ratingLabel(average: number | null, count: number, locale: Locale): string | undefined {
  if (count <= 0 || average == null) {
    return undefined;
  }
  return formatRating(average, locale);
}

// Formatted refundable deposit; null when the listing takes none (so the UI can
// fall back to a "no deposit" label rather than rendering "0 €").
function formatDeposit(cents: number | null | undefined, locale: Locale): string | null {
  return cents && cents > 0 ? formatPrice(cents, locale) : null;
}

// review-stats `rating_distribution` ({ "1": n … "5": n }) → the [5★…1★] buckets
// the rating breakdown bars render.
function distributionToBuckets(dist: Record<string, number>): RatingBucket[] {
  return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: dist[String(stars)] ?? 0 }));
}

// ISO timestamp → localized relative date ("2 weeks ago" / "prieš 2 savaites").
// Computed once inside the fetch and baked into the cached result, so there's no
// server/client "now" drift on hydration. Intl supports both lt and en.
function formatReviewDate(iso: string, locale: Locale): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) {
    return "";
  }
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"], [60, "minute"], [24, "hour"], [7, "day"], [4.34524, "week"], [12, "month"], [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = (ms - Date.now()) / 1000;
  for (const [amount, unit] of divisions) {
    if (Math.abs(value) < amount) {
      return rtf.format(Math.round(value), unit);
    }
    value /= amount;
  }
  return rtf.format(Math.round(value), "year");
}

/* ---------------- Fetchers + hooks ---------------- */
// How long server-side listing `fetch`es (browse + single) stay fresh. Shared
// so the detail page's prefetch and its raw-metadata fetch use identical
// options and Next collapses them into one request (see fetchListing + the
// detail page); fetchListings uses it for the home/feed prefetches.
export const LISTING_REVALIDATE = 300;

// Single source of truth for the query keys — used by the hooks below and by
// server components prefetching into the same cache slot, so they can't diverge.
// listingsKey applies the same empty-filter defaults the hook does.
export function listingsKey(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "recommended" } = filters;
  return ["listings", locale, q, city, category, sort] as const;
}

export function listingKey(id: string | undefined, locale: Locale) {
  return ["listing", id, locale] as const;
}

// The feed loads page-by-page (infinite scroll); its query lives under its own
// key so the home/feed single-page prefetches (listingsKey) stay independent.
export const LISTINGS_PAGE_SIZE = 12;

// First-page cursor — null until the backend returns a `next_token`. Typed so the
// infinite-query page param widens to `string | null` without an inline `as`.
export const LISTINGS_FIRST_CURSOR: string | null = null;

export function listingsInfiniteKey(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "recommended" } = filters;
  return ["listings-infinite", locale, q, city, category, sort] as const;
}

// Build the backend `/listings` query URL from the active filters. `limit` /
// `next_token` (cursor) are appended by the paginated fetcher when present.
function buildListingsUrl(filters: ListingFilters): URL {
  const url = new URL(`${API_BASE}/listings`);
  if (filters.q) {
    url.searchParams.set("q", filters.q);
  }
  if (filters.city) {
    url.searchParams.set("city", filters.city);
  }
  if (filters.category) {
    url.searchParams.set("category_id", filters.category);
  }
  // "recommended" is the backend default — only send sort for the explicit keys.
  if (filters.sort && filters.sort !== "recommended") {
    url.searchParams.set("sort", filters.sort);
  }
  return url;
}

// Map a backend browse item to the Offer view model.
function apiToOffer(l: ApiListing, locale: Locale): Offer {
  return {
    id: l.id,
    title: l.title,
    city: l.city ?? undefined,
    price: formatPrice(l.price_per_day_cents, locale),
    priceCents: l.price_per_day_cents,
    img: l.images?.[0]?.url,
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
    ratingCount: l.rating_count,
    // Backend has no `delivery=` filter; it exposes the per-item delivery types
    // instead, so the "Su pristatymu" toggle filters the loaded results client-side.
    hasDelivery: (l.delivery_types_available ?? []).includes("user_delivery"),
    // The wire's `category` field is a leaf id (e.g. "cars"); the accent and
    // icon maps key on the top-level id, which leads category_path.
    category: l.category_path?.[0],
    ownerId: l.owner_id,
  };
}

export async function fetchListings(locale: Locale, filters: ListingFilters): Promise<Offer[]> {
  const url = buildListingsUrl(filters);
  // Server-side (home/feed prefetch) the browse data stays fresh for the same
  // window as a single listing, and the route-level `revalidate = 300` on the
  // home page can regenerate with fresh data. Browser fetches ignore `next`.
  const res = await fetch(url, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new Error(`Failed to load listings: ${res.status}`);
  }
  const body: ListingsResponse = await res.json();
  return body.data.items.filter((l) => l.status === "active").map((l) => apiToOffer(l, locale));
}

// One page of browse results plus the cursor for the next page (null at the end).
export type ListingsPage = { offers: Offer[]; nextToken: string | null; totalCount: number };

// Cursor-paginated browse fetch backing the feed's infinite scroll. The backend
// uses an opaque `next_token` cursor.
export async function fetchListingsPage(
  locale: Locale, filters: ListingFilters, pageParam: string | null,
): Promise<ListingsPage> {
  const url = buildListingsUrl(filters);
  url.searchParams.set("limit", String(LISTINGS_PAGE_SIZE));
  if (pageParam) {
    url.searchParams.set("next_token", pageParam);
  }
  const res = await fetch(url, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new Error(`Failed to load listings: ${res.status}`);
  }
  const body: ListingsResponse = await res.json();
  return {
    offers: body.data.items.filter((l) => l.status === "active").map((l) => apiToOffer(l, locale)),
    nextToken: body.data.next_token ?? null,
    totalCount: body.data.count ?? body.data.items.length,
  };
}

// Total number of listings matching `filters`. The backend returns the full match
// `count` regardless of page size, so we request a single item to keep the payload
// minimal — this runs once per category/city candidate when building the sitemap
// and to decide whether an empty landing page should be noindexed.
export async function fetchListingsCount(locale: Locale, filters: ListingFilters = {}): Promise<number> {
  const url = buildListingsUrl(filters);
  url.searchParams.set("limit", "1");
  const res = await fetch(url, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new Error(`Failed to load listings count: ${res.status}`);
  }
  const body: ListingsResponse = await res.json();
  return body.data.count ?? body.data.items.length;
}

export function useListings(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "recommended" } = filters;
  return useQuery({
    queryKey: listingsKey(locale, { q, city, category, sort }),
    queryFn: () => fetchListings(locale, { q, city, category, sort }),
    placeholderData: keepPreviousData,
  });
}

// Feed hook: cursor-paginated browse with infinite scroll. keepPreviousData
// keeps the prior result set on screen while a filter change refetches page 1.
export function useListingsInfinite(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "recommended" } = filters;
  return useInfiniteQuery({
    queryKey: listingsInfiniteKey(locale, { q, city, category, sort }),
    queryFn: ({ pageParam }) => fetchListingsPage(locale, { q, city, category, sort }, pageParam),
    initialPageParam: LISTINGS_FIRST_CURSOR,
    getNextPageParam: (lastPage) => lastPage.nextToken,
    placeholderData: keepPreviousData,
  });
}

// Distinct error for a genuinely-missing listing (HTTP 404) so callers can branch:
// the server page renders a real 404 (notFound()), the client shows a "no longer
// available" state (not a retry), and React Query skips its retries. A transient
// 5xx/network failure stays a generic Error → the retryable error screen.
export class ListingNotFoundError extends Error {
  constructor(id: string) {
    super(`Listing not found: ${id}`);
    this.name = "ListingNotFoundError";
  }
}

// GET /listings/{id} — the core detail document. Throws ListingNotFoundError on a
// 404 (deleted/removed) and a generic Error on any other non-OK response, so the
// screen renders its error state; rating + reviews are layered on top from the two
// review endpoints. Same `next` options as the detail page's raw-metadata fetch so
// Next memoizes the same-URL server requests into one (ignored by browser fetch).
async function fetchListingDetailRaw(id: string): Promise<ApiListingDetail> {
  const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: LISTING_REVALIDATE } });
  // The backend answers 400 ("Invalid UUID format") for malformed ids — as terminal
  // as a 404, so both map to not-found: the server page can notFound() and the client
  // shows the "no longer available" state instead of burning retries on it.
  if (res.status === 404 || res.status === 400) {
    throw new ListingNotFoundError(id);
  }
  if (!res.ok) {
    throw new Error(`Failed to load listing ${id}: ${res.status}`);
  }
  const body: ListingDetailResponse = await res.json();
  return body.data;
}

export type ReviewStatsView = { ratingAverage: number | null; ratingCount: number; breakdown: RatingBucket[] };

// GET /listings/{id}/review-stats — listing-level rating average, count and per-star
// distribution. Resilient: a failure degrades to "no ratings" rather than failing the
// whole page. Exported so the detail page's SEO fetch reuses it (same URL + options →
// Next collapses the two server requests into one).
export async function fetchReviewStats(id: string): Promise<ReviewStatsView> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}/review-stats`, { next: { revalidate: LISTING_REVALIDATE } });
    if (!res.ok) {
      return { ratingAverage: null, ratingCount: 0, breakdown: [] };
    }
    const body: ReviewStatsResponse = await res.json();
    const s = body.data;
    return {
      ratingAverage: s.rating_average,
      ratingCount: s.rating_count,
      breakdown: s.rating_count > 0 ? distributionToBuckets(s.rating_distribution) : [],
    };
  } catch {
    return { ratingAverage: null, ratingCount: 0, breakdown: [] };
  }
}

// GET /listings/{id}/reviews — the latest few public reviews for the cards.
// Resilient like the stats fetch; dates are pre-formatted into the cached result.
async function fetchReviews(id: string, locale: Locale): Promise<ListingReview[]> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}/reviews?limit=3`, { next: { revalidate: LISTING_REVALIDATE } });
    if (!res.ok) {
      return [];
    }
    const body: PublicReviewsResponse = await res.json();
    return body.data.reviews.map((r) => ({
      name: r.reviewer_name,
      date: formatReviewDate(r.created_at, locale),
      stars: r.rating,
      text: r.comment,
      avatar: r.reviewer_photo_url ?? null,
    }));
  } catch {
    return [];
  }
}

// Summarize the delivery methods array into the flags the handover section needs.
function mapDelivery(methods: ApiDeliveryMethod[] | undefined): ListingDelivery {
  const list = methods ?? [];
  const userDelivery = list.find((m) => m.type === "user_delivery");
  return {
    pickup: list.some((m) => m.type === "pickup"),
    delivery: !!userDelivery,
    radiusKm: userDelivery?.delivery_radius_km ?? null,
  };
}

// Map the contract-optional detail owner to the host-card view model. Returns null
// when the listing has no owner block and no `owner_name` fallback — the screen then
// hides the host card entirely. Display name prefers the business name.
function mapDetailOwner(detail: ApiListingDetail, locale: Locale): ListingOwner | null {
  const o = detail.owner;
  if (!o) {
    if (!detail.owner_name) {
      return null;
    }
    return { name: detail.owner_name, verified: false, listingsCount: 0, ratingCount: 0, avatar: null };
  }
  const memberSinceMs = o.member_since ? new Date(o.member_since).getTime() : Number.NaN;
  return {
    id: o.id,
    name: o.business_name ?? o.name ?? detail.owner_name ?? "",
    verified: o.verified ?? false,
    listingsCount: o.total_listings ?? 0,
    rating: ratingLabel(o.rating_average ?? null, o.rating_count ?? 0, locale),
    ratingCount: o.rating_count ?? 0,
    avatar: o.avatar ?? null,
    memberSinceYear: Number.isNaN(memberSinceMs) ? undefined : new Date(memberSinceMs).getFullYear(),
    responseTimeHours: o.avg_response_time_hours ?? null,
  };
}

// R2-032 stopgap: the backend composes value_label_en from the raw LT unit word
// ("25 metai"); re-render the known LT unit vocabulary in English until the wire
// localizes units. Language-neutral units (km, l, kg, m…) pass through untouched,
// and nothing is fabricated — only the unit word is re-spelled.
const EN_UNIT_WORDS: Record<string, string> = { metai: "years" };
function localizeUnitEn(value: string, unit: string | undefined): string {
  if (!unit) {
    return value;
  }
  const en = EN_UNIT_WORDS[unit];
  if (!en || !value.endsWith(` ${unit}`)) {
    return value;
  }
  return value.slice(0, -unit.length) + en;
}

export async function fetchListing(id: string, locale: Locale): Promise<ListingDetail> {
  // The detail document plus its two review endpoints, fetched in parallel. Only
  // the detail fetch can reject (→ error screen); stats/reviews degrade gracefully.
  const [detail, stats, reviews] = await Promise.all([
    fetchListingDetailRaw(id),
    fetchReviewStats(id),
    fetchReviews(id, locale),
  ]);
  return {
    id: detail.id,
    title: detail.title,
    city: detail.city ?? "",
    price: formatPrice(detail.price_per_day_cents, locale),
    priceCents: detail.price_per_day_cents,
    deposit: formatDeposit(detail.deposit_amount_cents, locale),
    minDays: detail.minimum_rental_days ?? 1,
    maxDays: detail.maximum_rental_days ?? 0,
    cancellation: detail.cancellation_policy ?? "",
    // Real wire data only: the boolean mirrors the insurance_included display
    // attribute (canonical LT value label). The spec-table row stays; the terms
    // tile is additive emphasis for a top-3 vehicle-rental trust signal.
    insuranceIncluded: (detail.attributes_display ?? []).some(
      (a) => a.id === "insurance_included" && !a.orphan && a.value_label_lt === "Taip",
    ),
    categoryId: detail.category_path?.[0],
    delivery: mapDelivery(detail.delivery_methods),
    description: detail.description,
    rating: ratingLabel(stats.ratingAverage, stats.ratingCount, locale),
    ratingValue: stats.ratingAverage ?? 0,
    ratingCount: stats.ratingCount,
    images: (detail.images ?? []).map((im) => im.url),
    tags: detail.category_names.map((c) => (locale === "en" ? c.en : c.lt)),
    attributes: (detail.attributes_display ?? [])
      .filter((a) => !a.orphan)
      .map((a) => {
        const raw = (locale === "en" ? a.value_label_en : a.value_label_lt) ?? "";
        return {
          id: a.id,
          label: locale === "en" ? a.name_en : a.name_lt,
          value: locale === "en" ? localizeUnitEn(raw, a.unit) : raw,
        };
      })
      .filter((a) => a.value),
    owner: mapDetailOwner(detail, locale),
    reviews,
    ratingBreakdown: stats.breakdown,
  };
}

export function useListing(id: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: listingKey(id, locale),
    // skipToken keeps the query idle until an id exists — no `as` cast, no `enabled` flag.
    queryFn: id ? () => fetchListing(id, locale) : skipToken,
    // A 404 is terminal — don't burn retries on a listing that's gone; keep the
    // default two retries for transient (5xx/network) failures.
    retry: (count, error) => !(error instanceof ListingNotFoundError) && count < 2,
  });
}
