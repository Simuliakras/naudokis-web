import { after, type NextRequest } from "next/server";
import { isTokenizedPath } from "@/app/lib/app-links";
import { isJsonObject, readBoundedJson } from "@/app/lib/bounded-json";
import { clientFingerprint, takeClientRateLimit, takeGlobalRateLimit } from "@/app/lib/request-rate-limit";
import { trackServerEvent } from "@/app/lib/server-analytics";

const METRICS = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);
const MAX_BODY_BYTES = 1_024;

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(request: NextRequest) {
  // Per-client budget FIRST: takeGlobalRateLimit increments, so consuming the shared
  // budget on a request we are about to reject anyway would let one abuser exhaust it
  // and 429 every legitimate browser. Same ordering as csp-report / handoff-event.
  const perClient = takeClientRateLimit(clientFingerprint(request), "web-vitals", 40, 60_000);
  if (!perClient.allowed) {
    return new Response(null, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(perClient.retryAfter) },
    });
  }
  const shared = takeGlobalRateLimit("web-vitals:global", 5_000, 60_000);
  if (!shared.allowed) {
    return new Response(null, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(shared.retryAfter) },
    });
  }

  // sendBeacon posts the Blob's type; the fetch fallback sets it explicitly.
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType && !contentType.includes("application/json")) {
    return new Response(null, { status: 415, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = await readBoundedJson(request, MAX_BODY_BYTES);
  if (!parsed.ok || !isJsonObject(parsed.value)) {
    return new Response(null, { status: parsed.ok ? 400 : parsed.status, headers: { "Cache-Control": "no-store" } });
  }

  const { path, name, value, delta, rating, navigationType } = parsed.value;
  if (
    typeof path !== "string" || !path.startsWith("/") || path.length > 300 || path.includes("?") || path.includes("#") ||
    isTokenizedPath(path) ||
    typeof name !== "string" || !METRICS.has(name) ||
    !finiteNumber(value) || !finiteNumber(delta) || value > 3_600_000 || delta > 3_600_000 ||
    typeof rating !== "string" || !RATINGS.has(rating) ||
    typeof navigationType !== "string" || navigationType.length > 40
  ) {
    return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // Plausible custom events are aggregates, not a raw telemetry store. Preserve
  // enough precision to diagnose regressions (CLS is unitless; other metrics are
  // milliseconds), but do not attach any user or query-string identifiers.
  const roundedValue = name === "CLS" ? Number(value.toFixed(4)) : Math.round(value);
  const roundedDelta = name === "CLS" ? Number(delta.toFixed(4)) : Math.round(delta);
  after(() => trackServerEvent(request, "Web Vital", {
    path,
    metric: name,
    value: roundedValue,
    delta: roundedDelta,
    rating,
    navigationType,
  }));

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
