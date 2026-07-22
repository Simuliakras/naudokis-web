// The public spelling of every static route segment, per locale.
//
// Next has ONE physical route tree (`app/[lang]/nuoma/[category]/…`), so the folder
// names are the INTERNAL vocabulary and Lithuanian is what they are spelled in. The
// English path is a translation of that, applied at two boundaries:
//
//   - `proxy.ts`   — incoming request: public → internal, so the route resolves
//   - `localePath` — outgoing link/canonical: internal → public
//
// Deliberately dependency-light (locale primitives only). `proxy.ts` runs on every
// request, and a segment table has no business pulling in the taxonomy or the site's
// copy — slug translation lives one layer up, in i18n/routes.ts. That split is also
// why this module translates the FIRST segment only: everything after it is a
// dynamic value, and a listing slug like "nuoma-kita-vilnius-<uuid>" must never have
// its words rewritten.
import type { Locale } from "./locales";
import { splitPathSuffix } from "./locales";

// The route-folder names under app/[lang]/ that are translated. Anything absent is
// identity in every locale — which is the correct default and needs no maintenance:
//
//   - the app-handoff paths (/invite, /chat, /listing, /ref, /reset-password, …) are
//     baked into transactional emails and the AASA universal-link claims, so they
//     must stay byte-identical forever (see app/lib/app-links.ts);
//   - /social-card is `force-static` prerendered per locale and its URL is cached
//     indefinitely by every social scraper that has ever fetched a share card.
export const INTERNAL_SEGMENTS = [
  "skelbimai",
  "nuoma",
  "miestai",
  "kategorijos",
  "kaip-tai-veikia",
  "naudojimosi-salygos",
  "privatumo-politika",
  "paskyros-trynimas",
] as const;
export type InternalSegment = (typeof INTERNAL_SEGMENTS)[number];

// The `Dict` contract trick in two dimensions: adding a locale OR a segment is a
// compile error until every cell is filled. The Lithuanian column is spelled out
// rather than derived so this table doubles as the list of real route folders.
export const ROUTE_SEGMENTS: Record<Locale, Record<InternalSegment, string>> = {
  lt: {
    skelbimai: "skelbimai",
    nuoma: "nuoma",
    miestai: "miestai",
    kategorijos: "kategorijos",
    "kaip-tai-veikia": "kaip-tai-veikia",
    "naudojimosi-salygos": "naudojimosi-salygos",
    "privatumo-politika": "privatumo-politika",
    "paskyros-trynimas": "paskyros-trynimas",
  },
  en: {
    skelbimai: "listings",
    nuoma: "rent",
    miestai: "cities",
    kategorijos: "categories",
    "kaip-tai-veikia": "how-it-works",
    "naudojimosi-salygos": "terms-of-service",
    "privatumo-politika": "privacy-policy",
    "paskyros-trynimas": "account-deletion",
  },
};

// Widened views for lookup by an arbitrary URL segment. `Record<InternalSegment, …>`
// is a mapped type, so it carries an implicit index signature and needs no cast —
// an unknown segment simply misses and falls through to identity.
const PUBLIC_BY_INTERNAL: Record<Locale, Record<string, string>> = ROUTE_SEGMENTS;
const INTERNAL_BY_PUBLIC: Record<Locale, Record<string, string>> = {
  lt: invert(ROUTE_SEGMENTS.lt),
  en: invert(ROUTE_SEGMENTS.en),
};

function invert(table: Record<InternalSegment, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(table).map(([internal, publicSeg]) => [publicSeg, internal]));
}

function mapFirstSegment(path: string, translate: (segment: string) => string): string {
  const [route, suffix] = splitPathSuffix(path);
  const segments = route.split("/");
  // "/nuoma/x" splits to ["", "nuoma", "x"] — index 1 is the first segment.
  if (segments.length < 2 || !segments[1]) {
    return path;
  }
  segments[1] = translate(segments[1]);
  return segments.join("/") + suffix;
}

export function localizeSegments(locale: Locale, internalPath: string): string {
  return mapFirstSegment(internalPath, (segment) => PUBLIC_BY_INTERNAL[locale][segment] ?? segment);
}

// The inverse. Idempotent by construction: the public and internal segment
// vocabularies are disjoint (no English spelling collides with a route-folder name),
// so internalizing an already-internal path is a no-op.
//
// That property is load-bearing twice over. It is why the proxy's rewrite target
// does not re-translate when Next re-enters on it (no infinite loop), and it is why
// `usePathname()` — which reports the INTERNAL path on the server and the PUBLIC one
// on the client under a rewrite — reduces to the same value on both sides, so the nav
// and locale switcher do not mismatch on hydration. `routes.test.ts` pins it.
export function internalizeSegments(locale: Locale, publicPath: string): string {
  return mapFirstSegment(publicPath, (segment) => INTERNAL_BY_PUBLIC[locale][segment] ?? segment);
}
