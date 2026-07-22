import { describe, expect, it } from "vitest";
import { internalizeRoute, localizeRoute } from "@/app/lib/i18n/routes";
import { INTERNAL_SEGMENTS, ROUTE_SEGMENTS } from "@/app/lib/i18n/route-segments";
import { localePath, locales, defaultLocale, type Locale } from "@/app/lib/i18n/config";
import {
  categorySlugForId,
  resolveCategorySlug,
  resolveSubcategorySlug,
  subcategorySlugForId,
  CURATED_CATEGORY_IDS,
  CURATED_SUBCATEGORY_IDS,
} from "@/app/lib/landing-routes";
import { HANDOFF_SEGMENTS } from "@/app/lib/app-links";

// Every internal route shape, as the codebase emits them.
const INTERNAL_PATHS = [
  "/",
  "/skelbimai",
  "/skelbimai/bosch-grezimo-plaktukas-vilnius-11111111-2222-3333-4444-555555555555",
  "/kategorijos",
  "/kaip-tai-veikia",
  "/nuoma/irankiai-statyba",
  "/nuoma/irankiai-statyba/elektriniai-irankiai",
  "/nuoma/irankiai-statyba/vilnius",
  "/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius",
  "/miestai/vilnius",
  "/naudojimosi-salygos",
  "/privatumo-politika",
  "/paskyros-trynimas",
];

describe("route localization", () => {
  it("translates the whole English path — segments and taxonomy slugs", () => {
    expect(localizeRoute("en", "/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius"))
      .toBe("/rent/tools-construction/power-tools/vilnius");
    expect(localizeRoute("en", "/skelbimai")).toBe("/listings");
    expect(localizeRoute("en", "/kategorijos")).toBe("/categories");
    expect(localizeRoute("en", "/miestai/vilnius")).toBe("/cities/vilnius");
    expect(localizeRoute("en", "/kaip-tai-veikia")).toBe("/how-it-works");
    expect(localizeRoute("en", "/naudojimosi-salygos")).toBe("/terms-of-service");
  });

  it("leaves the default locale untouched", () => {
    for (const path of INTERNAL_PATHS) {
      expect(localizeRoute(defaultLocale, path)).toBe(path);
    }
  });

  it("round-trips every route shape in every locale", () => {
    for (const locale of locales) {
      for (const path of INTERNAL_PATHS) {
        expect(internalizeRoute(locale, localizeRoute(locale, path))).toBe(path);
      }
    }
  });

  // The property the proxy's loop-freedom and the nav's hydration both rest on.
  it("internalizeRoute is idempotent — an already-internal path is a no-op", () => {
    for (const locale of locales) {
      for (const path of INTERNAL_PATHS) {
        expect(internalizeRoute(locale, path)).toBe(path);
        const publicPath = localizeRoute(locale, path);
        expect(internalizeRoute(locale, internalizeRoute(locale, publicPath))).toBe(path);
      }
    }
  });

  it("never rewrites words inside an owner-authored listing slug", () => {
    // A real title whose slug contains route words and category words.
    const path = "/skelbimai/nuoma-kita-vilnius-11111111-2222-3333-4444-555555555555";
    expect(localizeRoute("en", path))
      .toBe("/listings/nuoma-kita-vilnius-11111111-2222-3333-4444-555555555555");
    // A trailing UUID makes any realistic listing slug unmatchable by the taxonomy,
    // so the fixture above cannot tell an opaque slot from a category slot. This one
    // can: the segment IS a curated category slug, so it would be rewritten to
    // "other" the moment the listing slot stopped being opaque.
    expect(localizeRoute("en", "/skelbimai/kita")).toBe("/listings/kita");
    expect(internalizeRoute("en", "/listings/kita")).toBe("/skelbimai/kita");
  });

  it("preserves query and hash", () => {
    expect(localizeRoute("en", "/nuoma/irankiai-statyba?page=2")).toBe("/rent/tools-construction?page=2");
    expect(localizeRoute("en", "/invite?code=ABC")).toBe("/invite?code=ABC");
    expect(localizeRoute("en", "/naudojimosi-salygos#section-9")).toBe("/terms-of-service#section-9");
    expect(localePath("en", "/nuoma/irankiai-statyba?page=2")).toBe("/en/rent/tools-construction?page=2");
  });

  it("resolves the ambiguous middle slot city-first, like the route does", () => {
    // Cities are locale-invariant, subcategories are not.
    expect(localizeRoute("en", "/nuoma/irankiai-statyba/vilnius")).toBe("/rent/tools-construction/vilnius");
    expect(localizeRoute("en", "/nuoma/irankiai-statyba/elektriniai-irankiai"))
      .toBe("/rent/tools-construction/power-tools");
  });
});

describe("paths that must never be localized", () => {
  // These are baked into transactional emails and the app's universal-link claims.
  // If this test ever goes red, shipping it breaks deep links for installed users
  // and, for the token pages, would break the analytics guard in app-links.ts.
  it("keeps every app-handoff segment byte-identical in both locales", () => {
    const paths = [
      ...HANDOFF_SEGMENTS.map((segment) => `/${segment}/abc123`),
      "/invite",
      "/invite?code=ABC",
      "/my-profile",
      "/rewards",
      "/cancel-deletion?token=t",
      "/reset-password?token=t",
      "/verify-email?token=t",
      "/social-card",
      "/go",
    ];
    for (const locale of locales) {
      for (const path of paths) {
        expect(localizeRoute(locale, path)).toBe(path);
        expect(internalizeRoute(locale, path)).toBe(path);
      }
    }
  });

  it("keeps the social-card URL stable — social scrapers cache it indefinitely", () => {
    expect(localePath("en", "/social-card")).toBe("/en/social-card");
    expect(localePath("lt", "/social-card")).toBe("/social-card");
  });
});

describe("segment vocabulary invariants", () => {
  // Disjointness is what makes internalizeSegments idempotent. Without it the proxy
  // rewrite could translate a second time on re-entry and loop.
  it("no public segment collides with an internal route-folder name", () => {
    const internal = new Set<string>(INTERNAL_SEGMENTS);
    for (const locale of locales) {
      if (locale === defaultLocale) {
        continue;
      }
      for (const segment of Object.values(ROUTE_SEGMENTS[locale])) {
        expect(internal.has(segment), `"${segment}" collides with a route folder`).toBe(false);
      }
    }
  });

  it("no public segment collides with a locale code or a reserved root path", () => {
    const reserved = new Set([...locales, "api", "go", "_next", "naudokis", ".well-known", "listings/sitemap"]);
    for (const locale of locales) {
      for (const segment of Object.values(ROUTE_SEGMENTS[locale])) {
        expect(reserved.has(segment), `"${segment}" is a reserved path`).toBe(false);
      }
    }
  });

  it("every public segment is unique within its locale", () => {
    for (const locale of locales) {
      const values = Object.values(ROUTE_SEGMENTS[locale]);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});

describe("taxonomy slug invariants", () => {
  const cases = [
    { label: "category", ids: CURATED_CATEGORY_IDS, slugFor: categorySlugForId, resolve: resolveCategorySlug },
    { label: "subcategory", ids: CURATED_SUBCATEGORY_IDS, slugFor: subcategorySlugForId, resolve: resolveSubcategorySlug },
  ];

  for (const { label, ids, slugFor, resolve } of cases) {
    it(`every ${label} slug resolves back to its own id, in every locale`, () => {
      for (const locale of locales) {
        for (const id of ids) {
          const resolved = resolve(slugFor(id, locale), locale);
          expect(resolved.id).toBe(id);
          expect(resolved.match).toBe("exact");
        }
      }
    });

    it(`no ${label} slug means two different ids across locales`, () => {
      // A slug that is one id's Lithuanian spelling and another's English spelling
      // would make resolution ambiguous and break the round-trip in one direction.
      const owner = new Map<string, string>();
      for (const locale of locales) {
        for (const id of ids) {
          const slug = slugFor(id, locale);
          const existing = owner.get(slug);
          expect(existing ?? id, `"${slug}" is claimed by both ${existing} and ${id}`).toBe(id);
          owner.set(slug, id);
        }
      }
    });

    it(`the other locale's ${label} spelling always resolves as an alias`, () => {
      for (const locale of locales) {
        const other: Locale = locale === "lt" ? "en" : "lt";
        for (const id of ids) {
          const foreign = slugFor(id, other);
          if (foreign === slugFor(id, locale)) {
            continue; // identical in both locales — nothing to canonicalize
          }
          const resolved = resolve(foreign, locale);
          expect(resolved.id).toBe(id);
          expect(resolved.match).toBe("alias");
        }
      }
    });
  }

  // The property every caller depends on: `match !== "alias"` exactly when the URL is
  // already canonical, so "a non-canonical URL never serves a 200" holds by construction.
  it("match is 'alias' precisely when the slug is not already canonical", () => {
    const samples = [
      "irankiai-statyba", "tools-construction", "kita", "other",
      "elektriniai-irankiai", "power-tools", "perforatoriai",
      "garden-furniture", "blahblah",
    ];
    for (const locale of locales) {
      for (const slug of samples) {
        for (const { resolve, slugFor } of cases) {
          const resolved = resolve(slug, locale);
          expect(resolved.match === "alias").toBe(slugFor(resolved.id, locale) !== slug);
        }
      }
    }
  });

  it("canonicalizes the other locale's spelling and the curated intent aliases", () => {
    expect(resolveCategorySlug("tools-construction", "lt")).toEqual({ id: "tools_construction", match: "alias" });
    expect(resolveCategorySlug("irankiai-statyba", "en")).toEqual({ id: "tools_construction", match: "alias" });
    expect(resolveSubcategorySlug("perforatoriai", "lt")).toEqual({ id: "concrete_masonry_tools", match: "alias" });
  });

  it("serves an unknown backend id rather than 404ing it — forward compatibility", () => {
    // A category added to the backend after this file was last touched.
    expect(resolveCategorySlug("garden-furniture", "en")).toEqual({ id: "garden_furniture", match: "derived" });
    expect(resolveCategorySlug("garden-furniture", "lt")).toEqual({ id: "garden_furniture", match: "derived" });
  });
});

describe("localePath", () => {
  it("translates and prefixes in one step", () => {
    expect(localePath("lt", "/skelbimai")).toBe("/skelbimai");
    expect(localePath("en", "/skelbimai")).toBe("/en/listings");
    expect(localePath("en", "/nuoma/irankiai-statyba")).toBe("/en/rent/tools-construction");
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("lt", "/")).toBe("/");
  });
});
