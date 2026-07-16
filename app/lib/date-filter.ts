// Date-range filter math for the listings feed's calendar filter.
//
// The single source of truth for the date filter's URL token, its inclusive window
// rules and the backend params it maps to: the calendar UI, the `?dates=` URL token
// and the `available_from`/`available_to` query params all pass through here, so none
// of them can drift.
//
// Pure and dependency-free (only the TZ-safe helpers from dates.ts and a locale type):
// no React, no fetch. That is what lets app/lib/date-filter.test.ts exercise the whole
// edge-case matrix — empty, malformed, past, single-day, over-window — as plain
// function calls, the same shape app/lib/price-range.ts takes for the slider.
import { formatShortDate, isIsoDate, rentalDays, type IsoDate } from "@/app/lib/dates";
import type { Locale } from "@/app/lib/i18n/config";

// A closed rental window: both ends present, start <= end, INCLUSIVE of both days
// (rentalDays(start, end) is 1 for a single-day rental). Unlike the price range there
// is no open-ended variant — the backend contract is both-or-neither, so a date filter
// is either a full window or absent (null).
export type DateFilterRange = { start: IsoDate; end: IsoDate };

// The longest window the filter will accept, inclusive.
//
// 60, not 90: this is the BACKEND's ceiling (AVAILABILITY_MAX_RANGE_DAYS), which is itself
// pinned to BOOKING_LIMITS.MAX_RENTAL_DAYS — a span longer than the longest bookable rental
// can never be booked, so listing "available" items for it would be a dead end, the same
// reasoning that excludes a listing whose minimum_rental_days can't serve the window. The
// backend 400s anything longer, so this is a wire contract, not a cosmetic guard: a 90-day
// selection would have failed every real user's search. See docs/backend-date-filter-contract.md.
export const MAX_WINDOW_DAYS = 60;

// There is no feature flag here, deliberately. One briefly existed on the belief that the
// backend ignored date params; that belief was wrong (the probe behind it asked for a 2020
// window, which every listing matches — nothing has availability rows in 2020 — a result
// indistinguishable from the filter being ignored). `available_from`/`available_to` have
// always been honored, so the filter is simply live. Note prod holds zero availability rows,
// so nothing is excluded there yet: only dev can demonstrate this filter, against a listing
// with a future owner block. See docs/backend-date-filter-contract.md.

// `<start>..<end>`: two ISO dates joined by "..". ISO dates already contain "-", so a
// "-" separator (as price uses) can't split them; ".." is the conventional range
// operator, needs no URL-encoding, and can't appear inside a YYYY-MM-DD.
const SEP = "..";

// `?dates=` token → range, or null when there is no usable filter. STRUCTURAL only —
// deterministic and time-independent (no "today"), so it is SSR-safe and unit-testable
// as a pure function; the temporal check (is the window already past?) is the separate
// clampRangeToToday below, which takes "today" as an argument rather than reading it.
// Rejects: absent/""/not-two-parts/either part not a real ISO date ("2026-02-31" is
// caught by isIsoDate)/start after end/window longer than MAX_WINDOW_DAYS.
//
// Note this REJECTS an over-long window rather than clamping it to MAX_WINDOW_DAYS —
// the opposite of price-range.ts, where an out-of-bounds token clamps to the open cap
// ("300-500" → "€200+"). The asymmetry is deliberate: clamping a price still answers
// the question the user asked ("expensive things"), whereas clamping 90 days to 60
// would silently answer a DIFFERENT question than the one in the URL.
export function parseDatesParam(token: string | null | undefined): DateFilterRange | null {
  if (!token) {
    return null;
  }
  const parts = token.split(SEP);
  if (parts.length !== 2) {
    return null;
  }
  const [start, end] = parts;
  if (!isIsoDate(start) || !isIsoDate(end)) {
    return null;
  }
  if (start > end) {
    return null;
  }
  if (rentalDays(start, end) > MAX_WINDOW_DAYS) {
    return null;
  }
  return { start, end };
}

// Range → canonical `?dates=` token; "" when there is no filter (null), so setParams
// drops the param. Idempotent with parseDatesParam. A single-day window serializes as
// the same date on both sides ("2026-07-18..2026-07-18") — the grammar stays uniform.
export function serializeDatesParam(range: DateFilterRange | null): string {
  if (!range) {
    return "";
  }
  return `${range.start}${SEP}${range.end}`;
}

// Temporal normalization against the market's "today" (Europe/Vilnius; see dates.ts).
// A window entirely in the past drops to no filter; a window straddling today has its
// start pulled forward, so a shared "this weekend" link opened next week still filters
// the days that remain.
//
// PURE: "today" is an argument, never read here — which is what lets both sides call it.
// The server clamps during a date-filtered render (catalogueFiltersFromSearch) and hands
// that same date to the client as `serverToday`, so the first client render reproduces the
// window and lands in the same React Query key. Keeping the read out of this function is
// also why parseDatesParam can stay deterministic: no "today" is ever baked into an
// undated render.
export function clampRangeToToday(range: DateFilterRange | null, today: IsoDate): DateFilterRange | null {
  if (!range) {
    return null;
  }
  if (range.end < today) {
    return null;
  }
  return { start: range.start < today ? today : range.start, end: range.end };
}

// There is no isDefaultRange() counterpart to price-range's here, deliberately: the date
// filter has a single "off" state — the absent range — so `=== null` at the call site is
// the whole predicate, and wrapping it would only hide that.

// Range → the backend's inclusive params. Both keys or neither (the backend contract is
// both-or-neither → 400): available_from/available_to are inclusive at both ends, the
// same inclusive convention rentalDays and the *_dates arrays use.
export function datesToApiParams(range: DateFilterRange | null): { availableFrom?: IsoDate; availableTo?: IsoDate } {
  if (!range) {
    return {};
  }
  return { availableFrom: range.start, availableTo: range.end };
}

// The (from, to) pair for the chip / trigger label, pre-formatted for the locale so the
// dict's dateBand stays a pure string builder (the same shape calRangeSelected takes).
// Localized month names come from Intl, not the dictionary. A single-day window yields
// two equal strings, and dateBand collapses them to one.
export function dateBandArgs(range: DateFilterRange, locale: Locale): [string, string] {
  return [formatShortDate(range.start, locale), formatShortDate(range.end, locale)];
}
