// Calendar-date helpers for the rental availability calendar.
//
// Everything here speaks the wire's date-only form, "YYYY-MM-DD" (IsoDate) — never a
// Date object across a boundary. Two reasons:
//
//  1. The market is Lithuania. A rental day is a day in Europe/Vilnius, not in the
//     viewer's zone: at 01:00 in Vilnius it is still "yesterday" in London, and a
//     calendar built from the viewer's local midnight would grey out the wrong cell
//     for anyone west of us. todayInMarket() is the only place "now" enters.
//  2. Date arithmetic in local time crosses DST twice a year and silently produces
//     23- and 25-hour days. Every calculation below runs at UTC midnight, where a day
//     is always exactly 86_400_000 ms, and is only then rendered back to a string.
//
// IsoDate strings also compare lexicographically (`a < b` IS a date comparison),
// which is why there is no compare helper — use the operators.
//
// Dependency-free on purpose: Intl does the locale work, so the calendar costs
// nothing in package.json (the runtime dependency surface is kept tiny by design).

// A calendar date with no time and no zone: "2026-07-14".
export type IsoDate = string;

const MARKET_TIME_ZONE = "Europe/Vilnius";
const DAY_MS = 86_400_000;

// "sv-SE" formats dates in ISO order natively, which is the shortest route to
// YYYY-MM-DD out of Intl. Read through formatToParts rather than format() so the
// result never depends on that locale's punctuation staying put.
const marketDateParts = new Intl.DateTimeFormat("sv-SE", {
  timeZone: MARKET_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Today, in the market's timezone.
//
// Caller beware: this is NOT stable across a server/client boundary — the server
// renders at one instant, the browser hydrates at another, and around Vilnius
// midnight they disagree. Worse, the detail page is ISR-cached (revalidate 300), so a
// server-rendered "today" could be baked into HTML and served tomorrow. The calendar
// is client-only and reads this after mount for exactly that reason — the same drift
// that makes listings.ts bake relative review dates inside the fetch.
export function todayInMarket(): IsoDate {
  const parts = marketDateParts.formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Narrowing predicate for untrusted input — the availability arrays are `unknown[]`
// (their element type is undocumented). Rejects real-looking impostors too:
// "2026-02-31" parses as a Date but round-trips to "2026-03-03", so it fails here.
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return toIsoDate(new Date(`${value}T00:00:00Z`)) === value;
}

function toIsoDate(date: Date): IsoDate {
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

// UTC midnight for an IsoDate. Private: callers stay in string space.
function utcMidnight(iso: IsoDate): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return toIsoDate(new Date(utcMidnight(iso) + days * DAY_MS));
}

// Calendar days from `from` to `to`, signed. Same day → 0.
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((utcMidnight(to) - utcMidnight(from)) / DAY_MS);
}

// The billable length of a rental, INCLUSIVE of both ends: renting an item for a
// single day (start === end) is 1 day, not 0. This is the unit `minimum_rental_days`,
// `maximum_rental_days` and the discount tiers' `min_days` count — they are days, not
// hotel nights, and an item rental has no check-out-morning concept.
export function rentalDays(start: IsoDate, end: IsoDate): number {
  return daysBetween(start, end) + 1;
}

// Every date in [from, to], inclusive.
export function eachDateInRange(from: IsoDate, to: IsoDate): IsoDate[] {
  const dates: IsoDate[] = [];
  for (let iso = from; iso <= to; iso = addDays(iso, 1)) {
    dates.push(iso);
  }
  return dates;
}

export function clampDate(iso: IsoDate, min: IsoDate, max: IsoDate): IsoDate {
  if (iso < min) {
    return min;
  }
  return iso > max ? max : iso;
}

export function startOfMonth(iso: IsoDate): IsoDate {
  return `${iso.slice(0, 7)}-01`;
}

// Month arithmetic anchored on the 1st, so there is no end-of-month clamping to get
// wrong (Jan 31 + 1 month). The calendar only ever pages by whole months.
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7)) - 1 + months;
  return toIsoDate(new Date(Date.UTC(year, month, 1)));
}

// getUTCDay(): 0=Sun … 6=Sat. Shifted so Monday=0.
function mondayIndex(iso: IsoDate): number {
  return (new Date(utcMidnight(iso)).getUTCDay() + 6) % 7;
}

export function startOfWeek(iso: IsoDate): IsoDate {
  return addDays(iso, -mondayIndex(iso));
}

export function endOfWeek(iso: IsoDate): IsoDate {
  return addDays(iso, 6 - mondayIndex(iso));
}

// Weeks of a month, Monday-first. `null` is a padding cell in the first/last week —
// inert, never focusable. Padding rather than bleeding in adjacent-month dates keeps
// one grid = one month, which is what makes the keyboard model simple: navigation is
// by DATE (see the picker), so arrowing "off" the edge pages the month and lands on a
// real day anyway — the pad cells never need to be reachable.
//
// Monday-first for BOTH locales, deliberately: `en` here is English for people in
// Lithuania, not en-US. A Sunday-first grid would misplace the weekend on a site
// whose whole pitch is "free this weekend". (Intl.Locale#getWeekInfo would say Sunday
// for `en` — do not use it.)
export function monthWeeks(anchor: IsoDate): (IsoDate | null)[][] {
  const first = startOfMonth(anchor);
  const nextMonth = addMonths(first, 1);
  const weeks: (IsoDate | null)[][] = [];
  let week: (IsoDate | null)[] = Array.from({ length: mondayIndex(first) }, () => null);
  for (let iso = first; iso < nextMonth; iso = addDays(iso, 1)) {
    week.push(iso);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }
  return weeks;
}

export function dayOfMonth(iso: IsoDate): string {
  return String(Number(iso.slice(8, 10)));
}

/* ---------------- Localized formatting ----------------
   Month and weekday names come from Intl, not the dictionary — the same call the
   review-date and member-since formatters make. Nothing here is a translatable
   string, so nothing here belongs in the Dict. */

// "2026 m. liepa" / "July 2026". Lithuanian's NOMINATIVE month is the correct form
// for a heading standing on its own — unlike the genitive LT_GENITIVE_MONTHS in
// listings.ts, which exists because "Narys nuo …" governs the case.
export function formatMonthHeading(iso: IsoDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", timeZone: "UTC" })
    .format(new Date(utcMidnight(iso)));
}

// Full date for screen readers: "2026 m. liepos 18 d., šeštadienis" / "Saturday, 18 July 2026".
export function formatFullDate(iso: IsoDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" })
    .format(new Date(utcMidnight(iso)));
}

// Compact date for the picker's two fields: "liepos 15" / "15 July".
//
// `month: "long"`, not "short" — Lithuanian's abbreviated month IS numeric, so a
// "short" format renders "07-15", which reads as an ambiguous number rather than a
// date. The long month is also the correct genitive ("liepos 15"), and it still fits
// the field at the 320px floor.
export function formatShortDate(iso: IsoDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", timeZone: "UTC" })
    .format(new Date(utcMidnight(iso)));
}

// Monday→Sunday weekday names for the grid header, derived from a known Monday
// (2026-06-01) rather than a hardcoded array.
export function weekdayNames(locale: string): { short: string; long: string }[] {
  const shortFormat = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const longFormat = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(utcMidnight(addDays("2026-06-01", index)));
    return { short: shortFormat.format(day), long: longFormat.format(day) };
  });
}
