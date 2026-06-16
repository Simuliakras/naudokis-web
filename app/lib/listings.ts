// Listing data layer — browse listings + single-listing detail from the Naudokis backend.
import { useQuery, useInfiniteQuery, keepPreviousData, skipToken } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";
import { API_BASE, USE_MOCK } from "./api";
import { MOCK_LISTINGS, MOCK_CATEGORIES, MOCK_DETAIL_EXTRA, type MockListing } from "./mock-data";

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

type ApiOwner = {
  id: string;
  name: string;
  is_business: boolean;
  verified: boolean;
  completed_rentals: number;
  rating_average: number | null;
  rating_count: number;
  avatar: string | null;
};

type ApiListingDetail = ApiListing & {
  description: string;
  category_names: ApiCategoryName[];
  attributes_display: ApiAttributeDisplay[];
  owner: ApiOwner;
};

type ListingDetailResponse = { success: boolean; data: ApiListingDetail };

/* ---------------- View models ---------------- */
export type Offer = {
  id: string;
  title: string;
  city: string;
  price: string;
  img?: string;
  rating?: string; // formatted value, present only when ratingCount > 0
  ratingCount: number; // raw count, for building the localized review label
  hasDelivery: boolean; // derived client-side from delivery_types_available — see note in fetchListings
  category?: string; // top-level category id — tints the empty-photo placeholder (optional on the wire)
};

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

export type ListingReview = { name: string; date: string; stars: number; text: string };
export type RatingBucket = { stars: number; count: number };

export type ListingOwner = {
  name: string;
  isBusiness: boolean;
  verified: boolean;
  completedRentals: number;
  rating?: string;
  ratingCount: number;
  avatar: string | null;
};

export type ListingDetail = {
  id: string;
  title: string;
  city: string;
  price: string;
  priceCents: number; // raw per-day price, for the booking-panel breakdown math
  description: string;
  rating?: string; // localized display string ("4,9" / "4.9")
  ratingValue: number; // raw numeric average, for star rendering / math
  ratingCount: number;
  images: string[];
  tags: string[];
  attributes: ListingAttribute[];
  owner: ListingOwner;
  reviews: ListingReview[];
  ratingBreakdown: RatingBucket[]; // [5★…1★] counts; empty when no reviews
};

// Plausible, deterministic star distribution for a given total review count
// (used only for the mock detail; the real backend doesn't expose this yet).
function mockRatingBreakdown(n: number): RatingBucket[] {
  const five = Math.round(n * 0.8);
  const four = Math.round(n * 0.13);
  const three = Math.round(n * 0.05);
  const two = Math.round(n * 0.01);
  const one = Math.max(0, n - five - four - three - two);
  return [
    { stars: 5, count: five }, { stars: 4, count: four }, { stars: 3, count: three },
    { stars: 2, count: two }, { stars: 1, count: one },
  ];
}

/* ---------------- Formatting ---------------- */
// Cents → localized price string, matching the sample format ("15 €" / "€15").
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

// Exported so server components can prefetch the same data the hooks consume
// (identical queryKey + queryFn → the cache hydrates without a client refetch).
// Map a mock fixture to the Offer view model (mirrors the real fetcher's shape).
function mockToOffer(l: MockListing, locale: Locale): Offer {
  return {
    id: l.id,
    title: locale === "en" ? l.title_en : l.title_lt,
    city: l.city,
    price: formatPrice(l.price_per_day_cents, locale),
    img: undefined, // mirror the design's gray image placeholders
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
    ratingCount: l.rating_count,
    hasDelivery: l.hasDelivery,
    category: l.category,
  };
}

// Apply the mock filters/sort once, shared by the single-page and paginated
// mock fetchers so they stay consistent.
function filterMockListings(locale: Locale, filters: ListingFilters): MockListing[] {
  let items = MOCK_LISTINGS.slice();
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    items = items.filter((l) =>
      (locale === "en" ? l.title_en : l.title_lt).toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
  }
  if (filters.city) {
    items = items.filter((l) => l.city === filters.city);
  }
  if (filters.category) {
    items = items.filter((l) => l.category === filters.category);
  }
  if (filters.sort === "price_asc") {
    items.sort((a, b) => a.price_per_day_cents - b.price_per_day_cents);
  } else if (filters.sort === "price_desc") {
    items.sort((a, b) => b.price_per_day_cents - a.price_per_day_cents);
  } else if (filters.sort === "rating_desc") {
    items.sort((a, b) => b.rating_average - a.rating_average);
  }
  return items;
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
    city: l.city ?? "",
    price: formatPrice(l.price_per_day_cents, locale),
    img: l.images?.[0]?.url,
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
    ratingCount: l.rating_count,
    // Backend has no `delivery=` filter; it exposes the per-item delivery types
    // instead, so the "Su pristatymu" toggle filters the loaded results client-side.
    hasDelivery: (l.delivery_types_available ?? []).includes("user_delivery"),
    // The wire's `category` field is a leaf id (e.g. "cars"); the accent and
    // icon maps key on the top-level id, which leads category_path.
    category: l.category_path?.[0],
  };
}

export async function fetchListings(locale: Locale, filters: ListingFilters): Promise<Offer[]> {
  if (USE_MOCK) {
    return filterMockListings(locale, filters).map((l) => mockToOffer(l, locale));
  }
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
export type ListingsPage = { offers: Offer[]; nextToken: string | null };

// Cursor-paginated browse fetch backing the feed's infinite scroll. The mock
// layer paginates by numeric offset; the backend uses an opaque `next_token`.
export async function fetchListingsPage(
  locale: Locale, filters: ListingFilters, pageParam: string | null,
): Promise<ListingsPage> {
  if (USE_MOCK) {
    const all = filterMockListings(locale, filters).map((l) => mockToOffer(l, locale));
    const start = pageParam ? Number(pageParam) : 0;
    const offers = all.slice(start, start + LISTINGS_PAGE_SIZE);
    const next = start + LISTINGS_PAGE_SIZE;
    return { offers, nextToken: next < all.length ? String(next) : null };
  }
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
  };
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

export async function fetchListing(id: string, locale: Locale): Promise<ListingDetail> {
  if (USE_MOCK) {
    const l = MOCK_LISTINGS.find((x) => x.id === id) ?? MOCK_LISTINGS[0];
    const e = MOCK_DETAIL_EXTRA;
    const cat = MOCK_CATEGORIES.find((c) => c.id === l.category);
    return {
      id: l.id,
      title: locale === "en" ? l.title_en : l.title_lt,
      city: l.city,
      price: formatPrice(l.price_per_day_cents, locale),
      priceCents: l.price_per_day_cents,
      description: locale === "en" ? e.description_en : e.description_lt,
      rating: ratingLabel(l.rating_average, l.rating_count, locale),
      ratingValue: l.rating_average,
      ratingCount: l.rating_count,
      images: [],
      tags: cat ? [locale === "en" ? cat.name_en : cat.name_lt] : [],
      attributes: e.attributes.map((a) => ({
        id: a.id,
        label: locale === "en" ? a.name_en : a.name_lt,
        value: locale === "en" ? a.value_en : a.value_lt,
      })),
      owner: {
        name: e.owner.name,
        isBusiness: e.owner.is_business,
        verified: e.owner.verified,
        completedRentals: e.owner.completed_rentals,
        rating: ratingLabel(e.owner.rating_average, e.owner.rating_count, locale),
        ratingCount: e.owner.rating_count,
        avatar: null,
      },
      reviews: e.reviews.map((r) => ({
        name: r.name,
        date: locale === "en" ? r.date_en : r.date_lt,
        stars: r.stars,
        text: locale === "en" ? r.text_en : r.text_lt,
      })),
      ratingBreakdown: l.rating_count > 0 ? mockRatingBreakdown(l.rating_count) : [],
    };
  }
  // Same `next` options as the detail page's raw-metadata fetch so Next memoizes
  // the two same-URL server requests into one (ignored by the browser fetch).
  const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: LISTING_REVALIDATE } });
  if (!res.ok) {
    throw new Error(`Failed to load listing ${id}: ${res.status}`);
  }
  const body: ListingDetailResponse = await res.json();
  const l = body.data;
  return {
    id: l.id,
    title: l.title,
    city: l.city ?? "",
    price: formatPrice(l.price_per_day_cents, locale),
    priceCents: l.price_per_day_cents,
    description: l.description,
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
    ratingValue: l.rating_average ?? 0,
    ratingCount: l.rating_count,
    images: l.images.map((im) => im.url),
    tags: l.category_names.map((c) => (locale === "en" ? c.en : c.lt)),
    attributes: l.attributes_display
      .filter((a) => !a.orphan)
      .map((a) => ({
        id: a.id,
        label: locale === "en" ? a.name_en : a.name_lt,
        value: (locale === "en" ? a.value_label_en : a.value_label_lt) ?? "",
      }))
      .filter((a) => a.value),
    owner: {
      name: l.owner.name,
      isBusiness: l.owner.is_business,
      verified: l.owner.verified,
      completedRentals: l.owner.completed_rentals,
      rating: ratingLabel(l.owner.rating_average, l.owner.rating_count, locale),
      ratingCount: l.owner.rating_count,
      avatar: l.owner.avatar,
    },
    // The public backend doesn't expose individual reviews on the web yet.
    reviews: [],
    ratingBreakdown: [],
  };
}

export function useListing(id: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: listingKey(id, locale),
    // skipToken keeps the query idle until an id exists — no `as` cast, no `enabled` flag.
    queryFn: id ? () => fetchListing(id, locale) : skipToken,
  });
}
