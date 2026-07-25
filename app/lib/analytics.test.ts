import { afterEach, describe, expect, it, vi } from "vitest";
import { toGaEventName, trackEvent } from "./analytics";

describe("toGaEventName", () => {
  it("maps readable event names to GA4 snake_case", () => {
    expect(toGaEventName("App Bridge Open")).toBe("app_bridge_open");
    expect(toGaEventName("Analytics Consent")).toBe("analytics_consent");
  });

  it("leaves already-conforming names alone", () => {
    expect(toGaEventName("app_store_click")).toBe("app_store_click");
  });

  it("collapses punctuation runs and trims edge underscores", () => {
    expect(toGaEventName("  Spaced --- Name!  ")).toBe("spaced_name");
  });

  // "Google Maps Loaded" would have recorded under Google's reserved namespace;
  // the strip is why that call site is named "Maps Embed Loaded" instead.
  it("strips the reserved google_/ga_/firebase_ prefixes, chained", () => {
    expect(toGaEventName("Google Maps Loaded")).toBe("maps_loaded");
    expect(toGaEventName("GA Firebase Google Event")).toBe("event");
  });

  it("caps at GA4's 40-character name limit", () => {
    expect(toGaEventName("A".repeat(60))).toHaveLength(40);
  });
});

describe("trackEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the mapped name and prunes null/undefined props", () => {
    const calls: unknown[][] = [];
    vi.stubGlobal("window", { gtag: (...args: unknown[]) => calls.push(args) });
    trackEvent("App Bridge Open", { placement: "hero", os: null, count: 2, missing: undefined });
    expect(calls).toEqual([["event", "app_bridge_open", { placement: "hero", count: 2 }]]);
  });

  it("no-ops when gtag is absent (no GA id, token page, script blocked)", () => {
    vi.stubGlobal("window", {});
    expect(() => trackEvent("App Bridge Open")).not.toThrow();
  });
});
