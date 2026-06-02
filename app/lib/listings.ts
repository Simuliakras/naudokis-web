// Listing data layer — browse listings + single-listing detail from the Naudokis backend.
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-dev.naudokis.lt";

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
function formatPrice(cents: number, locale: Locale): string {
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
async function fetchListings(locale: Locale, q: string): Promise<Offer[]> {
  const url = new URL(`${API_BASE}/listings`);
  if (q) {
    url.searchParams.set("q", q);
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
    }));
}

export function useListings(locale: Locale, q: string = "") {
  return useQuery({
    queryKey: ["listings", locale, q],
    queryFn: () => fetchListings(locale, q),
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
    queryFn: () => fetchListing(id as string, locale),
    enabled: !!id,
  });
}
