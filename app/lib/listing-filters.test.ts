// The WIRING layer: how a URL's `?dates=` / `?price=` become a React Query key and a
// backend URL. date-filter.ts and price-range.ts unit-test the codecs in isolation; the
// bugs that actually reach users live in the seams between them and their two callers.
//
// The seam this file exists for: a date-filtered feed is rendered TWICE — once on the
// server (which prefetches into a dehydrated cache) and once on the client's first render
// (which must hit that cache). Both derive the query key from the same URL, but only the
// server can read "today". If they disagree by so much as one key slot the prefetch is
// silently discarded and the feed refetches a window the backend answers with an empty
// page. That is invisible to every other kind of test here, and it shipped once.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalogueFiltersFromSearch } from "@/app/lib/landing-params";
import { buildListingsUrl, listingsInfiniteKey, listingsKey } from "@/app/lib/listings";
import { clampRangeToToday, datesToApiParams, parseDatesParam, serializeDatesParam } from "@/app/lib/date-filter";
import { depositToParams, parseDepositParam, serializeDepositParam } from "@/app/lib/deposit-filter";
import { todayInMarket } from "@/app/lib/dates";

// 12:00 in Vilnius — comfortably inside one market day, so "today" is unambiguous.
const NOW = new Date("2026-07-16T09:00:00Z");
const TODAY = "2026-07-16";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

// FeedScreen's first client render, reproduced exactly: it reads the RAW token out of the
// URL (datesParamToken → structural only), and `useMarketToday(serverToday)` yields the
// server's date because the live one is undefined until mount.
function feedFirstRenderKey(rawToken: string, serverToday: string | undefined) {
  const paramsDates = serializeDatesParam(parseDatesParam(rawToken));
  const parsed = parseDatesParam(paramsDates);
  const range = serverToday ? clampRangeToToday(parsed, serverToday) : parsed;
  return listingsInfiniteKey("lt", { ...datesToApiParams(range) });
}

// /skelbimai's server prefetch: page.tsx → filtersFromSearch → catalogueFiltersFromSearch.
function serverPrefetchKey(rawToken: string) {
  return listingsInfiniteKey("lt", catalogueFiltersFromSearch({ dates: rawToken }));
}

describe("todayInMarket (the fixture's own premise)", () => {
  it("reads the market day, not UTC", () => {
    expect(todayInMarket()).toBe(TODAY);
    // 01:00 Vilnius is still the PREVIOUS UTC day — if this ever reads 2026-07-16 the
    // market timezone has been lost and every clamp below is testing the wrong day.
    vi.setSystemTime(new Date("2026-07-16T22:00:00Z"));
    expect(todayInMarket()).toBe("2026-07-17");
  });
});

describe("server prefetch key vs the client's first-render key", () => {
  it("agree on a STRADDLING window (the shared-link case)", () => {
    const token = "2026-07-10..2026-07-20"; // opened after it started
    expect(feedFirstRenderKey(token, todayInMarket())).toEqual(serverPrefetchKey(token));
    // ...and the agreed-on window is the clamped one, not the raw one.
    expect(serverPrefetchKey(token)).toContain(TODAY);
  });

  it("agree on a FULLY PAST window — both drop the filter", () => {
    const token = "2026-07-01..2026-07-02";
    expect(feedFirstRenderKey(token, todayInMarket())).toEqual(serverPrefetchKey(token));
    expect(serverPrefetchKey(token)).toEqual(listingsInfiniteKey("lt", {}));
  });

  it("agree on a FULLY FUTURE window, where the clamp is a no-op", () => {
    const token = "2026-08-01..2026-08-05";
    expect(feedFirstRenderKey(token, todayInMarket())).toEqual(serverPrefetchKey(token));
    expect(serverPrefetchKey(token)).toContain("2026-08-01");
  });

  it("agree on an unusable token", () => {
    for (const token of ["", "garbage", "2026-07-20..2026-07-10", "2026-01-01..2026-12-31"]) {
      expect(feedFirstRenderKey(token, todayInMarket())).toEqual(serverPrefetchKey(token));
    }
  });

  // The reason FeedScreen takes a `serverToday` at all. Without it the client's first
  // render has no "today", keys off the RAW window, misses the dehydrated prefetch and
  // fires a throwaway request whose past `available_from` returns an empty page. If this
  // ever stops failing, the clamp has moved and the prop is dead weight.
  it("DIVERGE on a straddling window when the client has no serverToday", () => {
    const token = "2026-07-10..2026-07-20";
    expect(feedFirstRenderKey(token, undefined)).not.toEqual(serverPrefetchKey(token));
  });
});

describe("listingsKey / listingsInfiniteKey", () => {
  // A filter that reaches the URL but not the key = a stale cache: two different result
  // sets served under one key.
  it("carry the availability window", () => {
    const filters = { availableFrom: "2026-07-18", availableTo: "2026-07-20" };
    expect(listingsKey("lt", filters)).not.toEqual(listingsKey("lt", {}));
    expect(listingsInfiniteKey("lt", filters)).not.toEqual(listingsInfiniteKey("lt", {}));
  });

  it("carry the price bounds", () => {
    expect(listingsKey("lt", { priceMinCents: 1000 })).not.toEqual(listingsKey("lt", {}));
    expect(listingsKey("lt", { priceMaxCents: 6000 })).not.toEqual(listingsKey("lt", {}));
  });

  // The deposit spec's #1 trap: a deposit filter absent from the key would serve
  // "No deposit" and "Any" from the same cache entry.
  it("carry the deposit filter", () => {
    expect(listingsKey("lt", { depositRequired: false })).not.toEqual(listingsKey("lt", {}));
    expect(listingsKey("lt", { depositMaxCents: 5000 })).not.toEqual(listingsKey("lt", {}));
    expect(listingsInfiniteKey("lt", { depositRequired: false })).not.toEqual(listingsInfiniteKey("lt", {}));
    expect(listingsInfiniteKey("lt", { depositMaxCents: 5000 })).not.toEqual(listingsInfiniteKey("lt", {}));
  });

  it("separate the two caches and keep locale significant", () => {
    expect(listingsKey("lt", {})).not.toEqual(listingsInfiniteKey("lt", {}));
    expect(listingsKey("lt", {})).not.toEqual(listingsKey("en", {}));
  });
});

describe("buildListingsUrl", () => {
  // `sort` is unconditional (an empty filter set still sends created_at_desc), so it is
  // part of every expectation below rather than hidden behind a helper.
  const params = (filters: Parameters<typeof buildListingsUrl>[0]) =>
    Object.fromEntries(buildListingsUrl(filters).searchParams);
  const SORT = { sort: "created_at_desc" };

  it("sends a sort even with no filters at all", () => {
    expect(params({})).toEqual(SORT);
    expect(params({ sort: "price_asc" })).toEqual({ sort: "price_asc" });
  });

  it("emits both availability bounds together", () => {
    expect(params({ availableFrom: "2026-07-18", availableTo: "2026-07-20" })).toEqual({
      ...SORT,
      available_from: "2026-07-18",
      available_to: "2026-07-20",
    });
  });

  // The backend 400s a lone bound. Dropping it is what makes that unreachable, so this
  // pins a wire contract rather than a preference — see docs/backend-date-filter-contract.md.
  it("drops a LONE availability bound rather than 400ing the backend", () => {
    expect(params({ availableFrom: "2026-07-18" })).toEqual(SORT);
    expect(params({ availableTo: "2026-07-20" })).toEqual(SORT);
  });

  it("omits an open price bound instead of sending the slider's edge", () => {
    // €10+ : a min only. Sending price_max_cents=20000 would hide everything dearer.
    expect(params({ priceMinCents: 1000 })).toEqual({ ...SORT, price_min_cents: "1000" });
    // ...but an explicit 0 is a real bound, not an absent one.
    expect(params({ priceMaxCents: 0 })).toEqual({ ...SORT, price_max_cents: "0" });
  });

  it("passes the catalogue filters through", () => {
    expect(params({ q: "grąžtas", city: "Vilnius", category: "tools", deliveryMethods: ["user_delivery"] }))
      .toEqual({ ...SORT, q: "grąžtas", city: "Vilnius", category_id: "tools", delivery_methods: "user_delivery" });
  });

  it("emits the deposit filter's two exclusive shapes", () => {
    expect(params({ depositRequired: false })).toEqual({ ...SORT, deposit_required: "false" });
    // A ceiling goes out ALONE: pairing it with deposit_required=true would drop the
    // no-deposit listings a ceiling is defined to admit.
    expect(params({ depositMaxCents: 15000 })).toEqual({ ...SORT, deposit_max_cents: "15000" });
  });
});

describe("?deposit= across the server prefetch and the client's first render", () => {
  // FeedScreen's first render: depositParamToken (raw → canonical token) → parse →
  // wire params. Deposit is time-independent, so unlike dates there is no serverToday
  // — this pins that catalogueFiltersFromSearch and the feed derive the same key
  // from the same URL, junk tokens included.
  function feedDepositKey(rawToken: string) {
    const token = serializeDepositParam(parseDepositParam(rawToken));
    return listingsInfiniteKey("lt", { ...depositToParams(parseDepositParam(token)) });
  }

  it("agree for every token shape", () => {
    for (const token of ["none", "50", "500", "", "junk", "0", "49.5", "501"]) {
      expect(feedDepositKey(token)).toEqual(listingsInfiniteKey("lt", catalogueFiltersFromSearch({ deposit: token })));
    }
  });

  it("drop an unusable token back to the unfiltered key", () => {
    // "500" is unusable too: an at-ceiling bound admits everything, so it must
    // collapse rather than occupy a distinct cache slot for identical results.
    for (const token of ["junk", "500", "49.5"]) {
      expect(listingsInfiniteKey("lt", catalogueFiltersFromSearch({ deposit: token })))
        .toEqual(listingsInfiniteKey("lt", {}));
    }
  });
});
