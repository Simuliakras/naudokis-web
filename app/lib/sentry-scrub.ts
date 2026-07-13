// Keep single-use account-action tokens out of error reporting.
//
// The password-reset / email-verification / deletion-cancel links carry a token in
// the query that authorizes a real account action. Sentry attaches the page URL to
// every event and to navigation breadcrumbs, and `sendDefaultPii: false` does NOT
// strip query strings — so without this, one JS error on /cancel-deletion ships a
// live deletion token to a third party.
//
// Redacts by key, in place of the value, so the URL still reads normally in the
// issue (the path and the fact that a token was present are the useful parts).

const SENSITIVE_KEYS = ["token"];
const REDACTED = "[redacted]";

export function scrubUrl(value: string): string {
  try {
    // Relative URLs (breadcrumb `to`/`from`) need a base to parse; it is discarded
    // below, so its value never matters.
    const absolute = /^[a-z][a-z0-9+.-]*:/i.test(value);
    const url = new URL(value, "https://redacted.invalid");
    let hit = false;
    for (const key of SENSITIVE_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, REDACTED);
        hit = true;
      }
    }
    if (!hit) {
      return value;
    }
    return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

// Structural types rather than Sentry's own: this module is imported by the client,
// server and edge configs, and must not pull the SDK into a DSN-less bundle.
type ScrubbableEvent = {
  request?: { url?: string; query_string?: unknown };
  transaction?: string;
};
type ScrubbableBreadcrumb = { data?: Record<string, unknown> };

export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.request?.url) {
    event.request.url = scrubUrl(event.request.url);
  }
  // query_string is the raw query, so it can carry the token with no URL around it.
  if (typeof event.request?.query_string === "string") {
    event.request.query_string = scrubUrl(`?${event.request.query_string}`).replace(/^\?/, "");
  }
  if (event.transaction) {
    event.transaction = scrubUrl(event.transaction);
  }
  return event;
}

// Navigation / fetch / XHR breadcrumbs carry their own URLs.
export function scrubBreadcrumb<T extends ScrubbableBreadcrumb>(breadcrumb: T): T {
  for (const key of ["url", "to", "from"]) {
    const value = breadcrumb.data?.[key];
    if (typeof value === "string" && breadcrumb.data) {
      breadcrumb.data[key] = scrubUrl(value);
    }
  }
  return breadcrumb;
}
