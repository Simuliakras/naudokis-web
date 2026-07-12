// Single source of truth for the Naudokis backend base URL.
// Defaults to production so a misconfigured build never silently hits dev;
// point at the dev API locally via NEXT_PUBLIC_API_BASE_URL in .env.local.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.naudokis.lt";

// Google Maps Embed API key (client-readable). When unset, the listing-detail
// map falls back to the decorative delivery-zone graphic.
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
