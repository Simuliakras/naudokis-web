// Attribution vocabulary shared by the client bridge modal (AppRedirect.tsx)
// and the /go smart-link route. One key list and one value-cleaning rule keep
// the two ends of the web→app handoff from drifting apart. Client-safe: no
// Node imports.

// Campaign params the browser forwards from the landing URL into /go.
export const WEB_ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "fbclid", "pid", "c", "af_channel", "af_ad", "af_keywords",
] as const;

// Everything /go itself accepts and maps onto the OneLink contract: the web
// set plus the AppsFlyer deep-link passthrough params.
export const GO_ATTRIBUTION_KEYS = [
  ...WEB_ATTRIBUTION_KEYS,
  "deep_link_value",
  ...Array.from({ length: 10 }, (_, i) => `deep_link_sub${i + 1}`),
] as const;

// Strip control characters, trim, and cap the length so a hostile query string
// can never smuggle unbounded or unprintable data into the OneLink redirect.
export function cleanAttributionValue(value: string | null): string | null {
  const clean = value?.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 160);
  return clean || null;
}

// Canonical /go href. `appPath` is the in-app path to resume after install
// (validated server-side by /go); `params` carries handoff + attribution.
export function goHref(appPath?: string, params: Record<string, string> = {}): string {
  const query = new URLSearchParams();
  if (appPath) {
    query.set("target", appPath);
  }
  for (const [key, value] of Object.entries(params)) {
    query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `/go?${qs}` : "/go";
}
