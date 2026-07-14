import { after, type NextRequest } from "next/server";
import { verifyHandoffToken } from "@/app/lib/handoff-token";
import { trackServerEvent } from "@/app/lib/server-analytics";
import { isJsonObject, readBoundedJson } from "@/app/lib/bounded-json";
import { clientFingerprint, evictBounded, takeClientRateLimit, takeGlobalRateLimit } from "@/app/lib/request-rate-limit";

const EVENTS = new Set(["native_open", "booking_intent", "owner_listing_intent"]);
// A real token (base64url payload + "." + HMAC-SHA256 signature) stays well
// under this — reject oversized values before doing any crypto work.
const MAX_TOKEN_LENGTH = 512;
const MAX_BODY_BYTES = 2_048;

// Replay suppression is per-instance and check-then-set: two concurrent posts of
// the same token can both slip through, and a second server instance knows
// nothing about what this one accepted. That is acceptable for an analytics
// counter (it de-duplicates the common case — a retried beacon), and it is NOT a
// security control: the signed, expiring token is.
const MAX_ACCEPTED = 10_000;
const ACCEPTED_TARGET = 8_000;

declare global {
  var __nkAcceptedHandoffEvents: Map<string, number> | undefined;
}
const acceptedEvents = (globalThis.__nkAcceptedHandoffEvents ??= new Map<string, number>());

export async function POST(request: NextRequest) {
  const perClient = takeClientRateLimit(clientFingerprint(request), "handoff", 30, 60_000);
  if (!perClient.allowed) {
    return Response.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(perClient.retryAfter) },
    });
  }
  const shared = takeGlobalRateLimit("handoff:global", 600, 60_000);
  if (!shared.allowed) {
    return Response.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(shared.retryAfter) },
    });
  }

  const parsed = await readBoundedJson(request, MAX_BODY_BYTES);
  if (!parsed.ok) {
    return Response.json({ error: parsed.status === 413 ? "Request too large" : "Invalid JSON" }, { status: parsed.status });
  }
  if (!isJsonObject(parsed.value)) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { token, event, platform } = parsed.value;
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH || typeof event !== "string" || !EVENTS.has(event)) {
    return Response.json({ error: "Invalid handoff event" }, { status: 400 });
  }
  const handoff = verifyHandoffToken(token);
  if (!handoff) {
    return Response.json({ error: "Invalid or expired handoff token" }, { status: 401 });
  }

  const now = Date.now();
  const replayKey = `${handoff.jti}:${event}`;
  const replayUntil = acceptedEvents.get(replayKey);
  if (!replayUntil || replayUntil <= now) {
    acceptedEvents.set(replayKey, handoff.exp * 1_000);
    evictBounded({ map: acceptedEvents, expiryOf: (expiry) => expiry, max: MAX_ACCEPTED, target: ACCEPTED_TARGET, now });
    after(() => trackServerEvent(request, "Native Handoff Outcome", {
      event,
      journeyId: handoff.jti,
      targetType: handoff.targetType,
      platform: platform === "ios" || platform === "android" ? platform : "unknown",
    }));
  }
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
