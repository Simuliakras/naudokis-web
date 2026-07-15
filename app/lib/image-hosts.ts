// Single source of truth for the CDN hosts that may serve listing photos and
// avatars. Imported by BOTH next.config.ts (image `remotePatterns` + the CSP
// `img-src`) and the runtime `cdnImage` guard below, so the build-time allowlist
// and the render-time guard can never drift.
//
// Plain module — no React/next imports — so next.config.ts can import it during
// config evaluation.
//
// Each distribution serves BOTH listing photos (/listings/**) and profile avatars
// (/profiles/**), so a pathname narrowed to /listings/** would break every avatar —
// any tightening has to allow both prefixes per host.
export const IMAGE_CDN_HOSTS = [
  "https://d1fr6so5096lsg.cloudfront.net", // prod
  "https://d720uc9idaijs.cloudfront.net", // dev
] as const;

const allowedHosts = new Set(IMAGE_CDN_HOSTS.map((host) => new URL(host).host));

// Guard a backend-supplied image URL before it reaches next/image: return it
// only when its host is allowlisted, else undefined so callers fall back to the
// placeholder. next/image HARD-THROWS (SSR 500s the whole page) on an
// unconfigured host, so an unexpected host — backend drift, a not-yet-added prod
// distribution, a mock typo — must degrade gracefully instead of crashing.
export function cdnImage(url: string | null | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  try {
    return allowedHosts.has(new URL(url).host) ? url : undefined;
  } catch {
    return undefined;
  }
}
