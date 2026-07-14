import { after } from "next/server";
import { isJsonObject, readBoundedJson } from "@/app/lib/bounded-json";
import { clientFingerprint, evictBounded, takeClientRateLimit, takeGlobalRateLimit } from "@/app/lib/request-rate-limit";

const MAX_REPORT_BYTES = 64 * 1024;

/* ---------------- Violation de-duplication ----------------
   The strict report-only policy is knowingly violated by Next's own inline
   bootstrap, so the SAME violation arrives once per page view. Log each distinct
   violation once per window and drop the repeats: otherwise the only useful
   signal — a violation we have not seen before — is buried under one identical
   line per visitor. */
const SIGNATURE_TTL_MS = 10 * 60_000;
const MAX_SIGNATURES = 2_000;
const SIGNATURES_TARGET = 1_500;

declare global {
  var __nkCspSignatures: Map<string, number> | undefined;
}
const seenSignatures = (globalThis.__nkCspSignatures ??= new Map<string, number>());

function redactReportUrls(value: unknown, key = "", depth = 0): unknown {
  if (depth > 8) return "[depth-limit]";
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactReportUrls(item, key, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).slice(0, 50).map(([childKey, child]) => [childKey, redactReportUrls(child, childKey, depth + 1)]),
    );
  }
  if (typeof value === "string" && /(url|uri|source-file)/i.test(key)) {
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    } catch {
      return value.slice(0, 240);
    }
  }
  return typeof value === "string" ? value.slice(0, 500) : value;
}

function stringField(report: unknown, ...names: string[]): string {
  if (!isJsonObject(report)) {
    return "";
  }
  for (const name of names) {
    const value = report[name];
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

// Identify a violation by what it IS, never by who reported it. Handles both wire
// shapes: the legacy `{"csp-report": {…}}` body and the Reporting API's
// `[{ type, body: {…} }]` array.
function violationSignature(body: unknown): string {
  const first = Array.isArray(body) ? body[0] : body;
  const nested = isJsonObject(first) ? (first["csp-report"] ?? first.body) : undefined;
  const report = isJsonObject(nested) ? nested : first;
  const directive = stringField(report, "effective-directive", "effectiveDirective", "violated-directive", "violatedDirective");
  const blocked = stringField(report, "blocked-uri", "blockedURL", "blockedURI");
  const document = stringField(report, "document-uri", "documentURL", "documentURI");
  return `${directive}|${pathOf(blocked)}|${pathOf(document)}`;
}

function isFirstSighting(signature: string, now: number): boolean {
  const seenUntil = seenSignatures.get(signature);
  if (seenUntil && seenUntil > now) {
    return false;
  }
  seenSignatures.set(signature, now + SIGNATURE_TTL_MS);
  evictBounded({ map: seenSignatures, expiryOf: (expiry) => expiry, max: MAX_SIGNATURES, target: SIGNATURES_TARGET, now });
  return true;
}

export async function POST(request: Request) {
  // Per-client budget FIRST: consuming the shared budget on a request we are about
  // to reject would let one abuser exhaust it and 429 every legitimate browser.
  const perClient = takeClientRateLimit(clientFingerprint(request), "csp", 60, 60_000);
  if (!perClient.allowed) {
    return new Response(null, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(perClient.retryAfter) },
    });
  }
  const shared = takeGlobalRateLimit("csp:global", 600, 60_000);
  if (!shared.allowed) {
    return new Response(null, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(shared.retryAfter) },
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType &&
    !contentType.includes("application/csp-report") &&
    !contentType.includes("application/reports+json") &&
    !contentType.includes("application/json")
  ) {
    return new Response(null, { status: 415, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = await readBoundedJson(request, MAX_REPORT_BYTES);
  if (!parsed.ok) {
    return new Response(null, { status: parsed.status, headers: { "Cache-Control": "no-store" } });
  }
  const body = parsed.value;
  // The Reporting API posts an array of reports; the legacy endpoint posts one object.
  if (!isJsonObject(body) && !Array.isArray(body)) {
    return new Response(null, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  after(() => {
    if (!isFirstSighting(violationSignature(body), Date.now())) {
      return;
    }
    // CSP document/source URLs can contain one-time action tokens. Keep the
    // violation evidence while stripping query strings and fragments before it
    // reaches platform logs.
    console.warn("[csp-report]", JSON.stringify(redactReportUrls(body)).slice(0, MAX_REPORT_BYTES));
  });

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
