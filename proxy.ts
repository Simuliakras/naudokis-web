// Locale routing: Lithuanian (default) is served unprefixed at "/", English at "/en".
// We rewrite public paths to the internal /lt|/en route segments (the URL stays
// clean), redirect any explicit /lt URL back to the unprefixed form, and permanently
// move legacy English URLs that still carry Lithuanian route segments.
//
// The decision itself is a pure function in app/lib/i18n/route-resolution.ts, so the
// loop guard is unit-tested rather than trusted. This file only applies it.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INTERNAL_LOCALE_REWRITE, resolveLocaleRouting } from "@/app/lib/i18n/route-resolution";

export function proxy(request: NextRequest) {
  const routing = resolveLocaleRouting({
    pathname: request.nextUrl.pathname,
    marker: request.nextUrl.searchParams.get(INTERNAL_LOCALE_REWRITE),
    acceptLanguage: request.headers.get("accept-language"),
  });

  if (routing.kind === "next") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = routing.pathname;

  if (routing.kind === "redirect") {
    url.searchParams.delete(INTERNAL_LOCALE_REWRITE);
    return NextResponse.redirect(url, routing.status);
  }

  // Every rewrite carries the marker. Next re-enters Proxy on the destination, and
  // without it the internal path would be canonicalized straight back to the public
  // one — rewrite → redirect → rewrite, forever. Both branches need it: an internal
  // "/lt/…" would hit the /lt→/ redirect, and an internal "/en/skelbimai" would hit
  // the legacy-spelling redirect.
  url.searchParams.set(INTERNAL_LOCALE_REWRITE, "1");
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on page routes only; skip Next internals, static brand assets, the
  // root-level SEO metadata routes (sitemap.xml, robots.txt, manifest — not
  // localized as routable pages), the `/go` smart-install redirect route handler (locale-
  // agnostic — must reach app/go/route.ts, not /lt/go) and `.well-known` (app-link
  // verifiers require a direct 200).
  //
  // The app universal-link paths are deliberately NOT excluded any more: they are
  // real localized pages now (see app/lib/app-links.ts), so they MUST be matched to
  // get their locale rewrite. Excluding one would make it 404 — and it would 404
  // only for people without the app installed, which is nobody who tests it.
  matcher: ["/((?!api(?:/|$)|go(?:/|$)|_next/static|_next/image|naudokis(?:/|$)|favicon.ico$|sitemap.xml$|robots.txt$|manifest.webmanifest$|\\.well-known(?:/|$)).*)"],
};
