import { cityCoordinates } from "@/app/lib/city-coordinates";
import { isLocale } from "@/app/lib/i18n/config";
import { isDrawableRadiusKm, isMasked, type Coordinates } from "@/app/lib/map-geometry";
import { buildStaticMapUrl } from "@/app/lib/map-style";
import { clientFingerprint, takeClientRateLimit, takeGlobalRateLimit } from "@/app/lib/request-rate-limit";

/* ---------------- The listing map's image source ----------------
   The browser asks US for the map, never Google. That is the whole point of this
   route and it buys three things at once:

     1. The API key stays server-side. It used to ship in the HTML of every listing
        page as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
     2. No third-party request leaves the visitor's browser, so there is nothing to
        ask consent for — which is why the listing page no longer has a click-to-load
        panel in front of its map. This is a stronger answer to AUDIT-2026-07-11's
        PRIV-001 than the gate was, not a rollback of it.
     3. The CSP needs no new grant: `img-src 'self'` already covers this path.

   Do NOT "simplify" this away by pointing an <img> straight at maps.googleapis.com.
   All three properties above are lost in that one edit.

   Everything the URL can express is whitelisted below, so this cannot be used as an
   open image proxy, and the reachable URL space (cities × radii × 2 locales) is small
   enough to stay warm in a CDN. */

// Lithuania, padded. Together with the masking grid this bounds the reachable URL
// space to LT's ~1km cells, so the route can serve real handover points without
// becoming a general-purpose "render me any place on earth" endpoint.
const LT_BOUNDS = { minLat: 53.8, maxLat: 56.5, minLon: 20.9, maxLon: 26.9 };
const CACHE_SECONDS = 2_592_000; // 30 days — Google's ceiling for cached map content.
const BROWSER_CACHE_SECONDS = 86_400;
const UPSTREAM_TIMEOUT_MS = 8_000;

function fail(status: number): Response {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

// Integer kilometres only, and only within the range isDrawableRadiusKm allows — the
// same predicate the listing page asks before requesting a circle, so the two cannot
// disagree about what is drawable.
function parseRadiusKm(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const radius = Number(raw);
  return isDrawableRadiusKm(radius) ? radius : null;
}

/* Either an explicit handover point or a named city, never a free-form place.

   A point has to be inside Lithuania AND already rounded to the masking grid. The
   precision check is the load-bearing one: it is what stops this route from being
   asked to render somebody's exact address, no matter what the page in front of it
   does. Reject rather than round — a silent round would make a leak look like it
   worked. */
function parseCoordinates(params: URLSearchParams): Coordinates | null {
  const rawLat = params.get("lat");
  const rawLon = params.get("lon");
  if (rawLat === null && rawLon === null) {
    const city = params.get("city");
    return (city ? cityCoordinates(city) : undefined) ?? null;
  }
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (!rawLat || !rawLon || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  if (lat < LT_BOUNDS.minLat || lat > LT_BOUNDS.maxLat || lon < LT_BOUNDS.minLon || lon > LT_BOUNDS.maxLon) {
    return null;
  }
  if (!isMasked({ lat, lon })) {
    return null;
  }
  return { lat, lon };
}

export async function GET(request: Request) {
  // Per-client budget first, so one abuser cannot burn the shared budget and 429
  // every legitimate reader (same ordering as app/api/csp-report).
  const perClient = takeClientRateLimit(clientFingerprint(request), "map", 120, 60_000);
  if (!perClient.allowed) {
    return fail(429);
  }
  const shared = takeGlobalRateLimit("map:global", 1_200, 60_000);
  if (!shared.allowed) {
    return fail(429);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // No key configured (local dev, previews): the caller renders the delivery-zone
    // graphic on its own. 404 rather than 500 — this is a missing resource, not a bug.
    return fail(404);
  }

  const params = new URL(request.url).searchParams;
  const language = params.get("lang");
  if (!language || !isLocale(language)) {
    return fail(400);
  }

  const coordinates = parseCoordinates(params);
  if (!coordinates) {
    return fail(400);
  }

  const rawRadius = params.get("radius");
  const radiusKm = parseRadiusKm(rawRadius);
  if (rawRadius && radiusKm === null) {
    return fail(400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(buildStaticMapUrl({ coordinates, radiusKm, language, apiKey }), {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      next: { revalidate: CACHE_SECONDS },
    });
  } catch {
    return fail(502);
  }
  if (!upstream.ok) {
    return fail(502);
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
}
