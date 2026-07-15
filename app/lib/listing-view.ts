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
  category?: string; // top-level category id — tints the empty-photo placeholder (optional on the wire)
  ownerId?: string; // groups a lister's items client-side ("more from this owner" rail)
  deposit?: string; // formatted deposit ("50 €" / "€50"); absent when the listing takes none.
                    // The AMOUNT only — never framed as protection or insurance (the Terms disclaim both).
  owner?: OfferOwner; // absent until the backend embeds an owner summary on browse items
};

// The owner summary a browse card renders: a small avatar (or initials) beside a name.
// Optional on Offer — the browse wire carries no owner block today, so the card must
// render exactly as it does now when this is absent.
export type OfferOwner = {
  id?: string;
  name: string; // display name; the business name wins when the owner is a business
  initials: string; // "GB" — the avatar fallback. "" when the name yields no letters,
                    // in which case the avatar falls back to its person glyph.
  avatar?: string; // cdnImage()-guarded; undefined for a missing or non-allowlisted host
  // identity_verified. null, NOT false: "the wire didn't say" is not the same claim as
  // "this person failed verification" (same convention as ListingOwner.isBusiness).
  // Modelled so a future badge has an honest source; deliberately not rendered on the card.
  verified: boolean | null;
};

// First letter of up to the first two name parts ("Gvidas B." → "GB", "UAB Nuoma" → "UN").
// Only used when the wire omits `initials`. Returns "" when the name yields no letters, so
// the avatar can fall back to its person glyph rather than showing an empty disk.
export function ownerInitials(name: string): string {
  const letters: string[] = [];
  for (const part of name.split(/\s+/)) {
    // A letter is a character whose case actually changes — true for Lithuanian
    // diacritics (Ą/ą, Š/š), false for digits, punctuation and the trailing ".".
    const first = Array.from(part).find((ch) => ch.toLowerCase() !== ch.toUpperCase());
    if (first) {
      letters.push(first.toUpperCase());
    }
    if (letters.length === 2) {
      break;
    }
  }
  return letters.join("");
}

// One of a listing's long-rental price breaks ("−20% from 7 days"). The detail page's
// rental estimate and discount ladder consume these — see applicableDiscount and
// discountTierViews below.
export type Discount = {
  percent: number;
  minDays: number;
};

/* ---------------- Price breaks ----------------
   Both functions below take tiers that are ALREADY known to be active: the owner's
   `discount_enabled` master switch is applied at the fetch boundary (see listings.ts),
   so an inactive leftover tier can never reach either one. */

// "Which break does an N-day rental actually get?" — the deepest tier this length
// qualifies for. A 1-day tier must still be honoured in the price, and a 7-day tier
// must not be applied to a 3-day rental just because it is the deepest on the listing.
export function applicableDiscount(tiers: Discount[], days: number): Discount | undefined {
  const qualifying = tiers.filter((tier) => tier.percent > 0 && days >= tier.minDays);
  if (qualifying.length === 0) {
    return undefined;
  }
  return qualifying.reduce((best, tier) => (tier.percent > best.percent ? tier : best));
}

// A tier as shown on the detail page's discount ladder: the threshold, the percent
// off, and the effective discounted per-day price. Same rounding as the estimate.
export type DiscountTierView = {
  percent: number;
  minDays: number;
  perDay: string; // effective discounted per-day rate, formatted for the locale
};

// The advertised ladder for the detail page: every genuine longer-rental break
// (minDays >= 2 — a break that applies from day one isn't a break, it's just the
// price), cheapest-threshold first, each with its effective per-day price. Never sums
// days — there is no total here.
export function discountTierViews(
  tiers: Discount[],
  pricePerDayCents: number,
  locale: Locale,
): DiscountTierView[] {
  return tiers
    .filter((tier) => tier.percent > 0 && tier.minDays >= 2)
    .sort((a, b) => a.minDays - b.minDays)
    .map((tier) => ({
      percent: tier.percent,
      minDays: tier.minDays,
      perDay: formatPrice(Math.round(pricePerDayCents * (1 - tier.percent / 100)), locale),
    }));
}

/* ---------------- The rental estimate ----------------
   What the bridge site can honestly compute for a chosen date range — and nothing
   more.

   There is deliberately NO `total` field here, and adding one is a contract
   violation, not a feature. The app charges service fees this site cannot see, and
   the copy promises the user in as many words that fees, the deposit and the final
   amount are shown IN THE APP (dict.detail.confirmInApp, dict.offers.interruptBody).
   A "Total" on this page would be a number we made up.

   The absence is enforced by the type: a component cannot render a total it was never
   handed. Every field below is arithmetic over facts the page already displays — the
   per-day price, the advertised price break, the deposit. Rendering a total would
   require the backend to expose the fee schedule first. Until then: no. */
export type RentalEstimate = {
  days: number;
  // days × per-day price, before any break. Present so the UI can strike it through
  // when a discount applies; equal to rentalSubtotal when none does.
  fullSubtotalCents: number;
  fullSubtotal: string;
  // The rental line ONLY — never the deposit, never fees.
  rentalSubtotalCents: number;
  rentalSubtotal: string;
  discount?: Discount; // the tier actually applied, if any
  savings?: string; // formatted value of that break
  // Refundable, and NOT summed into anything above. It is money that comes back.
  deposit: string | null; // null when the listing takes none
};

export function rentalEstimate(
  { days, pricePerDayCents, depositCents, tiers }: {
    days: number;
    pricePerDayCents: number;
    depositCents: number;
    tiers: Discount[];
  },
  locale: Locale,
): RentalEstimate {
  const fullSubtotalCents = days * pricePerDayCents;
  const discount = applicableDiscount(tiers, days);
  const rentalSubtotalCents = discount
    ? Math.round(fullSubtotalCents * (1 - discount.percent / 100))
    : fullSubtotalCents;
  const savedCents = fullSubtotalCents - rentalSubtotalCents;
  return {
    days,
    fullSubtotalCents,
    fullSubtotal: formatPrice(fullSubtotalCents, locale),
    rentalSubtotalCents,
    rentalSubtotal: formatPrice(rentalSubtotalCents, locale),
    discount,
    savings: savedCents > 0 ? formatPrice(savedCents, locale) : undefined,
    deposit: depositCents > 0 ? formatPrice(depositCents, locale) : null,
  };
}

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
