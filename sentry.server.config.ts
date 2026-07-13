// Sentry init for the Node.js server runtime. No-ops without a DSN so local dev
// and DSN-less builds stay silent. Loaded from instrumentation.ts.
import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent } from "@/app/lib/sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    enableLogs: false,
    // Single-use account-action tokens ride in the query of /cancel-deletion,
    // /reset-password and /verify-email. sendDefaultPii:false does not strip them.
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
}
