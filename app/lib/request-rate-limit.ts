import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";

/* ---------------- Client identity ----------------
   `X-Forwarded-For` is a client-settable header. Proxies APPEND to it, so the
   left-most entry is whatever the caller typed and the right-most entries are the
   ones written by infrastructure we control. Keying a limiter on the left-most
   value hands an attacker a fresh bucket per request, and the limit never fires —
   so the header is only read when the deployment states how many hops in front of
   the app it actually owns.

   TRUSTED_PROXY_HOPS = number of proxies we control (1 for a single CDN/LB, and so
   on). Unset or 0 — the default — means "trust nothing": there is no per-client
   identity and callers fall back to their global backstop alone. That is a coarser
   limit, but it is an honest one, rather than a per-client cap that silently does
   not enforce.

   A deployment-level WAF remains the authoritative distributed limit. Everything
   here is per-instance and bounded: it protects a warm server instance, and it
   never retains a raw address. */
const configuredHops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0);
const TRUSTED_HOPS = Number.isInteger(configuredHops) && configuredHops > 0 ? configuredHops : 0;

// Returns null when no client can be identified. Callers must treat that as "no
// per-client limiting available" — never as a shared "unknown" bucket, which one
// abuser could then use to lock out every other anonymous caller.
export function clientFingerprint(request: Request): string | null {
  if (TRUSTED_HOPS === 0) {
    return null;
  }
  const hops = (request.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((hop) => hop.trim())
    .filter(Boolean);
  // The address the outermost proxy we control actually observed.
  const client = hops[hops.length - TRUSTED_HOPS];
  if (!client || !isIP(client)) {
    return null;
  }
  return createHash("sha256").update(client).digest("base64url").slice(0, 22);
}

/* ---------------- Bounded buckets ---------------- */
type Bucket = { count: number; resetAt: number };

declare global {
  var __nkClientBuckets: Map<string, Bucket> | undefined;
  var __nkFixedBuckets: Map<string, Bucket> | undefined;
}

// Client buckets have attacker-influenced cardinality, so they are capped and
// evicted. Fixed buckets (the global backstops) have a key set defined in code, so
// they live in their own map and are NEVER evicted: a sweep that can drop the
// global counter resets the one limit that still works when per-client identity is
// unavailable.
const clientBuckets = (globalThis.__nkClientBuckets ??= new Map<string, Bucket>());
const fixedBuckets = (globalThis.__nkFixedBuckets ??= new Map<string, Bucket>());

const MAX_CLIENT_BUCKETS = 4_000;
const CLIENT_BUCKETS_TARGET = 3_000;

// Drop expired entries; if still over target, drop the ones expiring soonest.
// Shared with the handoff replay-dedupe map, which is the same shape: bounded,
// best-effort, per-instance.
export function evictBounded<T>(
  { map, expiryOf, max, target, now }:
  { map: Map<string, T>; expiryOf: (value: T) => number; max: number; target: number; now: number },
): void {
  if (map.size <= max) {
    return;
  }
  for (const [key, value] of map) {
    if (expiryOf(value) <= now) {
      map.delete(key);
    }
  }
  if (map.size <= target) {
    return;
  }
  const soonestFirst = [...map.entries()].sort((a, b) => expiryOf(a[1]) - expiryOf(b[1]));
  for (const [key] of soonestFirst.slice(0, map.size - target)) {
    map.delete(key);
  }
}

function take(map: Map<string, Bucket>, key: string, limit: number, windowMs: number, now: number) {
  const current = map.get(key);
  if (!current || current.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return {
    allowed: current.count <= limit,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
}

// Per-client limit. A null fingerprint (no trusted proxy configured) reports
// `allowed` so the caller falls through to its global backstop.
export function takeClientRateLimit(fingerprint: string | null, scope: string, limit: number, windowMs: number) {
  if (!fingerprint) {
    return { allowed: true, retryAfter: 0 };
  }
  const now = Date.now();
  const result = take(clientBuckets, `${scope}:${fingerprint}`, limit, windowMs, now);
  evictBounded({ map: clientBuckets, expiryOf: (bucket) => bucket.resetAt, max: MAX_CLIENT_BUCKETS, target: CLIENT_BUCKETS_TARGET, now });
  return result;
}

// Global backstop for a route. Bounded, code-defined key set; never evicted.
export function takeGlobalRateLimit(key: string, limit: number, windowMs: number) {
  return take(fixedBuckets, key, limit, windowMs, Date.now());
}
