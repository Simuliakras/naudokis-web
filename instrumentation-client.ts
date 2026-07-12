// Sentry init for the browser, loaded lazily so DSN-less builds ship none of
// the ~130 KB SDK. A failed chunk load must degrade to "no monitoring", never
// to an unhandled promise rejection — hence the shared, pre-caught promise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentry = dsn ? import("@sentry/nextjs").catch(() => null) : null;

void sentry?.then((Sentry) =>
  Sentry?.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  }),
);

// Required by @sentry/nextjs to instrument App Router navigations. Statically
// exported; no-ops until the SDK chunk resolves (navigations before that are an
// acceptable loss).
export function onRouterTransitionStart(href: string, navigationType: string) {
  void sentry?.then((Sentry) => Sentry?.captureRouterTransitionStart(href, navigationType));
}
