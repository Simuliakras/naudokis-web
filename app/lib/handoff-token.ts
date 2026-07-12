import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

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

export function verifyHandoffToken(token: string): HandoffPayload | null {
  const key = secret();
  const [payload, supplied] = token.split(".");
  if (!key || !payload || !supplied) {
    return null;
  }
  const expected = signature(payload, key);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }
  try {
    // JSON.parse is `any` — destructure into typed checks instead of casting so
    // a malformed payload (wrong field types included) can never pass through.
    const parsed: Record<string, unknown> = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const { jti, targetType, exp } = parsed;
    if (typeof jti !== "string" || !jti || typeof targetType !== "string" || !targetType) {
      return null;
    }
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { jti, targetType, exp };
  } catch {
    return null;
  }
}
