import { describe, expect, it } from "vitest";
import { listingFilterPath, listingLandingPath, paginatedFeedPath } from "./landing-routes";
import { localePath } from "@/app/lib/i18n/config";

// Page 2+ of a filtered feed is the one landing state with no pretty URL. The pretty
// landings are prerendered and take no searchParams, so "/nuoma/irankiai?page=2"
// renders page-1 content — pointing a canonical there would advertise duplicate
// content under a page-2 URL, silently and with a 200.
//
// Two things therefore have to agree, and neither is visible in a rendered page:
// the canonical /skelbimai emits (app/[lang]/skelbimai/page.tsx) and the href
// FeedScreen's pager links to (pageHref). Both are built from this function.
describe("paginatedFeedPath", () => {
  it("keeps a deep page on the query-param feed, which can actually serve it", () => {
    expect(paginatedFeedPath({ category: "tools_construction" }, 2))
      .toBe("/skelbimai?cat=tools_construction&page=2");
    // …and never on the pretty landing, which would ignore the page.
    expect(paginatedFeedPath({ category: "tools_construction" }, 2))
      .not.toBe(`${listingLandingPath({ category: "tools_construction" })}?page=2`);
  });

  it("carries every filter the landing had, so page 2 shows the same result set", () => {
    expect(paginatedFeedPath({ category: "tools_construction", city: "Vilnius" }, 3))
      .toBe("/skelbimai?cat=tools_construction&city=Vilnius&page=3");
    // A subcategory is the more specific filter and wins over its parent, matching
    // the single `?cat=` the feed actually filters on.
    expect(paginatedFeedPath({ category: "tools_construction", subcategory: "power_tools" }, 2))
      .toBe("/skelbimai?cat=power_tools&page=2");
  });

  it("starts the query when there are no filters to carry", () => {
    // The unfiltered feed has no "?" yet, so the page param must open one rather than
    // append to nothing — "/skelbimai&page=2" would be a path, not a query.
    expect(listingFilterPath({})).toBe("/skelbimai");
    expect(paginatedFeedPath({}, 2)).toBe("/skelbimai?page=2");
  });

  it("survives locale translation with its query intact", () => {
    // The canonical is built from the internal path, then localized at the boundary.
    expect(localePath("en", paginatedFeedPath({ category: "tools_construction" }, 2)))
      .toBe("/en/listings?cat=tools_construction&page=2");
  });
});
