import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { createHash } from "node:crypto";
// Listing photos / owner avatars come from the backend's CloudFront
// distributions, allowlisted per host. The same list feeds the image
// remotePatterns, the CSP img-src, and the runtime cdnImage() guard so the three
// can't drift.
import { IMAGE_CDN_HOSTS } from "./app/lib/image-hosts";
import { BRIDGE_BOOTSTRAP } from "./app/lib/bridge-bootstrap";

const isDev = process.env.NODE_ENV === "development";
const bridgeBootstrapHash = `sha256-${createHash("sha256").update(BRIDGE_BOOTSTRAP).digest("base64")}`;

// Enforced CSP with local violation reporting. The app-owned pre-hydration
// bootstrap is hash-allowlisted in the strict policy. Next's static/ISR bootstrap still requires script
// unsafe-inline; a nonce would force dynamic rendering and forfeit CDN/ISR cache
// benefits, so the stricter policy remains report-only until its reports are clean.
// Inline React styles still require style unsafe-inline. unsafe-eval is dev-only.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://plausible.io`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "style-src-attr 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGE_CDN_HOSTS.join(" ")}`,
  "font-src 'self' data:",
  "object-src 'none'",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Google Maps Embed API iframe on the listing-detail page.
  "frame-src https://www.google.com",
  // Referral/install attribution is via AppsFlyer OneLink URLs, which are
  // navigations / QR values (not fetch/XHR), so connect-src needs no OneLink host.
  "connect-src 'self' https://api.naudokis.lt https://api-dev.naudokis.lt https://plausible.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-to csp-endpoint",
  "report-uri /api/csp-report",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Phase-one strict CSP: observe what would break without script unsafe-inline
// before enforcing it. This report-only policy inventories the remaining
// framework/bootstrap inline code without changing the current SSG/ISR model.
// Inline styles remain allowed in this first phase because the component system
// still intentionally uses React style objects.
const strictReportOnlyCsp = csp
  .replace("script-src 'self' 'unsafe-inline'", `script-src 'self' '${bridgeBootstrapHash}'`)
  // This directive has no report-only semantics and browsers warn if it is
  // present there; it remains active in the enforced policy above.
  .replace("; upgrade-insecure-requests", "");

// Pragmatic security headers applied to every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Shipped in dev too, so the e2e suite can assert the real policy. This header
  // is violated by Next's own inline bootstrap on EVERY page view, so the report
  // endpoint de-duplicates by violation signature (see app/api/csp-report) — do not
  // add per-report logging there without keeping that de-duplication.
  { key: "Content-Security-Policy-Report-Only", value: strictReportOnlyCsp },
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
  experimental: {
    globalNotFound: true,
  },
  // NOTE: typedRoutes is deliberately OFF. Public URLs are the proxy-rewritten
  // unprefixed forms (/kategorijos, /skelbimai/[id]) which don't exist in the
  // typed /[lang]/... route tree, so every href would need an `as Route` cast.
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // apple-app-site-association is extensionless; iOS requires it served as
      // application/json (no .json file is fetched by the OS).
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
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
      // Legal URLs that changed between the old site and this one. The old EN
      // slugs were indexed; preserve their link equity. The LT terms slug
      // matches the old site after the rename, so only the dev-era LT slug needs
      // a defensive redirect.
      { source: "/en/terms-of-service", destination: "/en/naudojimosi-salygos", permanent: true },
      { source: "/en/privacy-policy", destination: "/en/privatumo-politika", permanent: true },
      { source: "/en/account-deletion", destination: "/en/paskyros-trynimas", permanent: true },
      { source: "/naudojimo-taisykles", destination: "/naudojimosi-salygos", permanent: true },
      { source: "/en/naudojimo-taisykles", destination: "/en/naudojimosi-salygos", permanent: true },
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
    minimumCacheTTL: 86_400,
    // Listing cards are often 160–320 CSS pixels wide. Supplying intermediate
    // candidates prevents the default 384px floor from over-serving every
    // two-column mobile card.
    imageSizes: [56, 96, 128, 160, 192, 256, 320],
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
