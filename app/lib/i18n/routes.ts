// Whole-path translation between the internal route vocabulary and a locale's public
// URL — static segments (via route-segments.ts) AND the dynamic taxonomy slugs.
//
// The internal vocabulary is the default locale's spelling throughout: route folders
// are Lithuanian, and `listingLandingPath` / breadcrumb crumbs / canonical inputs all
// speak it. Application code keeps passing those bare internal paths around; this
// module is the boundary that turns one into "/en/rent/tools-construction/vilnius".
//
// ── The one asymmetry worth knowing ──────────────────────────────────────────────
// `proxy.ts` translates static segments ONLY (route-segments.ts), never slugs. If it
// internalized slugs too, "/en/rent/tools-construction" and "/en/rent/irankiai-statyba"
// would both rewrite to the same internal path, the page could no longer tell which
// spelling was requested, and the canonical 308 could never be emitted. So the proxy
// resolves the route and the *page* canonicalizes the slug. This module — used for
// outgoing links, canonicals, hreflang and the locale switcher — does both.
import { defaultLocale, splitPathSuffix, type Locale } from "./locales";
import { internalizeSegments, localizeSegments } from "./route-segments";
import {
  categorySlugForId,
  cityFromSlug,
  resolveCategorySlug,
  resolveSubcategorySlug,
  subcategorySlugForId,
} from "@/app/lib/landing-routes";

// What the dynamic segments of a route mean, positionally, after the first segment.
// Anything not listed here (and any position past the end of a shape) is opaque.
type SlotRole = "category" | "subOrCity" | "city" | "opaque";

const ROUTE_SHAPES: Record<string, SlotRole[]> = {
  // /nuoma/{category}[/{subcategory|city}][/{city}] — the middle slot is genuinely
  // ambiguous, and is resolved city-first to match the route itself
  // (app/[lang]/nuoma/[category]/[slug]/page.tsx).
  nuoma: ["category", "subOrCity", "city"],
  miestai: ["city"],
  // The listing slug is built from the owner-authored title and is never translated
  // — it is the item's real name, and the backend has no per-locale title. Listed
  // explicitly so "/skelbimai/nuoma-kita-vilnius-<uuid>" can never be word-rewritten.
  skelbimai: ["opaque"],
};

function translateSlot(role: SlotRole, slug: string, from: Locale, to: Locale): string {
  if (role === "category") {
    return categorySlugForId(resolveCategorySlug(slug, from).id, to);
  }
  if (role === "subOrCity") {
    // City slugs are locale-invariant proper nouns, so a city here needs no work —
    // and checking it first is what keeps this consistent with the route's own
    // disambiguation order.
    return cityFromSlug(slug) ? slug : subcategorySlugForId(resolveSubcategorySlug(slug, from).id, to);
  }
  return slug;
}

function translateRoute(path: string, from: Locale, to: Locale): string {
  const [route, suffix] = splitPathSuffix(path);
  const segments = route.split("/");
  // "/nuoma/x" splits to ["", "nuoma", "x"] — index 1 is the first segment.
  const first = segments[1];
  if (!first) {
    return path;
  }
  // The shape table is keyed on the internal spelling, so normalize before looking up.
  const internalFirst = internalizeSegments(from, `/${first}`).slice(1);
  const shape = ROUTE_SHAPES[internalFirst];
  segments[1] = localizeSegments(to, `/${internalFirst}`).slice(1);
  if (shape) {
    for (let i = 2; i < segments.length; i += 1) {
      if (segments[i]) {
        segments[i] = translateSlot(shape[i - 2] ?? "opaque", segments[i], from, to);
      }
    }
  }
  return segments.join("/") + suffix;
}

// Internal (default-locale) path → the public path for `locale`, WITHOUT the locale
// prefix. `localePath` adds the prefix; this stays prefix-free so it composes.
export function localizeRoute(locale: Locale, internalPath: string): string {
  return translateRoute(internalPath, defaultLocale, locale);
}

// The inverse: a public, prefix-stripped path in `locale` → the internal path.
//
// Idempotent — internalizing an already-internal path returns it unchanged, because
// the public and internal vocabularies are disjoint in both the segment table and the
// slug tables. Two things depend on that: the proxy's rewrite target does not
// re-translate when Next re-enters on it, and `usePathname()` (which reports the
// internal path on the server but the public one on the client under a rewrite)
// reduces to the same value on both sides, so the nav does not mismatch on hydration.
export function internalizeRoute(locale: Locale, publicPath: string): string {
  return translateRoute(publicPath, locale, defaultLocale);
}
