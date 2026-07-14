// Locale routing: Lithuanian (default) is served unprefixed at "/", English at "/en".
// We rewrite default-locale paths to the internal /lt segment (URL stays clean),
// pass /en through, and redirect any explicit /lt URLs back to the unprefixed form.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, negotiateLocale } from "@/app/lib/i18n/config";
import { isHandoffPath } from "@/app/lib/app-links";

const NON_DEFAULT = locales.filter((l) => l !== defaultLocale);
// Marker carried ON the internal /lt rewrite URL. It MUST be a query param, not a
// request header: Next re-enters Proxy on the rewritten destination, and only the
// URL survives that re-entry (a header set via NextResponse.rewrite's request.headers
// does not, and dropping the marker makes the internal /lt hit the /lt→/ redirect
// branch — an infinite rewrite→redirect loop). The param stays server-side only; the
// visible browser/client URL remains the clean unprefixed default-locale route.
const INTERNAL_LOCALE_REWRITE = "__nk_locale_rewrite";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy re-enters on the rewritten destination. When the browser asks for `/`, we
  // rewrite internally to `/lt`; that internal `/lt` must not be canonicalized back
  // to `/`, or the request infinite-loops (rewrite → redirect → rewrite). The marker
  // exists only on the internal target.
  if (
    request.nextUrl.searchParams.get(INTERNAL_LOCALE_REWRITE) === "1" &&
    (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`))
  ) {
    return NextResponse.next();
  }

  // A non-default locale (e.g. /en, /en/...) passes straight through to its segment.
  const hasNonDefaultPrefix = NON_DEFAULT.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasNonDefaultPrefix) {
    return NextResponse.next();
  }

  // Keep the default locale canonical-free: /lt and /lt/... redirect to the bare path.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const stripped = pathname.slice(`/${defaultLocale}`.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    // Permanent (308) — /lt/* is the non-canonical form of these URLs forever.
    return NextResponse.redirect(url, 308);
  }

  // App-handoff paths: same internal rewrite, but the locale is negotiated from the
  // browser rather than assumed, because these URLs are baked into emails and app-link
  // claims and carry no locale of their own. The visible URL is untouched (a rewrite,
  // never a redirect) — the emailed URLs must keep working byte-for-byte.
  //
  // Safe to vary per request because those pages are force-dynamic (Next then sends
  // no-store), so no shared cache can pin one locale's render to the shared URL.
  const locale = isHandoffPath(pathname) ? negotiateLocale(request.headers.get("accept-language")) : defaultLocale;

  // Everything else is the unprefixed default locale: rewrite to the internal segment.
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  // The marker only guards the default-locale rewrite from the /lt → / redirect
  // above; an /en target hits the non-default pass-through and needs none.
  if (locale === defaultLocale) {
    url.searchParams.set(INTERNAL_LOCALE_REWRITE, "1");
  }
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on page routes only; skip Next internals, static brand assets, the
  // root-level SEO metadata routes and generated listing sitemaps (not localized
  // as routable pages), the `/go` smart-install redirect route handler (locale-
  // agnostic — must reach app/go/route.ts, not /lt/go) and `.well-known` (app-link
  // verifiers require a direct 200).
  //
  // The app universal-link paths are deliberately NOT excluded any more: they are
  // real localized pages now (see app/lib/app-links.ts), so they MUST be matched to
  // get their locale rewrite. Excluding one would make it 404 — and it would 404
  // only for people without the app installed, which is nobody who tests it.
  matcher: ["/((?!api(?:/|$)|go(?:/|$)|_next/static|_next/image|naudokis(?:/|$)|favicon.ico$|sitemap.xml$|robots.txt$|manifest.webmanifest$|listings/sitemap(?:/|$)|\\.well-known(?:/|$)).*)"],
};
