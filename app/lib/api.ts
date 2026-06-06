// Single source of truth for the Naudokis backend base URL.
// Defaults to production so a misconfigured build never silently hits dev;
// point at the dev API locally via NEXT_PUBLIC_API_BASE_URL in .env.local.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.naudokis.lt";

// Local-only escape hatch: serve mock fixtures instead of the live backend.
// Enabled via NEXT_PUBLIC_USE_MOCK=1 in .env.local for design/screenshot work
// (the public API blocks cross-origin browser requests from localhost). Hard-
// gated to non-production so a leaked env var can never serve fixtures in prod.
export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "1" && process.env.NODE_ENV !== "production";
