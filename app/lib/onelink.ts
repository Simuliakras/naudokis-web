// AppsFlyer OneLink install-link builder — SERVER-SIDE ONLY, and only ever called
// from app/go/route.ts after it has confirmed a stored, current opt-in.
//
// Nothing client-side may build or render a OneLink URL: the referral bridge and
// every install CTA must be able to render with no AppsFlyer URL on the page at
// all (privacy boundary — see app/lib/consent.ts). Install CTAs therefore point at
// the first-party /go, which is the single place that decides OneLink vs. store.
//
// The referral code travels as OneLink's `deep_link_value` param — keep this
// verbatim with the app's UDL handler and the dashboard OneLink template
// (cross-team contract), and identical to the backend's `share_link` builder so
// there is a single link contract. Verify the exact param name against the
// AppsFlyer dashboard template + backend `share_link` builder before launch — a
// silent mismatch drops referral attribution without any error.
//
// Inert until configured: with NEXT_PUBLIC_ONELINK_URL unset, /go keeps its
// OS-sniffing store redirect.
//
// `server-only` makes the boundary a BUILD error rather than a convention: importing
// this from a "use client" module now fails the build, instead of quietly shipping an
// AppsFlyer URL builder to the browser.
import "server-only";
import { SITE_ORIGIN } from "./contact";

const ONELINK_URL = process.env.NEXT_PUBLIC_ONELINK_URL ?? "";

// The configured OneLink template, or null when unset/invalid. HTTPS-only: a
// mistyped value must fail safely to the /go fallback, never to a downgraded
// or relative redirect target.
function oneLinkBase(): URL | null {
  try {
    const url = new URL(ONELINK_URL);
    return url.protocol === "https:" && url.hostname ? url : null;
  } catch {
    return null;
  }
}

// Absolute OneLink URL: the resolved template base plus the given params.
function oneLink(base: URL, params: Record<string, string>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

// The install smart link for /go: an absolute OneLink URL when configured, or null
// so the caller falls back to its OS-sniff store redirect. The referral code, when
// there is one, arrives from /invite as the `deep_link_value` attribution param —
// there is no separate per-code builder, because a per-code URL would have to be
// constructed in the browser, which is exactly what the privacy boundary forbids.
export function buildGenericInstallLink(
  attribution: Record<string, string> = {},
  deepLinkPath?: string,
): string | null {
  const base = oneLinkBase();
  if (!base) {
    return null;
  }
  // Map campaign context onto the OneLink contract: explicit AppsFlyer params
  // win, utm_* fills the gaps, and pid/c always resolve so attribution is never
  // recorded as "unknown".
  const params: Record<string, string> = { ...attribution };
  params.pid = attribution.pid || attribution.utm_source || "web";
  params.c = attribution.c || attribution.utm_campaign || "install";
  if (!params.af_channel && attribution.utm_medium) {
    params.af_channel = attribution.utm_medium;
  }
  if (!params.af_ad && attribution.utm_content) {
    params.af_ad = attribution.utm_content;
  }
  if (!params.af_keywords && attribution.utm_term) {
    params.af_keywords = attribution.utm_term;
  }
  if (deepLinkPath) {
    params.af_dp = `naudokis://${deepLinkPath.replace(/^\/+/, "")}`;
    params.af_web_dp = `${SITE_ORIGIN}${deepLinkPath}`;
  }
  return oneLink(base, params);
}
