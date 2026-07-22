// The proxy's routing decision, as a pure function.
//
// `proxy.ts` is the riskiest file in the locale layer — it owns an internal rewrite
// with a loop guard that has already caused one production infinite-loop — and as a
// Next middleware it is awkward to test. So the decision lives here, under vitest,
// and the proxy is a thin shell that applies it.
//
// ── Why slug canonicalization lives HERE and not in the page ─────────────────────
// A non-canonical spelling ("/nuoma/home-garden", "/en/rent/namai-sodas") has to 308
// to the canonical URL, and that redirect has to be a real HTTP response. It cannot
// be done with `permanentRedirect` inside the route: by the time an async page body
// runs, the shell has flushed, and Next then degrades the redirect to a client-side
// meta tag rather than a status code (documented at
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md —
// "when used in a streaming context, this will insert a meta tag"). Verified at
// runtime: the page rendered 200 with no metadata at all.
//
// So the proxy owns both halves of canonicalization. Two things follow. Every
// request reaching a route already carries the canonical slug for its locale, so
// pages only ever map slug → id. And a legacy English URL is fixed in ONE hop
// ("/en/nuoma/irankiai-statyba" → "/en/rent/tools-construction") instead of two.
//
// The cost is that the taxonomy slug tables are now on the per-request path. They
// are static maps with no I/O, which is why this is an acceptable trade.
import {
  defaultLocale,
  locales,
  negotiateLocale,
  splitPathSuffix,
  type Locale,
} from "./locales";
import { internalizeSegments } from "./route-segments";
import { internalizeRoute, localizeRoute } from "./routes";
import { isHandoffPath } from "@/app/lib/app-links";

// Marker carried ON the internal rewrite URL. It MUST be a query param, not a
// request header: Next re-enters Proxy on the rewritten destination, and only the
// URL survives that re-entry (a header set via NextResponse.rewrite's request.headers
// does not, and dropping the marker makes the internal path fall back into the
// canonicalization branches below — an infinite rewrite→redirect loop). The param
// stays server-side only; the visible browser URL remains the clean public route.
export const INTERNAL_LOCALE_REWRITE = "__nk_locale_rewrite";

// Legacy public spellings that must keep returning 200 instead of redirecting.
//
// The old site served English legal URLs ("/en/terms-of-service"); this repo then
// 308'd them to the Lithuanian slugs. A 308 is cached by the client indefinitely, so
// now that the English slug is canonical again, redirecting the Lithuanian one back
// would put any browser holding that stale 308 into a loop it resolves entirely from
// its own cache — unfixable from the server. These stay reachable forever; the page's
// own <link rel=canonical> (which resolves to the English URL) is what de-duplicates
// them for search engines.
const NO_REDIRECT_SEGMENTS = new Set(["naudojimosi-salygos", "privatumo-politika", "paskyros-trynimas"]);

export type LocaleRouting =
  | { kind: "next" }
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; pathname: string; status: 308 };

function localePrefixOf(pathname: string): Locale | undefined {
  return locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

function firstSegment(path: string): string {
  return splitPathSuffix(path)[0].split("/")[1] ?? "";
}

export function resolveLocaleRouting({
  pathname,
  marker,
  acceptLanguage,
}: {
  pathname: string;
  marker: string | null;
  acceptLanguage: string | null;
}): LocaleRouting {
  // Proxy re-enters on the rewritten destination. That internal path must not be
  // canonicalized again, or the request infinite-loops (rewrite → redirect →
  // rewrite). The marker exists only on the internal target. Checked for EVERY
  // locale, not just the default: the English rewrite target ("/en/skelbimai") would
  // otherwise match the legacy-spelling redirect below and loop.
  if (marker === "1" && localePrefixOf(pathname)) {
    return { kind: "next" };
  }

  // Keep the default locale canonical-free: /lt and /lt/... redirect to the bare path.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    // Permanent (308) — /lt/* is the non-canonical form of these URLs forever.
    return { kind: "redirect", pathname: pathname.slice(`/${defaultLocale}`.length) || "/", status: 308 };
  }

  const prefixed = localePrefixOf(pathname);
  if (prefixed) {
    const bare = pathname.slice(`/${prefixed}`.length) || "/";
    const canonical = canonicalPublicPath(prefixed, bare);
    // A legacy or wrong-locale spelling ("/en/skelbimai", "/en/rent/namai-sodas"):
    // permanently move it, except where a cached redirect from the old site makes
    // that unsafe.
    if (canonical !== bare && !NO_REDIRECT_SEGMENTS.has(firstSegment(bare))) {
      return { kind: "redirect", pathname: `/${prefixed}${canonical}`, status: 308 };
    }
    // Only the SEGMENTS are internalized for the rewrite — the slug stays in this
    // locale's spelling, which is what the page resolves against.
    const target = internalizeSegments(prefixed, bare);
    if (target === bare) {
      return { kind: "next" };
    }
    return { kind: "rewrite", pathname: `/${prefixed}${target}` };
  }

  // Everything else is unprefixed, i.e. the default locale. Its route segments are
  // already the internal ones (ROUTE_SEGMENTS.lt is identity, pinned by
  // routes.test.ts), but its taxonomy slugs still need canonicalizing — the English
  // spelling of a category resolves here too and must not serve a duplicate.
  const canonical = canonicalPublicPath(defaultLocale, pathname);
  if (canonical !== pathname) {
    return { kind: "redirect", pathname: canonical, status: 308 };
  }

  // App-handoff paths get their locale negotiated from the browser rather than
  // assumed, because those URLs are baked into emails and app-link claims and carry
  // no locale of their own. The visible URL is untouched (a rewrite, never a
  // redirect) — the emailed URLs must keep working byte-for-byte. Safe to vary per
  // request because those pages are force-dynamic (Next then sends no-store), so no
  // shared cache can pin one locale's render to the shared URL.
  const locale = isHandoffPath(pathname) ? negotiateLocale(acceptLanguage) : defaultLocale;
  return { kind: "rewrite", pathname: `/${locale}${pathname === "/" ? "" : pathname}` };
}

// The one canonical public spelling of a path in `locale`: round-trip it through the
// internal vocabulary and back. Both halves are idempotent, so a path that is already
// canonical comes back unchanged.
function canonicalPublicPath(locale: Locale, bare: string): string {
  return localizeRoute(locale, internalizeRoute(locale, bare));
}
