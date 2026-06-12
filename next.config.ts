import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Pragmatic security headers applied to every route. No strict CSP yet — the
// site relies on inline styles, next/font, and cross-origin calls to the
// backend API, so a locked-down CSP needs its own observe-then-enforce pass.
const securityHeaders = [
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

const nextConfig: NextConfig = {
  // NOTE: typedRoutes is deliberately OFF. Public URLs are the proxy-rewritten
  // unprefixed forms (/kategorijos, /skelbimai/[id]) which don't exist in the
  // typed /[lang]/... route tree, so every href would need an `as Route` cast.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Serve modern formats from the built-in optimizer (used by next/image for the
  // hero/CTA phone mockups). AVIF first, WebP fallback. Static brand patterns are
  // pre-encoded to .avif/.webp and served via <picture>, so they skip the optimizer.
  images: {
    formats: ["image/avif", "image/webp"],
    // Listing photos / owner avatars come from the backend's CloudFront
    // distributions, allowlisted per host so arbitrary CloudFront content can't
    // be routed through our optimizer. Add the prod distribution here once it
    // exists (and tighten the pathname to /listings/** if the key layout allows).
    remotePatterns: [
      new URL("https://d720uc9idaijs.cloudfront.net/**"), // dev
    ],
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
