// Single source of truth for the Naudokis backend base URL.
// Defaults to production so a misconfigured build never silently hits dev;
// point at the dev API locally via NEXT_PUBLIC_API_BASE_URL in .env.local.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.naudokis.lt";
