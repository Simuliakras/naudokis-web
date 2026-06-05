// ============================================================================
// MOCK: design-only data the Naudokis backend cannot supply yet.
// Everything here is clearly fake and flagged so it can be swapped for real
// data once the backend exposes it. Do NOT present these as authoritative.
// ============================================================================

// MOCK: per-category listing counts. The /listings/categories endpoint returns
// no `listing_count`, and the /listings `count` field reflects only the page
// size — so the all-categories tiles show a deterministic pseudo-count derived
// from the category id (stable across renders, obviously not a real total).
export function mockCategoryCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff;
  }
  // 120–1560, rounded to the nearest 10 for a "tidy" look.
  return Math.round((120 + (h % 1440)) / 10) * 10;
}

// MOCK: booking terms shown on the listing-detail booking panel. Reservation,
// date selection and price calculation are app-only (Locked mode), so the web
// surface shows static deposit / duration figures only.
export const MOCK_BOOKING = {
  depositCents: 10000, // 100,00 €
  durationMinDays: 1,
  durationMaxDays: 60,
} as const;

// MOCK: sample rental length the booking-panel breakdown is computed against
// (matches the static sampleDateFrom→sampleDateTo span shown in the dict).
export const SAMPLE_RENTAL_DAYS = 3;
