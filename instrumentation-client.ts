// Sentry init for the browser. Runs once on the client. No-ops without a DSN.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  });
}

// Required by @sentry/nextjs to instrument App Router navigations. Exported
// unconditionally (the SDK reads it at build time); it no-ops without a DSN.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
