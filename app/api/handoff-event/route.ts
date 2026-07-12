import type { NextRequest } from "next/server";
import { verifyHandoffToken } from "@/app/lib/handoff-token";
import { trackServerEvent } from "@/app/lib/server-analytics";

const EVENTS = new Set(["native_open", "booking_intent", "owner_listing_intent"]);
// A real token (base64url payload + "." + HMAC-SHA256 signature) stays well
// under this — reject oversized values before doing any crypto work.
const MAX_TOKEN_LENGTH = 512;

export async function POST(request: NextRequest) {
  let body: { token?: string; event?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { token, event, platform } = body;
  if (!token || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH || !event || !EVENTS.has(event)) {
    return Response.json({ error: "Invalid handoff event" }, { status: 400 });
  }
  const handoff = verifyHandoffToken(token);
  if (!handoff) {
    return Response.json({ error: "Invalid or expired handoff token" }, { status: 401 });
  }
  await trackServerEvent(request, "Native Handoff Outcome", {
    event,
    journeyId: handoff.jti,
    targetType: handoff.targetType,
    platform: platform === "ios" || platform === "android" ? platform : "unknown",
  });
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
