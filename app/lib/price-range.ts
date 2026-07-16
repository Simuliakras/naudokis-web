// Price-range math for the listings feed's dual-thumb filter.
//
// The single source of truth for the price control's bounds and every conversion
// around it: the slider positions, the two number inputs, the `?price=` URL token
// and the backend cents params all pass through here, so none of them can drift.
// There is NO backend price-limit constant — the ceiling below IS the site's cap.
//
// Pure and dependency-free (only the pure formatter from listing-view): no React,
// no fetch. That is what lets app/lib/price-range.test.ts exercise the whole
// edge-case matrix — empty, invalid, decimal, crossed, equal, out-of-range — as
// plain function calls, the same shape app/lib/dates.ts takes for the calendar.
import type { Locale } from "@/app/lib/i18n/config";
import { formatPrice } from "@/app/lib/listing-view";

// Euros. FLOOR is "no minimum"; a max thumb resting on CEIL is an OPEN "€200+" cap,
// not a hard ceiling — priceToCents() omits the bound so pricier items still match.
export const PRICE_FLOOR = 0;
export const PRICE_CEIL = 200;
// Slider and inputs share ONE granularity so a dragged thumb and a typed value can
// never land between each other's steps and desync. Whole euros: daily rental prices
// have no sub-euro precision, and the wire is cents (× 100 below).
export const PRICE_STEP = 1;
// Coarse keyboard jump (PageUp/PageDown) over the 0–200 span.
export const PRICE_PAGE_STEP = 10;

// Euros, always within [FLOOR, CEIL] and ordered min ≤ max. `min === max` is legal
// (a single price point); the openness of either end is expressed by it sitting on
// its bound, recovered by priceBandArgs()/serializePriceParam().
export type PriceRange = { min: number; max: number };

function clamp(value: number, lo: number, hi: number): number {
  if (value < lo) {
    return lo;
  }
  return value > hi ? hi : value;
}

// Snap to the step grid and clamp into range.
//
// The snap is nearest-step, and today it is an identity on every real call path: the
// slider emits integers, parseField() has already floored typed text, and parsePriceParam
// only accepts /^\d+$/ — with PRICE_STEP at 1 there is nothing left to snap. It earns its
// place as the one function that owns "a euro value the grid allows", so a coarser
// PRICE_STEP stays a one-line change. Note the split it implies if that ever happens:
// typed "12.6" floors to 12 (parseField), a hypothetical direct 12.6 rounds to 13.
//
// NaN (the only value clamp() can't order) falls to the floor; ±∞ clamp to the nearest
// bound like any out-of-range number.
export function clampValue(euros: number): number {
  if (Number.isNaN(euros)) {
    return PRICE_FLOOR;
  }
  const snapped = Math.round(euros / PRICE_STEP) * PRICE_STEP;
  return clamp(snapped, PRICE_FLOOR, PRICE_CEIL);
}

export function defaultRange(): PriceRange {
  return { min: PRICE_FLOOR, max: PRICE_CEIL };
}

// A range that filters nothing: no minimum and an open top. Both the "no ?price="
// state and a range the user has widened all the way back out map to this, so the
// URL and the active-filter checks agree.
export function isDefaultRange(range: PriceRange): boolean {
  return range.min <= PRICE_FLOOR && range.max >= PRICE_CEIL;
}

// Clamp BOTH ends into range and order them. Crossed input (min 150, max 50) is
// swapped, not discarded — it keeps both numbers the user committed and simply reads
// them as the range they bound. Used on input commit and when parsing the URL; the
// slider clamps a dragged thumb against the other one itself, so it never crosses.
export function clampRange(min: number, max: number): PriceRange {
  const a = clampValue(min);
  const b = clampValue(max);
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

// One field's text → euros, or null for "leave this end open". Deliberately lenient:
// this runs on COMMIT (blur / Enter / apply), never per keystroke, so a half-typed
// "1" on the way to "150" is never touched. Strips currency/space noise, accepts the
// Lithuanian decimal comma, and floors decimals to the whole euro actually typed.
function parseField(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  if (cleaned === "") {
    return null;
  }
  const n = Number(cleaned);
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.floor(n);
}

// The two inputs → a clamped, ordered range. Empty (or unparseable) means that end is
// open: an empty min is the floor, an empty max is the ceiling.
export function normalizeInputs(rawMin: string, rawMax: string): PriceRange {
  const min = parseField(rawMin);
  const max = parseField(rawMax);
  return clampRange(min ?? PRICE_FLOOR, max ?? PRICE_CEIL);
}

function parseToken(part: string, fallback: number): number | null {
  if (part === "") {
    return fallback;
  }
  if (!/^\d+$/.test(part)) {
    return null;
  }
  return Number(part);
}

// `?price=` token → range, or null when there is no usable filter. Grammar is
// `<min>-<max>` with either side omittable: "10-60", "10-" (open max), "-60" (open
// min). Anything else — absent, "", no dash, extra dashes, non-numeric, or a range
// that clamps back to fully-open — is null, i.e. "no price filter".
//
// An IN-grammar bound outside [FLOOR, CEIL] CLAMPS rather than rejecting: "300-500"
// becomes "€200+" — still the question the user asked, just at the edge of what this
// site's slider can express. date-filter.ts deliberately does the opposite with an
// over-long window (it rejects); clamping 90 days to 60 would answer a window nobody
// picked, whereas there is no equivalent lie in showing the priciest bracket.
export function parsePriceParam(token: string | null | undefined): PriceRange | null {
  if (!token) {
    return null;
  }
  const parts = token.split("-");
  if (parts.length !== 2) {
    return null;
  }
  const min = parseToken(parts[0], PRICE_FLOOR);
  const max = parseToken(parts[1], PRICE_CEIL);
  if (min === null || max === null) {
    return null;
  }
  const range = clampRange(min, max);
  return isDefaultRange(range) ? null : range;
}

// Range → canonical `?price=` token; "" when the range filters nothing (so setParams
// drops the param). Idempotent with parsePriceParam: a bound sitting on its edge is
// omitted, so "10-" round-trips and a fully-open range serializes away.
export function serializePriceParam(range: PriceRange): string {
  if (isDefaultRange(range)) {
    return "";
  }
  const min = range.min > PRICE_FLOOR ? String(range.min) : "";
  const max = range.max < PRICE_CEIL ? String(range.max) : "";
  return `${min}-${max}`;
}

// Range → the backend's inclusive cents bounds. An end on its edge is omitted, not
// sent as 0 / 20000: the backend applies `>=` / `<=`, so omitting is what makes the
// filter open on that side (a €200+ item still matches a max-thumb at the ceiling).
export function priceToCents(range: PriceRange): { priceMinCents?: number; priceMaxCents?: number } {
  const out: { priceMinCents?: number; priceMaxCents?: number } = {};
  if (range.min > PRICE_FLOOR) {
    out.priceMinCents = Math.round(range.min * 100);
  }
  if (range.max < PRICE_CEIL) {
    out.priceMaxCents = Math.round(range.max * 100);
  }
  return out;
}

// The (min, max) pair for the chip / trigger label, with an edge-bound collapsed to
// null so the existing `priceBand(min, max)` dictionary function renders the right
// side: null min → "Up to €X", null max → "€X+", both set → "€X–Y".
export function priceBandArgs(range: PriceRange): [number | null, number | null] {
  return [
    range.min > PRICE_FLOOR ? range.min : null,
    range.max < PRICE_CEIL ? range.max : null,
  ];
}

// A single thumb's value, spoken by its aria-valuetext. A max thumb on the ceiling is
// the open cap, so it reads "€200+"; formatPrice keeps the locale's currency shape
// ("10 €" vs "€10"), and the "+" trails either form.
export function formatPriceValue(euros: number, locale: Locale, open = false): string {
  return formatPrice(euros * 100, locale) + (open ? "+" : "");
}
