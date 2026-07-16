import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import {
  MAX_WINDOW_DAYS,
  clampRangeToToday,
  dateBandArgs,
  datesToApiParams,
  parseDatesParam,
  serializeDatesParam,
  type DateFilterRange,
} from "./date-filter";

// A fixed "today" so every temporal assertion is deterministic.
const TODAY = "2026-07-15";

describe("MAX_WINDOW_DAYS", () => {
  // Not a preference — the backend's AVAILABILITY_MAX_RANGE_DAYS (pinned to
  // BOOKING_LIMITS.MAX_RENTAL_DAYS) 400s any window longer than this, so raising it
  // would 400 real users' searches. See docs/backend-date-filter-contract.md.
  it("matches the backend's 60-day ceiling", () => {
    expect(MAX_WINDOW_DAYS).toBe(60);
  });
});

describe("parseDatesParam", () => {
  it("returns null for absent or empty tokens", () => {
    expect(parseDatesParam(null)).toBeNull();
    expect(parseDatesParam(undefined)).toBeNull();
    expect(parseDatesParam("")).toBeNull();
  });

  it("returns null unless there are exactly two parts", () => {
    expect(parseDatesParam("2026-07-18")).toBeNull();
    expect(parseDatesParam("2026-07-18..2026-07-20..2026-07-22")).toBeNull();
    expect(parseDatesParam("garbage")).toBeNull();
  });

  it("rejects impostor dates and unpadded ISO", () => {
    expect(parseDatesParam("2026-02-31..2026-03-01")).toBeNull(); // Feb 31 round-trips away
    expect(parseDatesParam("2026-7-8..2026-07-09")).toBeNull(); // needs YYYY-MM-DD
    expect(parseDatesParam("not-a-date..2026-07-09")).toBeNull();
  });

  it("rejects a start after the end", () => {
    expect(parseDatesParam("2026-07-20..2026-07-18")).toBeNull();
  });

  it("accepts a bounded window and a single-day window", () => {
    expect(parseDatesParam("2026-07-18..2026-07-20")).toEqual({ start: "2026-07-18", end: "2026-07-20" });
    expect(parseDatesParam("2026-07-18..2026-07-18")).toEqual({ start: "2026-07-18", end: "2026-07-18" });
  });

  it("accepts a window exactly at the ceiling and rejects one past it", () => {
    const start = "2026-07-18";
    const atCeiling = addDays(start, MAX_WINDOW_DAYS - 1); // inclusive → MAX_WINDOW_DAYS days
    const overCeiling = addDays(start, MAX_WINDOW_DAYS); // one day too long
    expect(parseDatesParam(`${start}..${atCeiling}`)).toEqual({ start, end: atCeiling });
    expect(parseDatesParam(`${start}..${overCeiling}`)).toBeNull();
  });
});

describe("serializeDatesParam", () => {
  it('serializes null to "" so setParams drops the param', () => {
    expect(serializeDatesParam(null)).toBe("");
  });

  it("serializes a range and a single day uniformly", () => {
    expect(serializeDatesParam({ start: "2026-07-18", end: "2026-07-20" })).toBe("2026-07-18..2026-07-20");
    expect(serializeDatesParam({ start: "2026-07-18", end: "2026-07-18" })).toBe("2026-07-18..2026-07-18");
  });

  it("round-trips through parseDatesParam", () => {
    const ranges: DateFilterRange[] = [
      { start: "2026-07-18", end: "2026-07-20" },
      { start: "2026-07-18", end: "2026-07-18" },
      { start: "2026-08-30", end: "2026-09-02" }, // crosses a month boundary
    ];
    for (const range of ranges) {
      expect(parseDatesParam(serializeDatesParam(range))).toEqual(range);
    }
  });
});

describe("clampRangeToToday", () => {
  it("passes null through", () => {
    expect(clampRangeToToday(null, TODAY)).toBeNull();
  });

  it("drops a window entirely in the past", () => {
    expect(clampRangeToToday({ start: "2020-01-01", end: "2020-01-02" }, TODAY)).toBeNull();
  });

  it("pulls the start of a straddling window forward to today", () => {
    expect(clampRangeToToday({ start: "2026-07-10", end: "2026-07-20" }, TODAY)).toEqual({
      start: TODAY,
      end: "2026-07-20",
    });
  });

  it("leaves a fully-future window untouched", () => {
    const future = { start: "2026-07-18", end: "2026-07-20" };
    expect(clampRangeToToday(future, TODAY)).toEqual(future);
  });

  it("keeps a single day that is today", () => {
    expect(clampRangeToToday({ start: TODAY, end: TODAY }, TODAY)).toEqual({ start: TODAY, end: TODAY });
  });
});

describe("datesToApiParams", () => {
  it("emits nothing for a null range", () => {
    expect(datesToApiParams(null)).toEqual({});
  });

  // One-sidedness is unrepresentable here — the range type has both ends and this returns
  // a single object literal. The both-or-neither rule that can actually be BROKEN lives on
  // the wire, where a lone bound is a 400; it is pinned in listing-filters.test.ts against
  // buildListingsUrl.
  it("emits both inclusive bounds", () => {
    expect(datesToApiParams({ start: "2026-07-18", end: "2026-07-20" }))
      .toEqual({ availableFrom: "2026-07-18", availableTo: "2026-07-20" });
  });
});

describe("dateBandArgs", () => {
  it("formats both ends for the locale, with the day number present", () => {
    const [from, to] = dateBandArgs({ start: "2026-07-18", end: "2026-07-20" }, "en");
    expect(from).toMatch(/18/);
    expect(to).toMatch(/20/);
    // LT renders the genitive month name ("liepos"), never a bare numeric month.
    const [ltFrom] = dateBandArgs({ start: "2026-07-18", end: "2026-07-20" }, "lt");
    expect(ltFrom).toMatch(/liepos/);
  });

  it("yields two equal strings for a single-day window", () => {
    const [from, to] = dateBandArgs({ start: "2026-07-18", end: "2026-07-18" }, "en");
    expect(from).toBe(to);
  });
});
