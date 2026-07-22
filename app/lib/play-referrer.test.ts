import { describe, expect, it } from "vitest";
import { listingAppPath, listingIdFromAppPath } from "./app-links";
import { playStoreUrlWithReferrer } from "./play-referrer";

const PLAY = "https://play.google.com/store/apps/details?id=com.naudokis.naudokis";

// What the app parses out of the referrer: the string is itself a query string.
const referrerOf = (url: string) => {
  const raw = new URL(url).searchParams.get("referrer");
  return raw === null ? null : new URLSearchParams(raw);
};

describe("playStoreUrlWithReferrer", () => {
  it("carries the listing target in the referrer", () => {
    const referrer = referrerOf(playStoreUrlWithReferrer(PLAY, "/listing/abc123"));
    expect(referrer?.get("deep_link_value")).toBe("listing");
    expect(referrer?.get("deep_link_sub1")).toBe("abc123");
  });

  it("keeps the package id intact", () => {
    const url = new URL(playStoreUrlWithReferrer(PLAY, "/listing/abc123"));
    expect(url.searchParams.get("id")).toBe("com.naudokis.naudokis");
    expect(url.origin + url.pathname).toBe("https://play.google.com/store/apps/details");
  });

  // An empty referrer is worse than no referrer: it reads as a wiring bug later.
  it("returns the bare store URL when there is no target", () => {
    expect(playStoreUrlWithReferrer(PLAY)).toBe(PLAY);
    expect(playStoreUrlWithReferrer(PLAY, "/listing")).toBe(PLAY);
  });

  // /go's APP_PATH only admits /listing, but this must not silently invent a
  // referrer if that ever widens.
  it("ignores a non-listing path", () => {
    expect(playStoreUrlWithReferrer(PLAY, "/chat/42")).toBe(PLAY);
  });

  it("strips a date query out of the id", () => {
    const referrer = referrerOf(playStoreUrlWithReferrer(PLAY, "/listing/abc123?start_date=2026-07-18"));
    expect(referrer?.get("deep_link_sub1")).toBe("abc123");
  });

  // Only the navigational target travels. Campaign data is analytics and stays
  // behind consent — this URL is the path taken by visitors who declined.
  it("carries no campaign or attribution keys", () => {
    const referrer = referrerOf(playStoreUrlWithReferrer(PLAY, "/listing/abc123"));
    expect([...(referrer?.keys() ?? [])].sort()).toEqual(["deep_link_sub1", "deep_link_value"]);
  });
});

// The web writes listing app paths in one place and parses them back in two. If
// these ever disagree the failure is silent on both sides.
describe("listingAppPath / listingIdFromAppPath round-trip", () => {
  it.each(["abc123", "550e8400-e29b-41d4-a716-446655440000", "42"])("round-trips %s", (id) => {
    expect(listingIdFromAppPath(listingAppPath(id))).toBe(id);
  });

  it("round-trips a dated path, which is what ships if APP_READS_DEEPLINK_DATES flips", () => {
    const dated = "/listing/abc123?start_date=2026-07-18&end_date=2026-07-21";
    expect(listingIdFromAppPath(dated)).toBe("abc123");
  });
});
