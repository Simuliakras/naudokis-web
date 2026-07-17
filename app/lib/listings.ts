// Listing data layer — browse listings + single-listing detail from the Naudokis backend.
import { useQuery, useInfiniteQuery, keepPreviousData, skipToken } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";
import { API_BASE, MarketplaceApiError, marketplaceFetch } from "./api";
import { cdnImage } from "./image-hosts";
import {
  cancellationTier,
  formatPrice,
  ownerInitials,
  type CancellationTier,
  type Discount,
  type Offer,
  type OfferOwner,
} from "./listing-view";
import { isSyntheticListing, isSyntheticListingParam } from "./listing-url";
import type { IsoDate } from "./dates";

/* ---------------- Backend shapes ---------------- */
type ApiImage = { url: string; blurhash?: string };
type ApiCategoryName = { lt: string; en: string };
type ApiDiscountTier = { discount_percent: number; min_days: number };

type ApiListing = {
  id: string;
  title: string;
  city: string | null;
  subdivision?: string | null; // district/neighbourhood within the city (e.g. "Žvėrynas")
  price_per_day_cents: number;
  rating_average: number | null;
  rating_count: number;
  status: string;
  images: ApiImage[];
  delivery_types_available?: string[];
  discount_tiers?: ApiDiscountTier[]; // longer-rental price breaks, e.g. [{ discount_percent: 20, min_days: 7 }]
  discount_enabled?: boolean; // owner's master switch — tiers may be present but inactive
  category_path?: string[]; // [top-level id, ...subcategories] — not guaranteed on browse items
  owner_id?: string; // groups a lister's items client-side (backend has no owner_id filter yet)
  deposit_amount_cents?: number | null; // refundable deposit; null/0 both mean "this listing takes none"
  // Owner summary embedded on the browse item. Contract-optional: the wire carries no
  // owner block yet, so until it does this is undefined and the card renders no owner
  // row. Typed with the SAME ApiOwner as the detail block — the browse summary is a
  // strict subset of it (every field there is optional), so there is one owner shape
  // rather than two that drift.
  owner?: ApiOwner;
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

// Owner block on the detail endpoint, and (once the backend embeds it) the owner
// summary on each browse item. Per the backend `ListingOwner` contract every field
// is optional, which is exactly why one type can model both: the browse summary is a
// strict subset of the detail block.
// Exported so the server-side metadata read (listing-seo.ts) models the owner
// block with the SAME type rather than a parallel hand-copy — the two had already
// drifted on whether `name` is optional.
export type ApiOwner = {
  id?: string;
  // Contract-optional on the wire: mapDetailOwner falls back to owner_name.
  name?: string;
  business_name?: string | null;
  is_business?: boolean;
  verified?: boolean; // === the profile endpoint's identity_verified (NOT badges.verified, which disagrees)
  rating_average?: number;
  rating_count?: number;
  total_listings?: number;
  completed_rentals?: number; // finished rentals — on the detail owner today; nothing renders it yet
  avatar?: string;
  initials?: string; // "GB" — the browse card's avatar fallback; derived from the name when absent
  member_since?: string; // ISO date — host-card tenure line, rendered only when present
  avg_response_time_hours?: number | null;
};

// A delivery option on the listing. Only the fields the handover section reads are
// modelled; `type` is "pickup" | "user_delivery" on the wire.
type ApiDeliveryMethod = {
  type: string;
  delivery_radius_km?: number;
  price_per_km_cents?: number; // user_delivery only; absent → price by arrangement
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
  subdivision?: string | null; // district/neighbourhood within the city (e.g. "Žvėrynas")
  price_per_day_cents: number;
  deposit_amount_cents?: number | null;
  minimum_rental_days?: number;
  maximum_rental_days?: number;
  cancellation_policy?: string;
  // The detail document carries these too — they were only ever modelled on the
  // browse item because nothing on this page needed them until the date picker.
  discount_tiers?: ApiDiscountTier[];
  discount_enabled?: boolean;
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

/* ---------------- The fetch boundary ----------------
   Lives in api.ts (the dependency-free base) so availability.ts can share it without
   importing this whole module. Re-exported here because this file is the established
   import site for everything listings-shaped, and the existing callers should not have
   to care that the wrapper moved. */
export { MarketplaceApiError, marketplaceFetch, marketplaceErrorKind } from "./api";
export type { MarketplaceErrorKind } from "./api";

/* ---------------- View models ----------------
   The Offer/Discount shapes and the pure formatters live in listing-view.ts, which
   imports no react-query — so a card can render a listing without pulling the query
   runtime into its bundle. Re-exported here so this module stays the one import site
   for anything that also needs the fetchers or hooks. */
export { formatPrice, formatLocation, photoFirst, ownerInitials } from "./listing-view";
export type { Offer, Discount, OfferOwner } from "./listing-view";

/* ---------------- Filters ---------------- */
// These values mirror the public catalogue API. The default is explicitly
// newest-first; calling it "recommended" previously implied a relevance model
// that the API did not implement.
export type SortKey = "newest" | "price_asc" | "price_desc" | "rating_desc";

// Narrow an untrusted value (e.g. a `?sort=` query param) to a valid SortKey,
// falling back to the backend default. Type-safe — no `as` cast needed.
export function parseSortKey(value: string | null | undefined): SortKey {
  if (value === "price_asc" || value === "price_desc" || value === "rating_desc") {
    return value;
  }
  // Preserve old shared URLs while presenting and executing the truthful sort.
  return "newest";
}

// Hard ceiling on ?page=N. Because the backend paginates by opaque cursor,
// reaching page N means walking N-1 cursors server-side (see fetchListingsPage),
// so an unbounded `?page=` would let a crawler chain arbitrarily many fetches.
// The pager stops offering deeper pages well before this; the cap is a safety net.
export const LISTINGS_MAX_PAGE = 20;

// Narrow an untrusted `?page=` value to a positive integer in [1, LISTINGS_MAX_PAGE].
// Single source of truth shared by the feed, the /skelbimai page and landing pages.
export function parsePageParam(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n <= 1) {
    return 1;
  }
  return Math.min(n, LISTINGS_MAX_PAGE);
}

export type ListingFilters = {
  q?: string;
  city?: string;
  category?: string; // category id == backend category_id (also the URL slug)
  sort?: SortKey;
  priceMinCents?: number;
  priceMaxCents?: number;
  deliveryMethods?: Array<"pickup" | "parcel_terminal" | "courier_delivery" | "user_delivery">;
  // Inclusive availability window (the feed's date filter). Emitted as
  // available_from/available_to, both or neither (the backend contract 400s a lone
  // bound), and capped at 60 days — see app/lib/date-filter.ts.
  availableFrom?: IsoDate;
  availableTo?: IsoDate;
  // Deposit filter — see app/lib/deposit-filter.ts. depositRequired is tri-state:
  // undefined means "don't care", never default it to false ("no deposit only").
  // A ceiling deliberately admits no-deposit listings, so the two are never sent
  // together (deposit_required=true would silently drop them).
  depositMaxCents?: number;
  depositRequired?: boolean;
  // SEO-friendly paginated result pages. The backend uses opaque cursors, so this
  // is translated by walking cursors server/client-side when page > 1.
  page?: number;
};

export type ListingAttribute = { id: string; label: string; value: string };

export type ListingReview = { name: string; date: string; stars: number; text: string; avatar: string | null };
export type RatingBucket = { stars: number; count: number };

// Summarized delivery options for the handover section.
export type ListingDelivery = {
  pickup: boolean;
  delivery: boolean;
  radiusKm: number | null;
  pricePerKm: string | null; // formatted ("1 €" / "€1"); null when the owner prices it by arrangement
};

export type ListingOwner = {
  id?: string; // wire owner id — keys the "more from this owner" rail (names aren't unique)
  name: string;
  verified: boolean;
  // null when the wire carries no is_business flag — the pill is then not rendered
  // at all rather than asserting one of the two labels.
  isBusiness: boolean | null;
  listingsCount: number; // owner.total_listings — host-card "listings" stat
  rating?: string;
  ratingCount: number;
  avatar: string | null;
  memberSince?: string; // localized "month year" from member_since — tenure trust line, only when on the wire
  responseTimeHours?: number | null; // from avg_response_time_hours — only when non-null
};

export type ListingDetail = {
  id: string;
  title: string;
  city: string;
  subdivision?: string; // district within the city, appended to the location line when present
  price: string;
  priceCents: number; // raw per-day price, for the booking-panel breakdown math
  deposit: string | null; // formatted refundable deposit; null when the listing takes none
  depositCents: number; // raw deposit (0 when none) — the rental estimate needs cents
  // The owner's ACTIVE price breaks (empty when discounts are switched off — the
  // master switch is already applied, see discountTiers()). The date picker applies
  // the tier a chosen length actually qualifies for, which is not necessarily the
  // deepest one the card advertises.
  discountTiers: Discount[];
  minDays: number;
  // 0 means "no ceiling on the wire" — treat it as unset, never as "zero days".
  maxDays: number;
  cancellation: CancellationTier; // absent/unknown on the wire already normalized to "moderate"
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

/* ---------------- Formatting ----------------
   formatPrice ("15 €" / "€15") and formatLocation ("Vilnius, Žvėrynas") live in
   listing-view.ts and are re-exported above. */
export function formatRating(average: number, locale: Locale): string {
  return average.toFixed(1).replace(".", locale === "lt" ? "," : ".");
}

// The owner's active price breaks, in view-model form.
//
// This is the ONE place `discount_enabled` is read — the master switch is applied
// here so it cannot escape the module, and no downstream caller can forget it and
// quote a price the booking flow won't honour. Everything past this point may assume
// every tier it holds is live.
function discountTiers(l: Pick<ApiListing, "discount_tiers" | "discount_enabled">): Discount[] {
  if (!l.discount_enabled) {
    return [];
  }
  return (l.discount_tiers ?? [])
    .filter((t) => t.discount_percent > 0)
    .map((t) => ({ percent: t.discount_percent, minDays: t.min_days }));
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
  const { q = "", city = "", category = "", sort = "newest", page = 1,
    priceMinCents = "", priceMaxCents = "", deliveryMethods = [], availableFrom = "", availableTo = "",
    depositMaxCents = "", depositRequired = "" } = filters;
  return ["listings", locale, q, city, category, sort, priceMinCents, priceMaxCents, deliveryMethods.join(","), availableFrom, availableTo, depositMaxCents, depositRequired, page] as const;
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
  const { q = "", city = "", category = "", sort = "newest", page = 1,
    priceMinCents = "", priceMaxCents = "", deliveryMethods = [], availableFrom = "", availableTo = "",
    depositMaxCents = "", depositRequired = "" } = filters;
  return ["listings-infinite", locale, q, city, category, sort, priceMinCents, priceMaxCents, deliveryMethods.join(","), availableFrom, availableTo, depositMaxCents, depositRequired, page] as const;
}

// Build the backend `/listings` query URL from the active filters. `limit` /
// `next_token` (cursor) are appended by the paginated fetcher when present.
// Exported for the same reason listingsKey is: it encodes a wire contract that must be
// pinnable by a test (see listing-filters.test.ts), not just read.
export function buildListingsUrl(filters: ListingFilters): URL {
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
  url.searchParams.set("sort", filters.sort === "newest" || !filters.sort ? "created_at_desc" : filters.sort);
  if (filters.priceMinCents !== undefined) {
    url.searchParams.set("price_min_cents", String(filters.priceMinCents));
  }
  if (filters.priceMaxCents !== undefined) {
    url.searchParams.set("price_max_cents", String(filters.priceMaxCents));
  }
  for (const method of filters.deliveryMethods ?? []) {
    url.searchParams.append("delivery_methods", method);
  }
  // Both or neither — a lone bound is a 400 under the documented backend contract.
  if (filters.availableFrom && filters.availableTo) {
    url.searchParams.set("available_from", filters.availableFrom);
    url.searchParams.set("available_to", filters.availableTo);
  }
  // A ceiling admits no-deposit listings on the backend, so it is never paired
  // with deposit_required — see the ListingFilters comment.
  if (filters.depositMaxCents !== undefined) {
    url.searchParams.set("deposit_max_cents", String(filters.depositMaxCents));
  }
  if (filters.depositRequired !== undefined) {
    url.searchParams.set("deposit_required", String(filters.depositRequired));
  }
  return url;
}

// The browse item's embedded owner summary → the card's owner row. Returns undefined
// when the wire carries no owner block (today's backend) or no usable name, so the
// card degrades to exactly what it renders now. Display name prefers the business
// name — the same rule mapDetailOwner applies.
function mapOfferOwner(l: ApiListing): OfferOwner | undefined {
  const o = l.owner;
  if (!o) {
    return undefined;
  }
  const name = o.business_name ?? o.name;
  if (!name) {
    return undefined; // an owner row with no name is nothing to render
  }
  return {
    id: o.id ?? l.owner_id,
    name,
    // The wire's initials win; derive from the name only as a fallback (an empty
    // string on the wire is "no value", not a value).
    initials: o.initials || ownerInitials(name),
    avatar: cdnImage(o.avatar),
    // null, NOT false — see OfferOwner. This deliberately differs from
    // ListingOwner.verified, which coerces to false because the detail page renders a
    // pill off it; the card renders nothing off this, so keep the honest tri-state.
    verified: o.verified ?? null,
  };
}

// Map a backend browse item to the Offer view model.
function apiToOffer(l: ApiListing, locale: Locale): Offer {
  return {
    id: l.id,
    title: l.title,
    city: l.city ?? undefined,
    subdivision: l.subdivision ?? undefined,
    price: formatPrice(l.price_per_day_cents, locale),
    priceCents: l.price_per_day_cents,
    img: cdnImage(l.images?.[0]?.url),
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
    ratingCount: l.rating_count,
    // Kept for the card badge; catalogue filtering itself is performed by the API.
    hasDelivery: (l.delivery_types_available ?? []).includes("user_delivery"),
    photoCount: l.images?.length ?? 0,
    // The wire's `category` field is a leaf id (e.g. "cars"); the accent and
    // icon maps key on the top-level id, which leads category_path.
    category: l.category_path?.[0],
    ownerId: l.owner_id,
    // Same formatter as the detail fact card, so the two can never show a different
    // number for the same listing — and neither can ever render "0 €".
    deposit: formatDeposit(l.deposit_amount_cents, locale) ?? undefined,
    owner: mapOfferOwner(l),
  };
}

// Keep this defensive web boundary even after the API dataset is cleaned, so an
// accidentally seeded E2E record cannot reach cards, metadata, sitemaps or the
// image optimizer again. isSyntheticListing() is shared with the detail route and
// the sitemap — one definition, so a record can't be hidden here and public there.
function isPublicListing(l: Pick<ApiListing, "id" | "title" | "images">): boolean {
  return !isSyntheticListing({ id: l.id, title: l.title, imageUrls: l.images.map((image) => image.url) });
}

function publicListingItems(items: ApiListing[]): ApiListing[] {
  return items.filter((listing) => listing.status === "active" && isPublicListing(listing));
}

export async function fetchListings(locale: Locale, filters: ListingFilters): Promise<Offer[]> {
  const url = buildListingsUrl(filters);
  // Server-side (home/feed prefetch) the browse data stays fresh for the same
  // window as a single listing, and the route-level `revalidate = 300` on the
  // home page can regenerate with fresh data. Browser fetches ignore `next`.
  const res = await marketplaceFetch(url, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new MarketplaceApiError("server", res.status);
  }
  const body: ListingsResponse = await res.json();
  return publicListingItems(body.data.items).map((l) => apiToOffer(l, locale));
}

// One page of browse results plus the cursor for the next page (null at the end).
export type ListingsPage = { offers: Offer[]; nextToken: string | null };

// Cursor-paginated browse fetch backing the feed's infinite scroll. The backend
// uses an opaque `next_token` cursor.
export async function fetchListingsPage(
  locale: Locale, filters: ListingFilters, pageParam: string | null,
): Promise<ListingsPage> {
  const url = buildListingsUrl(filters);
  url.searchParams.set("limit", String(LISTINGS_PAGE_SIZE));
  let token = pageParam;
  // Clamped so the cursor walk below can never exceed LISTINGS_MAX_PAGE-1 fetches,
  // regardless of what a caller passes in filters.page.
  const targetPage = parsePageParam(filters.page);

  // `pageParam === null` is the first page for this React Query result set. If
  // the URL asks for ?page=N, walk backend cursors to N before fetching the
  // visible page. Later infinite-scroll appends use the opaque nextToken directly.
  if (!token && targetPage > 1) {
    for (let current = 1; current < targetPage; current++) {
      const cursorUrl = buildListingsUrl(filters);
      cursorUrl.searchParams.set("limit", String(LISTINGS_PAGE_SIZE));
      if (token) {
        cursorUrl.searchParams.set("next_token", token);
      }
      const cursorRes = await marketplaceFetch(cursorUrl, { next: { revalidate: LISTING_REVALIDATE } });
      if (!cursorRes.ok) {
        throw new MarketplaceApiError("server", cursorRes.status);
      }
      const cursorBody: ListingsResponse = await cursorRes.json();
      token = cursorBody.data.next_token ?? null;
      if (!cursorBody.data.has_more || !token) {
        return {
          offers: [],
          nextToken: null,
        };
      }
    }
  }
  if (token) {
    url.searchParams.set("next_token", token);
  }
  const res = await marketplaceFetch(url, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new MarketplaceApiError("server", res.status);
  }
  const body: ListingsResponse = await res.json();
  const visibleItems = publicListingItems(body.data.items);
  return {
    offers: visibleItems.map((l) => apiToOffer(l, locale)),
    nextToken: body.data.next_token ?? null,
  };
}

const COUNT_PAGE_SIZE = 100;

// Count public matching listings by following backend cursors. The API's `count`
// is the size of the current page, not a global total. We only need enough to
// validate the SEO pager's supported 20-page window, so cap work at that window.
//
// `stopAt` short-circuits the cursor walk as soon as that many are known to exist.
// Most callers only ask a threshold question ("are there at least N?") and would
// otherwise page all the way to the 240 cap to answer it — which the sitemap does
// once per landing candidate, on every hourly regeneration.
type ListingCountOptions = {
  stopAt?: number;
  // Some callers (notably sitemap generation) have a deliberately longer cache
  // horizon than user-facing listing pages. Keeping the TTL explicit here avoids
  // a 5-minute data fetch silently lowering an otherwise hourly route revalidate.
  revalidate?: number;
};

export function listingsNeededForPage(page: number, minimum = 1): number {
  const normalizedPage = parsePageParam(page);
  return Math.max(minimum, (normalizedPage - 1) * LISTINGS_PAGE_SIZE + 1);
}

export async function fetchListingsCount(
  filters: ListingFilters = {},
  { stopAt, revalidate = LISTING_REVALIDATE }: ListingCountOptions = {},
): Promise<number> {
  const cap = Math.min(stopAt ?? Infinity, LISTINGS_MAX_PAGE * LISTINGS_PAGE_SIZE);
  let count = 0;
  let token: string | null = null;
  do {
    const url = buildListingsUrl(filters);
    // Threshold callers usually need only 1 or 5 records, so don't ask for 100 —
    // metadata and every sitemap landing check would transfer and parse far more
    // than the decision requires.
    //
    // But never size the request by `cap - count` alone: `count` advances only for
    // rows that survive publicListingItems, while the cursor advances by RAW rows.
    // A leading run of non-public rows would then pin the limit at 1 and turn one
    // request into one request PER ROW, each with its own 10s timeout. The floor
    // keeps a filtered page cheap to skip past.
    const limit = Math.min(COUNT_PAGE_SIZE, Math.max(cap - count, LISTINGS_PAGE_SIZE));
    url.searchParams.set("limit", String(limit));
    if (token) url.searchParams.set("next_token", token);
    const res = await marketplaceFetch(url, { next: { revalidate } });
    if (!res.ok) throw new MarketplaceApiError("server", res.status);
    const body: ListingsResponse = await res.json();
    count += publicListingItems(body.data.items).length;
    token = body.data.has_more ? (body.data.next_token ?? null) : null;
  } while (token && count < cap);
  return Math.min(count, cap);
}

export function useListings(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "newest", page = 1,
    priceMinCents, priceMaxCents, deliveryMethods, availableFrom, availableTo, depositMaxCents, depositRequired } = filters;
  const normalized = { q, city, category, sort, page, priceMinCents, priceMaxCents, deliveryMethods, availableFrom, availableTo, depositMaxCents, depositRequired };
  return useQuery({
    queryKey: listingsKey(locale, normalized),
    queryFn: () => fetchListings(locale, normalized),
    placeholderData: keepPreviousData,
  });
}

// Feed hook: cursor-paginated browse with infinite scroll. keepPreviousData
// keeps the prior result set on screen while a filter change refetches page 1.
export function useListingsInfinite(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "newest", page = 1,
    priceMinCents, priceMaxCents, deliveryMethods, availableFrom, availableTo, depositMaxCents, depositRequired } = filters;
  const normalized = { q, city, category, sort, page, priceMinCents, priceMaxCents, deliveryMethods, availableFrom, availableTo, depositMaxCents, depositRequired };
  return useInfiniteQuery({
    queryKey: listingsInfiniteKey(locale, normalized),
    queryFn: ({ pageParam }) => fetchListingsPage(locale, normalized, pageParam),
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
  const res = await marketplaceFetch(`${API_BASE}/listings/${id}`, { next: { revalidate: LISTING_REVALIDATE } });
  // The backend answers 400 ("Invalid UUID format") for malformed ids — as terminal
  // as a 404, so both map to not-found: the server page can notFound() and the client
  // shows the "no longer available" state instead of burning retries on it.
  if (res.status === 404 || res.status === 400) {
    throw new ListingNotFoundError(id);
  }
  if (!res.ok) {
    throw new MarketplaceApiError("server", res.status);
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
    const res = await marketplaceFetch(`${API_BASE}/listings/${id}/review-stats`, { next: { revalidate: LISTING_REVALIDATE } });
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
    const res = await marketplaceFetch(`${API_BASE}/listings/${id}/reviews?limit=3`, { next: { revalidate: LISTING_REVALIDATE } });
    if (!res.ok) {
      return [];
    }
    const body: PublicReviewsResponse = await res.json();
    return body.data.reviews.map((r) => ({
      name: r.reviewer_name,
      date: formatReviewDate(r.created_at, locale),
      stars: r.rating,
      text: r.comment,
      avatar: cdnImage(r.reviewer_photo_url) ?? null,
    }));
  } catch {
    return [];
  }
}

// Summarize the delivery methods array into the flags the handover section needs.
function mapDelivery(methods: ApiDeliveryMethod[] | undefined, locale: Locale): ListingDelivery {
  const list = methods ?? [];
  const userDelivery = list.find((m) => m.type === "user_delivery");
  const perKmCents = userDelivery?.price_per_km_cents;
  return {
    pickup: list.some((m) => m.type === "pickup"),
    delivery: !!userDelivery,
    radiusKm: userDelivery?.delivery_radius_km ?? null,
    pricePerKm: perKmCents ? formatPrice(perKmCents, locale) : null,
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
    return { name: detail.owner_name, verified: false, isBusiness: null, listingsCount: 0, ratingCount: 0, avatar: null };
  }
  return {
    id: o.id,
    name: o.business_name ?? o.name ?? detail.owner_name ?? "",
    verified: o.verified ?? false,
    // null, NOT false: "the wire didn't say" is not the same claim as "this is a
    // private individual". Keep the distinction for any future owner-type UI.
    isBusiness: o.is_business ?? null,
    listingsCount: o.total_listings ?? 0,
    rating: ratingLabel(o.rating_average ?? null, o.rating_count ?? 0, locale),
    ratingCount: o.rating_count ?? 0,
    avatar: cdnImage(o.avatar) ?? null,
    memberSince: o.member_since ? formatMemberSince(o.member_since, locale) : undefined,
    responseTimeHours: o.avg_response_time_hours ?? null,
  };
}

// Lithuanian genitive month names — the grammatically correct form after "nuo"
// ("Narys nuo 2026 m. birželio"); Intl's LT month is nominative ("birželis").
const LT_GENITIVE_MONTHS = [
  "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
  "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio",
];

// Localized "month year" tenure label. Returns "" for an unparseable date so the
// caller can drop the line rather than render a broken string. Read in UTC — a
// date-only member_since parses as UTC midnight, so local getters could roll it
// back a month for viewers behind UTC.
function formatMemberSince(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  if (locale === "lt") {
    return `${date.getUTCFullYear()} m. ${LT_GENITIVE_MONTHS[date.getUTCMonth()]}`;
  }
  return date.toLocaleDateString(locale, { year: "numeric", month: "long", timeZone: "UTC" });
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
  // Same predicate the feed, the route and the sitemap use — so a record can't be
  // rejected by generateMetadata yet still render through the client hook.
  if (isSyntheticListingParam(id)) {
    throw new ListingNotFoundError(id);
  }
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
    subdivision: detail.subdivision ?? undefined,
    price: formatPrice(detail.price_per_day_cents, locale),
    priceCents: detail.price_per_day_cents,
    deposit: formatDeposit(detail.deposit_amount_cents, locale),
    depositCents: detail.deposit_amount_cents ?? 0,
    discountTiers: discountTiers(detail),
    minDays: detail.minimum_rental_days ?? 1,
    maxDays: detail.maximum_rental_days ?? 0,
    cancellation: cancellationTier(detail.cancellation_policy),
    categoryId: detail.category_path?.[0],
    delivery: mapDelivery(detail.delivery_methods, locale),
    description: detail.description,
    rating: ratingLabel(stats.ratingAverage, stats.ratingCount, locale),
    ratingValue: stats.ratingAverage ?? 0,
    ratingCount: stats.ratingCount,
    images: (detail.images ?? [])
      .map((im) => cdnImage(im.url))
      .filter((url): url is string => !!url),
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
