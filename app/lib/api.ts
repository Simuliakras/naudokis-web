// Single source of truth for the Naudokis backend base URL.
// Defaults to production so a misconfigured build never silently hits dev;
// point at the dev API locally via NEXT_PUBLIC_API_BASE_URL in .env.local.
export const PRODUCTION_API_BASE = "https://api.naudokis.lt";
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? PRODUCTION_API_BASE;

// Whether the configured backend is the production catalogue. Gates data that
// must never carry dev/staging records into public SEO surfaces (the listing
// sitemap). Compared against the constant above, so pointing prod at an alias
// host is a one-line change here rather than a silently empty sitemap.
export const USES_PRODUCTION_API = API_BASE === PRODUCTION_API_BASE;

// Google Maps Embed API key (client-readable). When unset, the listing-detail
// map falls back to the decorative delivery-zone graphic.
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
