// Sentry init for the browser, loaded lazily so DSN-less builds ship none of
// the ~130 KB SDK. A failed chunk load must degrade to "no monitoring", never
// to an unhandled promise rejection — hence the shared, pre-caught promise.
import { scrubBreadcrumb, scrubEvent } from "@/app/lib/sentry-scrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentry = dsn ? import("@sentry/nextjs").catch(() => null) : null;

void sentry?.then((Sentry) =>
  Sentry?.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    // The account-action pages (/cancel-deletion, /reset-password, /verify-email)
    // carry a single-use token in the query, and Sentry attaches the page URL to
    // every event and navigation breadcrumb. sendDefaultPii:false does not strip it.
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  }),
);

// Required by @sentry/nextjs to instrument App Router navigations. Statically
// exported; no-ops until the SDK chunk resolves (navigations before that are an
// acceptable loss).
export function onRouterTransitionStart(href: string, navigationType: string) {
  void sentry?.then((Sentry) => Sentry?.captureRouterTransitionStart(href, navigationType));
}
