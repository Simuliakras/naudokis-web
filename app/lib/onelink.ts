// AppsFlyer OneLink install-link builder — SERVER-SIDE ONLY, and only ever called
// from app/go/route.ts after it has confirmed a stored, current opt-in.
//
// Nothing client-side may build or render a OneLink URL: the referral bridge and
// every install CTA must be able to render with no AppsFlyer URL on the page at
// all (privacy boundary — see app/lib/consent.ts). Install CTAs therefore point at
// the first-party /go, which is the single place that decides OneLink vs. store.
//
// `deep_link_value` is the app's UDL dispatch key, and the app team confirmed its
// shape against the shipped handler (2026-07-21). Two branches:
//
//   - A reserved keyword routes to a screen. `listing` is the only one the web
//     emits; the id rides in `deep_link_sub1`.
//   - ANY other value falls through to the referral branch and is validated as an
//     8-character referral code. That is why /invite sends the bare code with no
//     keyword, and why it must stay that way — matching the backend's `share_link`
//     builder so there is a single link contract.
//
// The fallthrough is what makes a wrong value here fail silently rather than
// loudly: `listing/<id>` would be read as a referral code and dropped without an
// error anywhere. Never invent a keyword — confirm it against the handler first.
//
// The handler reads ONLY `deep_link_value` + `deep_link_sub1`/`sub2`, and
// early-returns when `deep_link_value` is absent. `af_dp`/`af_web_dp` are read by
// nothing in the app; they are kept for other clients and cost nothing.
//
// Inert until configured: with NEXT_PUBLIC_ONELINK_URL unset, /go keeps its
// OS-sniffing store redirect.
//
// `server-only` makes the boundary a BUILD error rather than a convention: importing
// this from a "use client" module now fails the build, instead of quietly shipping an
// AppsFlyer URL builder to the browser.
import "server-only";
import { SITE_ORIGIN } from "./contact";
import { listingIdFromAppPath } from "./app-links";

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
    // The UDL pair, and the only thing the app actually reads. Assigned last so a
    // server-validated target always beats a `deep_link_value` smuggled in via the
    // query string: /go validates the target, it does not validate that param.
    // Both keys or neither — a bare `listing` with no id routes the app to a screen
    // it cannot populate.
    const id = listingIdFromAppPath(deepLinkPath);
    if (id) {
      params.deep_link_value = "listing";
      params.deep_link_sub1 = id;
    }
  }
  return oneLink(base, params);
}
