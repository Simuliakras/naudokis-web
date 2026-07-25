// Client event helper for Google Analytics (gtag). No-ops when the GA script
// isn't loaded (no NEXT_PUBLIC_GA_ID, token pages, script blocked). Events fired
// before consent travel as Consent-Mode cookieless pings — that is the intended
// model, not a leak (see components/Analytics.tsx).
type EventProps = Record<string, string | number | boolean | null | undefined>;

// Without a GA id there is no analytics processing at all — no script, no
// banner, no consent section. The single gate ConsentBanner and PrivacyChoices
// share (Analytics/layout read the id itself, which implies the same thing).
export const GA_ENABLED = Boolean(process.env.NEXT_PUBLIC_GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 event names: lowercase snake_case of letters/digits/underscores, max 40
// chars, and the google_/ga_/firebase_ prefixes are reserved. Call sites keep
// their readable names ("App Bridge Open"); this maps them to the recorded form.
export function toGaEventName(event: string): string {
  return event
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(?:google_|ga_|firebase_)+/, "")
    .slice(0, 40);
}

export function trackEvent(event: string, props?: EventProps) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  const params = props
    ? Object.fromEntries(Object.entries(props).filter(([, value]) => value != null))
    : undefined;
  window.gtag("event", toGaEventName(event), params);
}
