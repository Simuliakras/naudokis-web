// The one way client code reaches Sentry.
//
// A static `import * as Sentry from "@sentry/nextjs"` in any client module drags
// the ~130 KB SDK into the default bundle — for every visitor, on every page, even
// in a DSN-less build. So the SDK is imported lazily and only when a DSN is
// configured, and every reporter shares this single pre-caught promise: one chunk,
// loaded at most once, and a failed chunk load degrades to "no monitoring" instead
// of an unhandled rejection.
//
// This module is import-safe from both runtimes. On the server the SDK is already
// initialised (instrumentation.ts → sentry.server.config.ts) and the dynamic import
// resolves from module cache; in the browser instrumentation-client.ts init()s it
// off this same promise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentry = dsn ? import("@sentry/nextjs").catch(() => null) : null;

// Fire-and-forget: reporting must never delay or fail the path that is already
// handling the error.
export function captureException(error: unknown, extra?: Record<string, unknown>): void {
  void sentry?.then((Sentry) => Sentry?.captureException(error, extra ? { extra } : undefined));
}
