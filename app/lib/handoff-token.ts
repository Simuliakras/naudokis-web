import { createHmac, randomUUID } from "node:crypto";

// /go signs a journey token into OneLink deep_link_sub10 so the app can
// recognize a web handoff. The web-side verifier went with the
// /api/handoff-event endpoint (Plausible→GA migration) — nothing on this
// origin reads the token back any more.
type HandoffPayload = { jti: string; targetType: string; exp: number };

function secret(): string | null {
  const value = process.env.HANDOFF_SIGNING_SECRET ?? "";
  return value.length >= 32 ? value : null;
}

function signature(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createHandoffToken(targetPath?: string): string | null {
  const key = secret();
  if (!key) {
    return null;
  }
  const targetType = targetPath?.split("/").filter(Boolean)[0] ?? "install";
  const payload = Buffer.from(JSON.stringify({
    jti: randomUUID(),
    targetType,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  } satisfies HandoffPayload)).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
}
