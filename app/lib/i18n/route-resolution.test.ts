import { describe, expect, it } from "vitest";
import { resolveLocaleRouting, type LocaleRouting } from "@/app/lib/i18n/route-resolution";

const route = (pathname: string, options: { marker?: string; acceptLanguage?: string } = {}) =>
  resolveLocaleRouting({
    pathname,
    marker: options.marker ?? null,
    acceptLanguage: options.acceptLanguage ?? null,
  });

// Walk the proxy the way Next does — re-entering on every rewrite destination — and
// return the hops. Throws instead of hanging if it fails to settle, so a loop shows
// up as a test failure rather than a stuck run.
function settle(pathname: string, acceptLanguage: string | null = null) {
  const hops: LocaleRouting[] = [];
  let current = pathname;
  let marker: string | null = null;
  for (let i = 0; i < 10; i += 1) {
    const result = route(current, { marker: marker ?? undefined, acceptLanguage: acceptLanguage ?? undefined });
    hops.push(result);
    if (result.kind === "next") {
      return { hops, final: current };
    }
    if (result.kind === "redirect") {
      // A browser follows the redirect as a fresh request — the marker does not survive.
      marker = null;
    } else {
      marker = "1";
    }
    current = result.pathname;
  }
  throw new Error(`routing did not settle for ${pathname}: ${JSON.stringify(hops)}`);
}

describe("default locale", () => {
  it("rewrites the unprefixed path to the internal segment", () => {
    expect(route("/")).toEqual({ kind: "rewrite", pathname: "/lt" });
    expect(route("/skelbimai")).toEqual({ kind: "rewrite", pathname: "/lt/skelbimai" });
    expect(route("/nuoma/irankiai-statyba")).toEqual({ kind: "rewrite", pathname: "/lt/nuoma/irankiai-statyba" });
  });

  it("passes the marked internal path straight through", () => {
    expect(route("/lt/skelbimai", { marker: "1" })).toEqual({ kind: "next" });
  });

  it("308s an explicit /lt URL back to the bare path", () => {
    expect(route("/lt")).toEqual({ kind: "redirect", pathname: "/", status: 308 });
    expect(route("/lt/skelbimai")).toEqual({ kind: "redirect", pathname: "/skelbimai", status: 308 });
  });

  it("never translates segments for the default locale", () => {
    // ROUTE_SEGMENTS.lt is identity, so there is no segment to canonicalize here —
    // "/listings" is simply not a route.
    expect(route("/listings")).toEqual({ kind: "rewrite", pathname: "/lt/listings" });
  });

  it("308s an English taxonomy slug served unprefixed", () => {
    // The English spelling resolves under Lithuanian too; without this it would
    // serve a duplicate of the canonical landing.
    expect(route("/nuoma/tools-construction")).toEqual({
      kind: "redirect", pathname: "/nuoma/irankiai-statyba", status: 308,
    });
    expect(route("/nuoma/irankiai-statyba")).toEqual({
      kind: "rewrite", pathname: "/lt/nuoma/irankiai-statyba",
    });
  });

  it("leaves an owner-authored listing slug alone", () => {
    const path = "/skelbimai/nuoma-kita-vilnius-11111111-2222-3333-4444-555555555555";
    expect(route(path)).toEqual({ kind: "rewrite", pathname: `/lt${path}` });
  });
});

describe("English", () => {
  it("rewrites the localized path to the internal route", () => {
    expect(route("/en/listings")).toEqual({ kind: "rewrite", pathname: "/en/skelbimai" });
    expect(route("/en/rent/tools-construction")).toEqual({ kind: "rewrite", pathname: "/en/nuoma/tools-construction" });
    expect(route("/en/cities/vilnius")).toEqual({ kind: "rewrite", pathname: "/en/miestai/vilnius" });
    expect(route("/en/how-it-works")).toEqual({ kind: "rewrite", pathname: "/en/kaip-tai-veikia" });
  });

  it("308s a wrong-locale taxonomy slug to this locale's spelling", () => {
    expect(route("/en/rent/irankiai-statyba")).toEqual({
      kind: "redirect", pathname: "/en/rent/tools-construction", status: 308,
    });
  });

  it("fixes a fully legacy URL — segments AND slugs — in a single hop", () => {
    // Two hops would be the natural outcome of canonicalizing these separately.
    expect(route("/en/nuoma/irankiai-statyba")).toEqual({
      kind: "redirect", pathname: "/en/rent/tools-construction", status: 308,
    });
    expect(route("/en/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius")).toEqual({
      kind: "redirect", pathname: "/en/rent/tools-construction/power-tools/vilnius", status: 308,
    });
  });

  it("rewrites a canonical English URL, keeping the slug in its own spelling", () => {
    // The route resolves the slug against its own locale, so the rewrite translates
    // segments only.
    expect(route("/en/rent/tools-construction")).toEqual({
      kind: "rewrite", pathname: "/en/nuoma/tools-construction",
    });
  });

  it("passes /en itself and already-internal marked paths through", () => {
    expect(route("/en")).toEqual({ kind: "next" });
    expect(route("/en/skelbimai", { marker: "1" })).toEqual({ kind: "next" });
  });

  it("308s a legacy Lithuanian-segment English URL to the localized one", () => {
    expect(route("/en/skelbimai")).toEqual({ kind: "redirect", pathname: "/en/listings", status: 308 });
    // Retired AND wrong-locale: still one hop, straight to the moved English URL.
    expect(route("/en/kategorijos")).toEqual({ kind: "redirect", pathname: "/en/rent", status: 308 });
    expect(route("/en/miestai/vilnius")).toEqual({ kind: "redirect", pathname: "/en/cities/vilnius", status: 308 });
  });

  // MOVED_PATHS: the category directory moved from /kategorijos to /nuoma, so it now
  // indexes the landing tier it links into. Every public spelling of the old URL has
  // to land on the new one in ONE hop — a chain would burn crawl budget and, because
  // these are 308s, would cache a two-step path in every client that saw it.
  it("308s the retired /kategorijos to /nuoma in one hop, per locale", () => {
    expect(route("/kategorijos")).toEqual({ kind: "redirect", pathname: "/nuoma", status: 308 });
    expect(route("/en/categories")).toEqual({ kind: "redirect", pathname: "/en/rent", status: 308 });
  });

  it("serves the new location without redirecting", () => {
    expect(route("/nuoma")).toEqual({ kind: "rewrite", pathname: "/lt/nuoma" });
    expect(route("/en/rent")).toEqual({ kind: "rewrite", pathname: "/en/nuoma" });
  });

  // The move is keyed on the exact path, so the landing tier below it is untouched —
  // this is what makes it a one-URL change rather than a re-slug of every landing.
  it("leaves the landings under /nuoma alone", () => {
    expect(route("/nuoma/irankiai-statyba")).toEqual({ kind: "rewrite", pathname: "/lt/nuoma/irankiai-statyba" });
    expect(route("/en/rent/tools-construction/power-tools/vilnius")).toEqual({
      kind: "rewrite",
      pathname: "/en/nuoma/tools-construction/power-tools/vilnius",
    });
  });

  // See NO_REDIRECT_SEGMENTS: the old site's "/en/terms-of-service" → Lithuanian 308
  // is cached in clients forever, so redirecting the Lithuanian form back would loop
  // inside the browser's own cache. These must stay 200 permanently.
  it("never redirects the legacy legal URLs — a cached 308 would make it a loop", () => {
    for (const path of ["/en/naudojimosi-salygos", "/en/privatumo-politika", "/en/paskyros-trynimas"]) {
      const result = route(path);
      expect(result.kind).not.toBe("redirect");
    }
    expect(route("/en/terms-of-service")).toEqual({ kind: "rewrite", pathname: "/en/naudojimosi-salygos" });
  });
});

describe("app-handoff paths", () => {
  it("negotiates the locale from Accept-Language and never redirects", () => {
    expect(route("/chat/abc", { acceptLanguage: "en-GB,en;q=0.9" }))
      .toEqual({ kind: "rewrite", pathname: "/en/chat/abc" });
    expect(route("/chat/abc", { acceptLanguage: "lt" }))
      .toEqual({ kind: "rewrite", pathname: "/lt/chat/abc" });
    expect(route("/reset-password")).toEqual({ kind: "rewrite", pathname: "/lt/reset-password" });
  });

  it("keeps non-handoff paths on the default locale regardless of Accept-Language", () => {
    expect(route("/skelbimai", { acceptLanguage: "en-GB,en;q=0.9" }))
      .toEqual({ kind: "rewrite", pathname: "/lt/skelbimai" });
  });
});

describe("loop freedom", () => {
  const paths = [
    "/", "/skelbimai", "/kategorijos", "/nuoma/irankiai-statyba",
    "/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius", "/miestai/vilnius",
    "/en", "/en/listings", "/en/rent/tools-construction",
    "/en/rent/tools-construction/power-tools/vilnius", "/en/cities/vilnius",
    "/en/categories", "/en/how-it-works", "/en/terms-of-service",
    // legacy + wrong-locale spellings
    "/en/skelbimai", "/en/nuoma/irankiai-statyba", "/en/miestai/vilnius",
    "/en/rent/irankiai-statyba", "/nuoma/tools-construction",
    "/en/kategorijos", "/en/kaip-tai-veikia", "/en/naudojimosi-salygos",
    "/lt", "/lt/skelbimai", "/listings",
    // handoff + unknown
    "/invite", "/chat/abc", "/listing/abc", "/ref/CODE", "/nonexistent",
  ];

  it("settles every path, with at most one redirect", () => {
    for (const path of paths) {
      const { hops } = settle(path);
      const redirects = hops.filter((hop) => hop.kind === "redirect");
      expect(redirects.length, `${path} redirected ${redirects.length}×`).toBeLessThanOrEqual(1);
    }
  });

  it("settles on an internal path that a route can serve", () => {
    expect(settle("/en/listings").final).toBe("/en/skelbimai");
    expect(settle("/en/skelbimai").final).toBe("/en/skelbimai");
    expect(settle("/skelbimai").final).toBe("/lt/skelbimai");
    expect(settle("/lt/skelbimai").final).toBe("/lt/skelbimai");
    expect(settle("/en/naudojimosi-salygos").final).toBe("/en/naudojimosi-salygos");
    expect(settle("/en/terms-of-service").final).toBe("/en/naudojimosi-salygos");
  });
});
