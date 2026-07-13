// Sentry init for the Edge runtime (proxy.ts / edge routes). No-ops without a
// DSN. Loaded from instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent } from "@/app/lib/sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    enableLogs: false,
    // The proxy sees every tokenized URL before the page does — scrub here too.
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}
