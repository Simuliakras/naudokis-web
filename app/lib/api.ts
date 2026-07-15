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

/* ---------------- The marketplace fetch boundary ----------------
   Every call to the backend goes through marketplaceFetch, so the timeout and the
   error taxonomy are decided in exactly one place. It lives here, next to API_BASE,
   rather than in listings.ts: availability.ts needs the same boundary, and having a
   leaf data module import the whole query/fetcher module to reach a 6-line wrapper is
   a dependency pointing the wrong way. listings.ts re-exports these for its existing
   callers. */
export type MarketplaceErrorKind = "timeout" | "network" | "server";

export class MarketplaceApiError extends Error {
  constructor(public readonly kind: MarketplaceErrorKind, public readonly status?: number) {
    super(kind === "server" && status ? `Marketplace API error: ${status}` : `Marketplace API ${kind} error`);
    this.name = "MarketplaceApiError";
  }
}

// Distinguishes the two failures worth telling apart — a request that never landed
// (timeout/network: retryable, the user's connection) from one that did and came back
// wrong (server). Everything downstream branches on this, not on raw fetch errors.
export async function marketplaceFetch(input: string | URL, init?: Parameters<typeof fetch>[1]): Promise<Response> {
  try {
    return await fetch(input, { ...init, signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new MarketplaceApiError("timeout");
    }
    throw new MarketplaceApiError("network");
  }
}

export function marketplaceErrorKind(error: unknown): MarketplaceErrorKind {
  return error instanceof MarketplaceApiError ? error.kind : "server";
}
