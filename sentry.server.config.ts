// Sentry init for the Node.js server runtime. No-ops without a DSN so local dev
// and DSN-less builds stay silent. Loaded from instrumentation.ts.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    enableLogs: false,
  });
}
