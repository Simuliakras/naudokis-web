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
import { addDays, type IsoDate } from "./dates";
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

// "Which break does an N-day rental actually get?" — the biggest break this length
// qualifies for. A 1-day tier must still be honoured in the price, and a 7-day tier
// must not be applied to a 3-day rental just because it is the deepest on the listing.
// Equal percents tie-break to the deeper threshold: the price is identical either
// way, but the Terms ladder highlights whichever tier this returns, and that choice
// must be the tier the renter actually crossed — never an accident of wire order.
export function applicableDiscount(tiers: Discount[], days: number): Discount | undefined {
  const qualifying = tiers.filter((tier) => tier.percent > 0 && days >= tier.minDays);
  if (qualifying.length === 0) {
    return undefined;
  }
  return qualifying.reduce((best, tier) =>
    tier.percent > best.percent ||
    (tier.percent === best.percent && tier.minDays > best.minDays)
      ? tier
      : best,
  );
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

   The panel's "Iš viso" row is `total`: the rent minus the owner's advertised
   price break, plus the listing's deposit — every euro amount already on this
   page, and nothing else. The deposit is itemized above the total and folded in
   (2026-07 user decision — it is refundable, but it is money the renter puts
   down). The app's service fees stay OUT, because this site cannot see them:
   the copy right under the row says so in as many words
   (dict.detail.estimateFees, dict.offers.interruptBody) — the final amount with
   delivery and fees lands in the app. */
export type RentalEstimate = {
  days: number;
  // days × per-day price, before any break — the rent row's face value. Equal to
  // rentalSubtotal when no discount applies.
  fullSubtotalCents: number;
  fullSubtotal: string;
  // The rental minus the applied break ONLY — never the deposit, never fees.
  rentalSubtotalCents: number;
  rentalSubtotal: string;
  discount?: Discount; // the tier actually applied, if any
  savings?: string; // formatted value of that break
  // Refundable; itemized as its own row and summed into the total below.
  deposit: string | null; // null when the listing takes none
  // The "Iš viso" row: rentalSubtotal + deposit. Never the app's fees.
  totalCents: number;
  total: string;
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
  const totalCents = rentalSubtotalCents + depositCents;
  return {
    days,
    fullSubtotalCents,
    fullSubtotal: formatPrice(fullSubtotalCents, locale),
    rentalSubtotalCents,
    rentalSubtotal: formatPrice(rentalSubtotalCents, locale),
    discount,
    savings: savedCents > 0 ? formatPrice(savedCents, locale) : undefined,
    deposit: depositCents > 0 ? formatPrice(depositCents, locale) : null,
    totalCents,
    total: formatPrice(totalCents, locale),
  };
}

/* ---------------- Cancellation policy ----------------
   The wire carries only a tier id; what each tier MEANS is fixed platform-wide by the
   Terms of Use §9 (app/lib/legal/data/terms-of-use.*.json, blocks 67–70):

     flexible  — full refund ≥24 h before the rental starts, nothing after
     moderate  — full refund ≥5 calendar days out, 50 % with 1–4 days left, then nothing
     strict    — 50 % refund ≥14 calendar days out, nothing after

   The dictionary's cancellation copy states these thresholds in words — if §9 ever
   changes, the dict entries must change in lockstep. */

export type CancellationTier = "flexible" | "moderate" | "strict";

// Unknown/absent tier → "moderate": ToU §9 applies the Moderate policy whenever the
// listing doesn't state one, so that is the truthful default — not a softer guess.
export function cancellationTier(raw: string | null | undefined): CancellationTier {
  if (raw === "flexible" || raw === "strict") {
    return raw;
  }
  return "moderate";
}

// What the booking panel can still promise about cancelling, given a chosen start
// date — the estimate's cancellation line renders one of these.
export type CancellationNotice =
  | { kind: "hours" } // flexible: the 24 h rule, restated (see below)
  | { kind: "freeUntil"; deadline: IsoDate } // full refund if cancelled by this date
  | { kind: "halfUntil"; deadline: IsoDate } // only the 50 % window is still open
  | { kind: "none" }; // every refund window has passed

export function cancellationNotice({ tier, start, today }: {
  tier: CancellationTier;
  start: IsoDate;
  today: IsoDate;
}): CancellationNotice {
  // Flexible's 24 h threshold is clock-based, and this page only knows dates — a
  // computed calendar deadline would overpromise (cancelling late on start−1 can
  // already be inside the 24 h), so the notice restates the rule instead. The one
  // date-only certainty is a rental starting today: the 24 h mark is unambiguously
  // past, so restating the rule there would overpromise too.
  if (tier === "flexible") {
    return today >= start ? { kind: "none" } : { kind: "hours" };
  }
  if (tier === "strict") {
    const deadline = addDays(start, -14);
    return today <= deadline ? { kind: "halfUntil", deadline } : { kind: "none" };
  }
  const freeDeadline = addDays(start, -5);
  if (today <= freeDeadline) {
    return { kind: "freeUntil", deadline: freeDeadline };
  }
  const halfDeadline = addDays(start, -1);
  if (today <= halfDeadline) {
    return { kind: "halfUntil", deadline: halfDeadline };
  }
  return { kind: "none" };
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
