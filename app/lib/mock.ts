// ============================================================================
// MOCK: design-only data the Naudokis backend cannot supply yet.
// Everything here is clearly fake and flagged so it can be swapped for real
// data once the backend exposes it. Do NOT present these as authoritative.
// ============================================================================

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
