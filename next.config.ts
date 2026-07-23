import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
// Listing photos / owner avatars come from the backend's CloudFront
// distributions, allowlisted per host. The same list feeds the image
// remotePatterns, the CSP img-src, and the runtime cdnImage() guard so the three
// can't drift.
import { IMAGE_CDN_HOSTS } from "./app/lib/image-hosts";

const isDev = process.env.NODE_ENV === "development";

// Directives shared by the enforced policy and the report-only probe below, keyed
// by directive name so the probe can OVERRIDE an entry rather than append a second
// copy of it (see cspProbes).
//
// Next's static/ISR bootstrap requires script unsafe-inline; a nonce would force
// dynamic rendering and forfeit CDN/ISR cache benefits. The design system's inline
// styles are style="" attributes, covered by style-src-attr. unsafe-eval is dev-only.
const cspBase: Record<string, string> = {
  "default-src": "'self'",
  "script-src": `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://plausible.io`,
  "script-src-attr": "'none'",
  "style-src": "'self' 'unsafe-inline'",
  "style-src-attr": "'unsafe-inline'",
  "img-src": `'self' data: blob: ${IMAGE_CDN_HOSTS.join(" ")}`,
  "font-src": "'self' data:",
  "object-src": "'none'",
  "media-src": "'self' data: blob:",
  "worker-src": "'self' blob:",
  "manifest-src": "'self'",
  // Google Maps Embed API iframe on the listing-detail page.
  "frame-src": "https://www.google.com",
  // Referral/install attribution is via AppsFlyer OneLink URLs, which are
  // navigations / QR values (not fetch/XHR), so connect-src needs no OneLink host.
  "connect-src":
    "'self' https://api.naudokis.lt https://api-dev.naudokis.lt https://plausible.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-ancestors": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "report-to": "csp-endpoint",
  "report-uri": "/api/csp-report",
};

// Report-only probe for grants the enforced policy hands out but nothing appears to
// use. A violation here blocks nothing — it tells us the grant is load-bearing and
// has to stay. Once a probe's reports stay clean, that value can move into cspBase
// and be enforced for real.
//
// script-src is deliberately NOT probed. Next's RSC streaming bootstrap emits one
// inline `self.__next_f.push(...)` chunk per flight segment (~24 on the home page),
// generated per page, so they can be neither hash- nor nonce-allowlisted without
// giving up SSG/ISR. Probing it reported those same ~24 violations on every page
// view forever: an unreachable "clean" bar that buried genuinely new violations in
// both the report log and Chrome's Issues panel. Restoring it needs a rendering
// model change, not a policy change.
const cspProbes: Record<string, string> = {
  // All CSS ships as external <link rel="stylesheet"> — verified zero inline <style>
  // in the rendered HTML. style-src-attr above keeps the design system's style=""
  // attributes allowed, so this only catches a Next upgrade or a new dependency that
  // starts emitting inline <style> elements.
  "style-src-elem": "'self'",
  // Nothing calls URL.createObjectURL, constructs a Worker, or registers a service
  // worker, and the site has no <video>/<audio>. Enabling a Sentry DSN would be
  // expected to trip worker-src: Replay compresses in a blob: worker.
  "img-src": `'self' data: ${IMAGE_CDN_HOSTS.join(" ")}`,
  "media-src": "'none'",
  "worker-src": "'none'",
};

const serializeCsp = (directives: Record<string, string>, valueless: string[] = []) =>
  [...Object.entries(directives).map(([name, value]) => `${name} ${value}`), ...valueless].join("; ");

// upgrade-insecure-requests has no report-only semantics and browsers warn when it
// appears there, so it is enforced-only.
const csp = serializeCsp(cspBase, isDev ? [] : ["upgrade-insecure-requests"]);
const reportOnlyCsp = serializeCsp({ ...cspBase, ...cspProbes });

// Pragmatic security headers applied to every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Shipped in dev too, so the e2e suite can assert the real policy. A probe that
  // turns out to be load-bearing fires once per page view, so the report endpoint
  // de-duplicates by violation signature (see app/api/csp-report) — do not add
  // per-report logging there without keeping that de-duplication.
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
  { key: "Reporting-Endpoints", value: 'csp-endpoint="/api/csp-report"' },
  // Force HTTPS for two years, including subdomains; eligible for preload lists.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disallow MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block this site from being framed (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Send origin only on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No site code needs these powerful features. (browsing-topics is omitted: this
  // ad-tech-free site gains nothing from opting out, and the token only logs an
  // "Unrecognized feature" console error in browsers without the Topics API.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// NOTE: there is no longer an `appLinkPaths` rewrite list here. Every path claimed
// in .well-known/apple-app-site-association is now a REAL localized page under
// app/[lang]/ (see app/lib/app-links.ts) instead of a rewrite to a static
// interstitial. A rewrite added here for one of those paths would shadow its page.
// The remaining invariant is checked by `yarn verify:app-links`.

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Build-time constants inlined into BOTH bundles (that is what `env` does —
  // unlike .env vars, no NEXT_PUBLIC_ prefix is involved and it cannot be
  // overridden at runtime). The footer's rights notice needs the year to be one
  // frozen literal on the server and the client; see COPYRIGHT_YEAR in
  // app/lib/contact.ts for why computing it at render time breaks hydration.
  env: {
    BUILD_YEAR: String(new Date().getFullYear()),
  },
  experimental: {
    globalNotFound: true,
  },
  // NOTE: typedRoutes is deliberately OFF. Public URLs are the proxy-rewritten
  // unprefixed forms (/kategorijos, /skelbimai/[id]) which don't exist in the
  // typed /[lang]/... route tree, so every href would need an `as Route` cast.
  async headers() {
    // NOTE: there is no Content-Type entry for apple-app-site-association here any
    // more. It used to be a public/ asset that needed this header applied to it, but
    // headers() only runs for responses the Next server produces — hosts that serve
    // public/ straight off their CDN never applied it (verified on Amplify Hosting).
    // It is now a route handler that sets its own Content-Type, which holds on every
    // host. See app/.well-known/apple-app-site-association/route.ts.
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Canonical host is www. Send the apex (naudokis.lt) to www permanently.
      // The host value is anchored so www.naudokis.lt doesn't match itself (loop).
      // Exclude /.well-known/*: Apple and Android app-link verifiers require a
      // direct 200 for association files and must not be sent through host
      // canonicalization first.
      {
        source: "/:path((?!\\.well-known(?:/|$)).*)",
        has: [{ type: "host", value: "^naudokis\\.lt$" }],
        destination: "https://www.naudokis.lt/:path",
        permanent: true,
      },
      // Legal URLs that changed between the old site and this one.
      //
      // The three English slugs (/en/terms-of-service, /en/privacy-policy,
      // /en/account-deletion) used to be redirected FROM here to the Lithuanian
      // ones. They are canonical again now that English routes are localized, so
      // those rules are gone — leaving them would send every visitor away from the
      // URL the page's own canonical advertises.
      //
      // Their Lithuanian counterparts are deliberately NOT redirected here either:
      // a 308 is cached by clients forever, so any browser still holding the old
      // "/en/terms-of-service → /en/naudojimosi-salygos" hop would loop entirely
      // inside its own cache. They stay 200 and are de-duplicated by canonical.
      // See NO_REDIRECT_SEGMENTS in app/lib/i18n/route-resolution.ts.
      //
      // Legacy English route segments (/en/skelbimai, /en/nuoma/*, …) are moved in
      // the proxy rather than here: `redirects()` runs before Proxy, so a rule that
      // is the exact inverse of the proxy's own rewrite risks an infinite loop.
      { source: "/naudojimo-taisykles", destination: "/naudojimosi-salygos", permanent: true },
      { source: "/en/naudojimo-taisykles", destination: "/en/terms-of-service", permanent: true },
    ];
  },
  // WebP avoids AVIF's materially slower first-request encoding on listing LCPs.
  // Static brand patterns are
  // pre-encoded to .avif/.webp and served via <picture>, so they skip the optimizer.
  images: {
    formats: ["image/webp"],
    // Next 16 requires every `quality` the app requests to be allowlisted. The app
    // uses exactly one, so every optimized variant shares a cache entry.
    qualities: [75],
    // 30 days, not the old 1 day. Safe because every optimizable source is
    // effectively immutable at its URL: backend photos are
    // listings/<owner>/<listing>/<timestamp>-listing_<ts>_<rand>.jpg, so
    // replacing a photo yields a new filename rather than new bytes at the old
    // one, and public/naudokis/** is served `immutable` for the same reason
    // (see customHeaders in amplify.yml). This is the browser-facing max-age as
    // well as the optimizer's on-disk floor, so it also cuts re-encodes.
    minimumCacheTTL: 2_592_000,
    // Listing cards are often 160–320 CSS pixels wide. Supplying intermediate
    // candidates prevents the default 384px floor from over-serving every
    // two-column mobile card. 384 is the DPR2 candidate for the fixed-size
    // store badges and logo (see StoreBadge in ui.tsx) — without it the next
    // step up is 640, nearly 4× the box those render at.
    imageSizes: [56, 96, 128, 160, 192, 256, 320, 384],
    // Per-host CDN allowlist (see IMAGE_CDN_HOSTS) so arbitrary CloudFront
    // content can't be routed through our optimizer.
    remotePatterns: IMAGE_CDN_HOSTS.map((host) => new URL(`${host}/**`)),
  },
};

// Source-map upload only runs in CI when SENTRY_AUTH_TOKEN/org/project are set;
// otherwise this is a no-op wrapper. The SDK itself stays inert without a DSN.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Strip the SDK's own debug logging from the bundle (replaces the deprecated
  // top-level `disableLogger`).
  webpack: { treeshake: { removeDebugLogging: true } },
});
