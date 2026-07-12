import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
// Listing photos / owner avatars come from the backend's CloudFront
// distributions, allowlisted per host. The same list feeds the image
// remotePatterns, the CSP img-src, and the runtime cdnImage() guard so the three
// can't drift. Add the prod distribution in that module once it exists.
import { IMAGE_CDN_HOSTS } from "./app/lib/image-hosts";

const isDev = process.env.NODE_ENV === "development";

// Enforced CSP with local violation reporting. We keep 'unsafe-inline' for now
// because the app intentionally uses inline style objects and a tiny
// pre-hydration bridge script; removing it would require nonce-based dynamic
// rendering (or a full CSS extraction pass) and would undo the current SSG/ISR
// posture. 'unsafe-eval' is dev-only per the Next.js 16 CSP guide.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://plausible.io`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGE_CDN_HOSTS.join(" ")}`,
  "font-src 'self' data:",
  "object-src 'none'",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Google Maps Embed API iframe on the listing-detail page.
  "frame-src 'self' https://www.google.com",
  // Referral/install attribution is via AppsFlyer OneLink URLs, which are
  // navigations / QR values (not fetch/XHR), so connect-src needs no OneLink host.
  "connect-src 'self' https://api.naudokis.lt https://api-dev.naudokis.lt https://plausible.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-ancestors 'self'",
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
  .replace("script-src 'self' 'unsafe-inline'", "script-src 'self'")
  // This directive has no report-only semantics and browsers warn if it is
  // present there; it remains active in the enforced policy above.
  .replace("; upgrade-insecure-requests", "");

// Pragmatic security headers applied to every route.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(!isDev ? [{ key: "Content-Security-Policy-Report-Only", value: strictReportOnlyCsp }] : []),
  { key: "Reporting-Endpoints", value: 'csp-endpoint="/api/csp-report"' },
  // Force HTTPS for two years, including subdomains; eligible for preload lists.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disallow MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block this site from being framed (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send origin only on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No site code needs these powerful features. (browsing-topics is omitted: this
  // ad-tech-free site gains nothing from opting out, and the token only logs an
  // "Unrecognized feature" console error in browsers without the Topics API.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// Mobile-app universal-link / deep-link paths. The app claims these via
// .well-known/{apple-app-site-association,assetlinks.json}; when the app isn't
// installed they fall through to a static promo page (public/deep-link.html,
// noindex). Carried over from the previous site so existing app links keep
// working after the migration.
//
// CANONICAL list of the APP-ONLY deep-link paths (auth-gated screens the web can't
// render) that rewrite to the static deep-link.html interstitial. The same set is
// mirrored, by hand, in two places that can't import it: the `proxy.ts` matcher
// exclusion regex, and the `paths` array in
// public/.well-known/apple-app-site-association. Keep all three in sync when
// adding/removing a path (see public/.well-known/README.md).
//
// NOTE: /invite and /cancel-deletion are DELIBERATELY absent here — each has a real
// localized page that IS its own app-not-installed fallback. They still appear in
// the AASA `paths` (app-installed users open the app), but must NOT rewrite to
// deep-link.html or be excluded from the proxy, or their pages would never render.
const appLinkPaths = [
  "/listing/:path*",
  "/profile/:path*",
  "/booking-request/:path*",
  "/billing-documents/:path*",
  "/review/:path*",
  "/chat/:path*",
  "/my-profile",
  "/rewards",
  "/ref/:path*",
  "/reset-password",
  "/verify-email",
];

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
  async rewrites() {
    // Serve the deep-link fallback without changing the URL (so the universal
    // link still matches if the app installs mid-session).
    return appLinkPaths.map((source) => ({ source, destination: "/deep-link.html" }));
  },
  // Serve modern formats from the built-in optimizer (used by next/image for the
  // hero/CTA phone mockups). AVIF first, WebP fallback. Static brand patterns are
  // pre-encoded to .avif/.webp and served via <picture>, so they skip the optimizer.
  images: {
    formats: ["image/avif", "image/webp"],
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
