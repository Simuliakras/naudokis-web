// Availability data layer — which days a listing is already taken.
//
// GET /listings/{id}/availability?start_date=&end_date=  (public, unauthenticated)
//
// This endpoint is the one piece of booking-calendar truth the bridge site can see.
// Everything else about a booking (fees, the final sum, the reservation itself)
// happens in the app, so this module has exactly one job: answer "is this day free?"
// — and refuse to answer when it does not know.
//
// ── The parsing problem ──────────────────────────────────────────────────────────
// The response carries SEVEN overlapping arrays:
//
//   unavailable_slots, blocked_dates, booked_dates, reserved_dates,
//   owner_blocked, booked, reserved
//
// Every one of them is empty for every listing in production — nothing has ever been
// booked — so their ELEMENT TYPES cannot be observed from live data and are not
// documented anywhere. There is therefore no honest wire type to declare, and this
// module declares none: the body arrives as `unknown` and is narrowed at runtime.
//
// ── The rule everything follows from ─────────────────────────────────────────────
// A shape we cannot parse is NOT "nothing is booked". It is "we do not know."
//
// So there are two publishable states, `known` and `unknown`, and no code path that
// can produce "free" by accident:
//
//   * An element we cannot narrow          → the whole result becomes `unknown`.
//   * A non-empty array key we don't know  → the whole result becomes `unknown`.
//
// Both downgrades hide the calendar and report a PII-free shape fingerprint to
// Sentry. That is deliberate and is the entire reason this is safe to ship before
// the backend documents the contract: today (zero bookings) every array is empty, we
// parse them, and the calendar renders. The day the first real booking lands we
// either parse it correctly, or the calendar disappears for that listing and we get
// told the shape. What cannot happen is a booked day rendering as bookable.
//
// The allowlist below must stay an allowlist. Do NOT "future-proof" it by unioning
// every array-valued key in the payload: the day the backend adds `available_dates`,
// such a sweep would invert its polarity and grey out precisely the days that are
// free.
import { useQuery, skipToken } from "@tanstack/react-query";
import { API_BASE, MarketplaceApiError, marketplaceFetch } from "./api";
import { captureException } from "./report-error";
import { addDays, eachDateInRange, isIsoDate, type IsoDate } from "./dates";

/* ---------------- Wire ---------------- */
// Keys whose contents mean "NOT bookable". Every other array key in the payload is
// unrecognised by construction — see the note above on why that is a refusal, not a
// shrug. `unavailable_slots` is the one we most expect to hold objects rather than
// bare date strings, but all seven are parsed identically and unioned.
const UNAVAILABLE_KEYS: readonly string[] = [
  "unavailable_slots",
  "blocked_dates",
  "booked_dates",
  "reserved_dates",
  "owner_blocked",
  "booked",
  "reserved",
];

/* ---------------- View model ---------------- */
export type AvailabilityUnknownReason =
  | "malformed" // body/data was not an object
  | "listing-mismatch" // the echoed listing_id is not the one we asked about
  | "bad-window" // the echoed start_date/end_date is missing or nonsensical
  | "unknown-array" // a non-empty array key outside the allowlist — polarity unknown
  | "unparsed-element" // an element inside a known array that we could not narrow
  | "not-found" // 404 — the listing has no readable calendar
  | "fetch-failed"; // network/timeout/5xx, after React Query gave up retrying

// `unknown` is a first-class state, not an error to paper over. When the calendar
// cannot be read the UI must say so and send the user to the app — never render an
// empty calendar, which silently implies every day is free.
export type Availability =
  | {
      status: "known";
      // The window the backend ECHOED, which may be narrower than the one we asked
      // for. The calendar must not offer dates outside it: beyond this boundary we
      // were told nothing, and "not mentioned" is not "free".
      windowStart: IsoDate;
      windowEnd: IsoDate;
      // Sorted + deduped. An array, not a Set: query results should stay
      // structurally cloneable (a Set does not survive dehydrate()), so the cache
      // keeps plain data and the UI builds its lookup Set in a useMemo.
      unavailableDates: IsoDate[];
    }
  | { status: "unknown"; reason: AvailabilityUnknownReason };

// How far ahead the calendar can see. The endpoint serves a full year happily, but
// the longest rental any listing permits is `maximum_rental_days` (60 today), so half
// a year covers even a 60-day booking started 4 months out.
export const AVAILABILITY_WINDOW_DAYS = 180;

/* ---------------- Parsing ---------------- */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Keys + value types, never values. A slot may well carry booking or renter ids once
// bookings exist, and we need to learn the SHAPE without shipping anyone's data to
// Sentry. This is the operational plan: ship, wait for the first real booking, read
// the fingerprint, tighten the parser.
function shapeFingerprint(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `array[${value.length > 0 ? shapeFingerprint(value[0]) : ""}]`;
  }
  if (isRecord(value)) {
    return `object{${Object.keys(value).sort().join(",")}}`;
  }
  return typeof value;
}

// Shapes already reported this page session. The report is a bug tip-off, not a metric:
// once we know `booked_dates` holds `object{end,start}`, the ten-thousandth copy of that
// fact tells us nothing and costs Sentry quota.
//
// It needs the guard precisely because the failure is systematic, not random. The day a
// listing gets its first booking, EVERY visitor to it hits the same unparsed shape — and
// this query alone refetches on window focus (see useAvailability), so a single left-open
// tab reports on every alt-tab, forever. That is the CSP-report flood again, one endpoint
// over.
const reportedShapes = new Set<string>();

function unknownAvailability(reason: AvailabilityUnknownReason, shape: string): Availability {
  const fingerprint = `${reason}:${shape}`;
  if (!reportedShapes.has(fingerprint)) {
    reportedShapes.add(fingerprint);
    captureException(new Error(`Unreadable availability payload: ${reason}`), { reason, shape });
  }
  return { status: "unknown", reason };
}

// One element of an unavailability array → the dates it covers, or null if we cannot
// tell (which poisons the whole result — see the module note).
//
// Tolerant about spelling, because the contract is undocumented: a bare ISO date, a
// {start_date,end_date} span, its {start,end} / {from,to} spellings, or a {date}
// wrapper. Anything else is a refusal.
function elementDates(entry: unknown): IsoDate[] | null {
  if (isIsoDate(entry)) {
    return [entry];
  }
  if (!isRecord(entry)) {
    return null;
  }
  const single = entry.date ?? entry.day;
  if (isIsoDate(single)) {
    return [single];
  }
  const from = entry.start_date ?? entry.start ?? entry.from;
  const to = entry.end_date ?? entry.end ?? entry.to;
  if (!isIsoDate(from) || !isIsoDate(to) || to < from) {
    return null;
  }
  return eachDateInRange(from, to);
}

function parseAvailability(body: unknown, id: string): Availability {
  const data = isRecord(body) ? body.data : undefined;
  if (!isRecord(data)) {
    return unknownAvailability("malformed", shapeFingerprint(body));
  }
  if (typeof data.listing_id === "string" && data.listing_id !== id) {
    return unknownAvailability("listing-mismatch", shapeFingerprint(data));
  }
  // The echoed window is authoritative: the backend may clamp what we asked for, and
  // the calendar may only speak for days it actually covered.
  const { start_date: windowStart, end_date: windowEnd } = data;
  if (!isIsoDate(windowStart) || !isIsoDate(windowEnd) || windowEnd < windowStart) {
    return unknownAvailability("bad-window", shapeFingerprint(data));
  }

  const unavailable = new Set<IsoDate>();
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) {
      continue;
    }
    if (!UNAVAILABLE_KEYS.includes(key)) {
      // An array we have never seen. We cannot know its polarity — `maintenance_dates`
      // would mean "blocked" and `available_dates` the exact opposite — so we refuse
      // rather than pick. Empty ones carry no data and are safe to skip.
      if (value.length > 0) {
        return unknownAvailability("unknown-array", `${key}:${shapeFingerprint(value)}`);
      }
      continue;
    }
    for (const entry of value) {
      const dates = elementDates(entry);
      if (!dates) {
        return unknownAvailability("unparsed-element", `${key}:${shapeFingerprint(entry)}`);
      }
      for (const iso of dates) {
        // Clamp to the echoed window. Not cosmetic: a malformed span across years
        // would otherwise have enumerated tens of thousands of strings above, so
        // elementDates stays honest and the bound is applied here.
        if (iso >= windowStart && iso <= windowEnd) {
          unavailable.add(iso);
        }
      }
    }
  }
  return { status: "known", windowStart, windowEnd, unavailableDates: [...unavailable].sort() };
}

/* ---------------- Fetcher + hook ---------------- */
export function availabilityKey(id: string | undefined, today: IsoDate | undefined) {
  // No locale in the key, unlike the listing queries: they bake localized strings
  // into their view models, this one returns locale-free ISO dates. Keying by locale
  // would re-fetch identical bytes on every language switch.
  return ["availability", id, today, AVAILABILITY_WINDOW_DAYS] as const;
}

export async function fetchAvailability(id: string, today: IsoDate): Promise<Availability> {
  const url = new URL(`${API_BASE}/listings/${id}/availability`);
  url.searchParams.set("start_date", today);
  url.searchParams.set("end_date", addDays(today, AVAILABILITY_WINDOW_DAYS));
  // `no-store`, and never `next: { revalidate }`. A cached calendar is a lie with a
  // timestamp: it would be baked into the ISR HTML (revalidate 300) and served for
  // minutes after a day was booked. This is the one fetch on the page that must not
  // be shared or reused, and no-store makes that true even if a server component
  // ever calls it by mistake.
  const res = await marketplaceFetch(url, { cache: "no-store" });
  // 404 is terminal (no calendar to read) — a `unknown` result, not a retry. A 5xx or
  // a network drop is transient, so it throws: React Query retries it and the
  // QueryCache reports it. Both land the user in the same place — no calendar — but
  // only one of them is worth trying again.
  if (res.status === 404) {
    return { status: "unknown", reason: "not-found" };
  }
  if (!res.ok) {
    throw new MarketplaceApiError("server", res.status);
  }
  return parseAvailability(await res.json(), id);
}

export function useAvailability(id: string | undefined, today: IsoDate | undefined) {
  return useQuery({
    queryKey: availabilityKey(id, today),
    // Idle until BOTH the id and the client-computed "today" exist — no `enabled`
    // flag and no cast, the same skipToken pattern useListing uses.
    queryFn: id && today ? () => fetchAvailability(id, today) : skipToken,
    // Far shorter than the app's 5-minute default, and unlike every other query on
    // the site this one refetches on focus. Staleness here is user-visible as a lie:
    // a tab left open must not keep offering a day that has since been booked.
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
