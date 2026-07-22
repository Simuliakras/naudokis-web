import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SITE_URL,
  NOINDEX_FOLLOW,
  MIN_INDEXABLE_LISTINGS,
  canonicalFor,
  ltPath,
  webSiteId,
  absoluteUrl,
  pageMetadata,
  resolveListingLanding,
  verificationMeta,
  organizationJsonLd,
  listingJsonLd,
  itemListJsonLd,
} from "./seo";
import type { Category } from "./categories";

// Canonical/hreflang correctness is the one SEO property with no visible symptom
// when it breaks: a wrong canonical silently de-indexes a page or collapses two
// locales into one. These lock the URL shapes down.

describe("locale URL shapes", () => {
  it("keeps Lithuanian unprefixed and both prefixes AND translates English", () => {
    expect(ltPath("/kategorijos")).toBe("/kategorijos");
    expect(canonicalFor("lt", "/kategorijos")).toBe("/kategorijos");
    // The English URL is a translation of the route, not the Lithuanian path with a
    // prefix bolted on — see app/lib/i18n/routes.ts.
    expect(canonicalFor("en", "/kategorijos")).toBe("/en/categories");
    expect(canonicalFor("en", "/nuoma/irankiai-statyba")).toBe("/en/rent/tools-construction");
  });

  it("renders the home path as / rather than an empty string", () => {
    expect(ltPath("")).toBe("/");
    expect(canonicalFor("lt", "")).toBe("/");
    expect(canonicalFor("en", "")).toBe("/en");
  });

  it("builds absolute URLs on the canonical www origin", () => {
    expect(SITE_URL).toBe("https://www.naudokis.lt");
    expect(absoluteUrl("lt", "/skelbimai")).toBe("https://www.naudokis.lt/skelbimai");
    expect(absoluteUrl("en", "/skelbimai")).toBe("https://www.naudokis.lt/en/listings");
  });

  it("gives each locale its own WebSite @id", () => {
    expect(webSiteId("lt")).toBe("https://www.naudokis.lt/#website");
    expect(webSiteId("en")).toBe("https://www.naudokis.lt/en/#website");
    expect(webSiteId("lt")).not.toBe(webSiteId("en"));
  });
});

const page = (locale: "lt" | "en", extra: Partial<Parameters<typeof pageMetadata>[0]> = {}) =>
  pageMetadata({
    locale,
    path: "/kategorijos",
    title: "Kategorijos",
    description: "Visos nuomos kategorijos.",
    ogLocale: locale === "lt" ? "lt_LT" : "en_GB",
    ogImageAlt: "Kategorijos",
    ...extra,
  });

describe("pageMetadata", () => {
  it("points the canonical at the locale's own URL", () => {
    expect(page("lt").alternates?.canonical).toBe("/kategorijos");
    expect(page("en").alternates?.canonical).toBe("/en/categories");
  });

  it("declares both locales plus an x-default pointing at Lithuanian", () => {
    // Identical for both renders: hreflang describes the cluster, not the page.
    for (const locale of ["lt", "en"] as const) {
      expect(page(locale).alternates?.languages).toEqual({
        lt: "/kategorijos",
        en: "/en/categories",
        "x-default": "/kategorijos",
      });
    }
  });

  it("resolves relative alternates against the canonical origin", () => {
    expect(page("lt").metadataBase?.toString()).toBe("https://www.naudokis.lt/");
  });

  it("leaves an ordinary page indexable", () => {
    expect(page("lt").robots).toBeUndefined();
  });

  it("falls back to the localized social card and lets a page image win", () => {
    const openGraph = page("en").openGraph;
    expect(openGraph?.images).toEqual([
      { url: "https://www.naudokis.lt/en/social-card", width: 1200, height: 630, alt: "Kategorijos" },
    ]);
    const withPhoto = page("en", { image: "https://cdn.example/listing.jpg" }).openGraph;
    expect(withPhoto?.images).toEqual([{ url: "https://cdn.example/listing.jpg", alt: "Kategorijos" }]);
  });

  it("keeps LT-only content canonical to LT and noindexes the /en duplicate", () => {
    const lt = page("lt", { ltOnly: true });
    const en = page("en", { ltOnly: true });
    expect(lt.alternates?.canonical).toBe("/kategorijos");
    // The English render must not claim its own URL — that would index the same
    // Lithuanian text twice.
    expect(en.alternates?.canonical).toBe("/kategorijos");
    expect(en.alternates?.languages).toEqual({ lt: "/kategorijos", "x-default": "/kategorijos" });
    expect(en.robots).toEqual(NOINDEX_FOLLOW);
    expect(lt.robots).toBeUndefined();
  });
});

describe("indexation thresholds", () => {
  it("keeps thin pages crawlable while withholding them from the index", () => {
    // `follow` matters: link equity still has to flow through a thin landing.
    expect(NOINDEX_FOLLOW).toEqual({ index: false, follow: true });
  });

  it("requires a meaningful choice set before recommending a landing", () => {
    expect(MIN_INDEXABLE_LISTINGS).toBeGreaterThan(1);
  });
});

const category = (over: Partial<Category> = {}): Category => ({
  id: "tools",
  title: "Įrankiai",
  level: 0,
  icon: "Tag",
  seoTitle: "Įrankių nuoma",
  seoBody: "Įrankiai nuomai visoje Lietuvoje.",
  metaTitle: "Įrankių nuoma | Naudokis.lt",
  metaDescription: "Išsinuomok įrankius netoliese.",
  ...over,
});

describe("resolveListingLanding", () => {
  const categories = [category(), category({ id: "drills", title: "Grąžtai", parentId: "tools" })];

  it("canonicalizes a category filter onto its pretty landing path", () => {
    const landing = resolveListingLanding({ catParam: "tools", cityParam: "", categories });
    expect(landing.category?.id).toBe("tools");
    expect(landing.hasInvalidCategory).toBe(false);
    expect(landing.path.startsWith("/nuoma/")).toBe(true);
  });

  it("canonicalizes a city filter onto its pretty landing path", () => {
    const landing = resolveListingLanding({ catParam: "", cityParam: "Vilnius", categories });
    expect(landing.city).toBe("Vilnius");
    expect(landing.path.startsWith("/miestai/")).toBe(true);
  });

  it("flags junk filter values so they can be kept out of the index", () => {
    const landing = resolveListingLanding({ catParam: "nope", cityParam: "Atlantis", categories });
    expect(landing.hasInvalidCategory).toBe(true);
    expect(landing.hasInvalidCity).toBe(true);
    expect(landing.category).toBeUndefined();
  });

  it("treats no filters as the bare feed", () => {
    const landing = resolveListingLanding({ catParam: "", cityParam: "", categories });
    expect(landing.hasInvalidCategory).toBe(false);
    expect(landing.hasInvalidCity).toBe(false);
  });
});

describe("verificationMeta", () => {
  // stubEnv restores through afterEach even when an assertion throws mid-test —
  // a leaked token would silently arm every later case in the file.
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("emits nothing when no token is configured", () => {
    vi.stubEnv("GOOGLE_SITE_VERIFICATION", undefined);
    vi.stubEnv("BING_SITE_VERIFICATION", undefined);
    expect(verificationMeta()).toBeUndefined();
  });

  it("emits the Google token on its own", () => {
    vi.stubEnv("GOOGLE_SITE_VERIFICATION", "goog-token");
    vi.stubEnv("BING_SITE_VERIFICATION", undefined);
    expect(verificationMeta()).toEqual({ google: "goog-token" });
  });

  it("emits the Bing token on its own, under its msvalidate key", () => {
    vi.stubEnv("GOOGLE_SITE_VERIFICATION", undefined);
    vi.stubEnv("BING_SITE_VERIFICATION", "bing-token");
    expect(verificationMeta()).toEqual({ other: { "msvalidate.01": "bing-token" } });
  });

  it("emits both when both are configured", () => {
    vi.stubEnv("GOOGLE_SITE_VERIFICATION", "goog-token");
    vi.stubEnv("BING_SITE_VERIFICATION", "bing-token");
    expect(verificationMeta()).toEqual({ google: "goog-token", other: { "msvalidate.01": "bing-token" } });
  });
});

// Structured data must never assert a fact the site cannot observe. Each of these
// guards a specific claim we decided not to publish; see the comments in seo.ts.
describe("JSON-LD honesty guards", () => {
  const listing = {
    locale: "lt" as const,
    id: "abc123",
    name: "Grąžtas",
    description: "Galingas grąžtas.",
    priceCents: 1500,
    ratingAverage: null,
    ratingCount: 0,
  };

  it("never claims rental availability", () => {
    // Offer.availability is date-independent; a rental's is not, and this page is
    // ISR-cached. Emitting "InStock" would keep asserting a booked item is free.
    const node = listingJsonLd(listing);
    expect(JSON.stringify(node)).not.toContain("availability");
  });

  it("represents a listing as a lease, never a sale", () => {
    const offers = listingJsonLd(listing).offers as Record<string, unknown>;
    expect(offers.businessFunction).toBe("http://purl.org/goodrelations/v1#LeaseOut");
    expect(offers.price).toBe("15.00");
    expect(offers.priceCurrency).toBe("EUR");
  });

  it("omits the seller until the wire states whether the owner is a business", () => {
    const unknown = listingJsonLd({ ...listing, sellerName: "Jonas" }).offers as Record<string, unknown>;
    expect(unknown.seller).toBeUndefined();
    const known = listingJsonLd({ ...listing, sellerName: "Jonas", sellerIsBusiness: false })
      .offers as Record<string, unknown>;
    expect(known.seller).toEqual({ "@type": "Person", name: "Jonas" });
    const business = listingJsonLd({ ...listing, sellerName: "UAB X", sellerIsBusiness: true })
      .offers as Record<string, unknown>;
    expect(business.seller).toEqual({ "@type": "Organization", name: "UAB X" });
  });

  it("omits aggregateRating until there is at least one review", () => {
    expect(listingJsonLd(listing).aggregateRating).toBeUndefined();
    expect(listingJsonLd({ ...listing, ratingAverage: 4.5, ratingCount: 2 }).aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: 2,
    });
  });

  it("publishes the same legal identity the footer shows", () => {
    const node = organizationJsonLd();
    expect(node.legalName).toBe("MB Naudokis");
    expect(node.identifier).toBe("307423504");
  });
});

describe("itemListJsonLd", () => {
  it("lists every listing at its locale-correct detail URL, in order", () => {
    const node = itemListJsonLd("en", [
      { id: "a1", name: "Drill", city: "Vilnius" },
      { id: "b2", name: "Ladder" },
    ]);
    expect(node.numberOfItems).toBe(2);
    const items = node.itemListElement as { position: number; url: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    for (const item of items) {
      expect(item.url.startsWith("https://www.naudokis.lt/en/listings/")).toBe(true);
    }
  });
});
