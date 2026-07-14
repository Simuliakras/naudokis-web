// The listing view model and its pure formatters — everything a card or a section
// needs to RENDER a listing, with no data-fetching machinery attached.
//
// This module exists to keep `@tanstack/react-query` out of bundles that only draw
// listings. app/lib/listings.ts imports react-query (it owns the hooks), so a client
// component reaching in there for something as small as formatLocation() pulled the
// whole query runtime along with it — onto the home page, which issues no queries at
// all. Anything here must stay free of react-query and of server-only imports.
//
// listings.ts re-exports all of this, so existing `from "@/app/lib/listings"` imports
// keep working; components that need only the view layer should import it from here.
import type { Locale } from "./i18n/config";

export type Offer = {
  id: string;
  title: string;
  city?: string; // absent when the backend listing has no city — the card hides the row
  subdivision?: string; // district within the city, appended to the location line when present
  price: string;
  priceCents: number; // raw per-day price — the feed's client-side price bands filter on it
  img?: string;
  rating?: string; // formatted value, present only when ratingCount > 0
  ratingCount: number; // raw count, for building the localized review label
  hasDelivery: boolean; // derived client-side from delivery_types_available — see note in fetchListings
  photoCount: number; // gallery size — the card's photo-count chip (hidden below 2)
  discount?: Discount; // best active price break; absent when the listing gives none
  category?: string; // top-level category id — tints the empty-photo placeholder (optional on the wire)
  ownerId?: string; // groups a lister's items client-side ("more from this owner" rail)
};

// The single price break the card surfaces — see bestDiscount() in listings.ts.
export type Discount = {
  percent: number;
  minDays: number;
};

export function formatPrice(cents: number, locale: Locale): string {
  const euros = cents / 100;
  const n =
    cents % 100 === 0
      ? String(Math.round(euros))
      : euros.toFixed(2).replace(".", locale === "lt" ? "," : ".");
  return locale === "lt" ? `${n} €` : `€${n}`;
}

export function formatLocation(city?: string, subdivision?: string): string {
  return [city, subdivision].filter(Boolean).join(", ");
}

// Stable "photo safeguard" ordering — surface photo-bearing listings first so a feed
// page or band isn't a wall of category-icon placeholders. Apply per page (or to a
// one-shot list), never across accumulated infinite-scroll pages: re-sorting the
// full list would reshuffle cards the user has already scrolled past. Array.sort is
// stable, so order within the has-photo / no-photo groups is preserved (the
// placeholder stays the graceful fallback for the occasional no-photo item).
export function photoFirst<T extends { img?: string | null }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.img ? 0 : 1) - (b.img ? 0 : 1));
}
