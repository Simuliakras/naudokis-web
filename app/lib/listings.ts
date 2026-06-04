// Listing data layer — browse listings + single-listing detail from the Naudokis backend.
import { useQuery, keepPreviousData, skipToken } from "@tanstack/react-query";
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
};

type ListingsResponse = {
  success: boolean;
  data: { items: ApiListing[]; count: number; has_more: boolean };
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
  description: string;
  rating?: string;
  ratingCount: number;
  images: string[];
  tags: string[];
  attributes: ListingAttribute[];
  owner: ListingOwner;
};

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
async function fetchListings(locale: Locale, filters: ListingFilters): Promise<Offer[]> {
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
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load listings: ${res.status}`);
  }
  const body: ListingsResponse = await res.json();
  return body.data.items
    .filter((l) => l.status === "active")
    .map((l) => ({
      id: l.id,
      title: l.title,
      city: l.city ?? "",
      price: formatPrice(l.price_per_day_cents, locale),
      img: l.images?.[0]?.url,
      rating: ratingLabel(l.rating_average, l.rating_count, locale),
      ratingCount: l.rating_count,
      // Backend has no `delivery=` filter; it exposes the per-item delivery types
      // instead, so the "Su pristatymu" toggle filters the fetched page client-side.
      hasDelivery: (l.delivery_types_available ?? []).includes("user_delivery"),
    }));
}

export function useListings(locale: Locale, filters: ListingFilters = {}) {
  const { q = "", city = "", category = "", sort = "recommended" } = filters;
  return useQuery({
    queryKey: ["listings", locale, q, city, category, sort],
    queryFn: () => fetchListings(locale, { q, city, category, sort }),
    placeholderData: keepPreviousData,
  });
}

async function fetchListing(id: string, locale: Locale): Promise<ListingDetail> {
  const res = await fetch(`${API_BASE}/listings/${id}`);
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
    description: l.description,
    rating: ratingLabel(l.rating_average, l.rating_count, locale),
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
  };
}

export function useListing(id: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: ["listing", id, locale],
    // skipToken keeps the query idle until an id exists — no `as` cast, no `enabled` flag.
    queryFn: id ? () => fetchListing(id, locale) : skipToken,
  });
}
