import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Listing photos / owner avatars come from the backend's CloudFront
// distributions, allowlisted per host (shared by image remotePatterns and the
// CSP img-src so the two can't drift). Add the prod distribution here once it
// exists (and tighten the pathname to /listings/** if the key layout allows).
const imageCdnHosts = [
  "https://d720uc9idaijs.cloudfront.net", // dev
];

// Observe-then-enforce CSP: served as Report-Only so violations surface in the
// browser console (and Sentry, once a `report-to` endpoint is wired) without
// breaking anything. 'unsafe-inline' is required today — the UI uses inline
// style={} objects and Next.js streams inline bootstrap scripts. Once the
// report stream is clean, rename the key to Content-Security-Policy.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${imageCdnHosts.join(" ")}`,
  "font-src 'self' data:",
  // Google Maps Embed API iframe on the listing-detail page.
  "frame-src 'self' https://www.google.com",
  "connect-src 'self' https://api.naudokis.lt https://api-dev.naudokis.lt https://plausible.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

// Pragmatic security headers applied to every route. The strict CSP runs in
// report-only mode (above) until its violation stream is clean.
const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
  // Force HTTPS for two years, including subdomains; eligible for preload lists.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disallow MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block this site from being framed (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send origin only on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // No site code needs these powerful features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

// Mobile-app universal-link / deep-link paths. The app claims these via
// .well-known/{apple-app-site-association,assetlinks.json}; when the app isn't
// installed they fall through to a static promo page (public/deep-link.html,
// noindex). Carried over from the previous site so existing app links keep
// working after the migration.
//
// CANONICAL list of deep-link paths. The same set is mirrored, by hand, in two
// places that can't import it: the `proxy.ts` matcher exclusion regex, and the
// `paths` array in public/.well-known/apple-app-site-association. Keep all three
// in sync when adding/removing a path (see public/.well-known/README.md).
const appLinkPaths = [
  "/listing/:path*",
  "/booking-request/:path*",
  "/review/:path*",
  "/chat/:path*",
  "/my-profile",
  "/ref/:path*",
];

const nextConfig: NextConfig = {
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
      {
        source: "/:path*",
        has: [{ type: "host", value: "^naudokis\\.lt$" }],
        destination: "https://www.naudokis.lt/:path*",
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
    // Per-host CDN allowlist (see imageCdnHosts) so arbitrary CloudFront
    // content can't be routed through our optimizer.
    remotePatterns: imageCdnHosts.map((host) => new URL(`${host}/**`)),
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
