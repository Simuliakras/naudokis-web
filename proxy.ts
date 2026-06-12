// Locale routing: Lithuanian (default) is served unprefixed at "/", English at "/en".
// We rewrite default-locale paths to the internal /lt segment (URL stays clean),
// pass /en through, and redirect any explicit /lt URLs back to the unprefixed form.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/app/lib/i18n/config";

const NON_DEFAULT = locales.filter((l) => l !== defaultLocale);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Everything else is the unprefixed default locale: rewrite to the internal segment.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on page routes only; skip Next internals, static brand assets, and the
  // root-level SEO metadata routes (sitemap.xml / robots.txt) which are not localized.
  matcher: ["/((?!_next/static|_next/image|naudokis|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)"],
};
