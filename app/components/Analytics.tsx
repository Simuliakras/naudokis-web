"use client";
// Google Analytics 4 loader (gtag.js) with Consent Mode v2, default-denied: no
// analytics cookies or storage until the visitor accepts the consent banner.
// Ad flags (ad_storage, ad_user_data, ad_personalization) stay denied forever —
// nothing ever updates them; this site has no ads use case.
//
// All commands live in ONE inline block so their dataLayer order (consent
// default → stored-grant replay → js → config) is guaranteed no matter which
// <Script> executes first — gtag.js drains the queue in push order. The
// stored-grant replay is inline rather than a React effect because an effect
// could push `update` before `default`, which is undefined behavior per
// Google's docs. The loose prefix check is safe: the browser's own Max-Age
// expires the cookie, and the strict parser (readAnalyticsConsent) governs every
// UI surface. Where the two could disagree — a stamp far enough in the future
// that the strict parser rejects it — strict reads "unknown", so ConsentBanner
// shows and the next answer rewrites the cookie, which is what settles it. The
// listener below only fires on a write, so it is not itself the repair path.
//
// The script is kept off the token-bearing account-action pages entirely. It
// reports `page_location`, which on those pages contains a single-use token that
// authorizes a real account action; not loading it is the only way to guarantee
// the token never leaves the browser. (No internal link may point at a tokenized
// path — gtag stays loaded across client-side navigations.)
//
// SPA pageviews rely on the GA property's enhanced measurement ("Page changes
// based on browser history events", ON by default) — no manual pageview effect,
// which would double-count against it.
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isTokenizedPath } from "@/app/lib/app-links";
import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_POLICY_VERSION,
  NK_CONSENT_CHANGE_EVENT,
  readAnalyticsConsent,
} from "@/app/lib/consent";

const GRANTED_PREFIX = `${ANALYTICS_CONSENT_COOKIE}=${ANALYTICS_CONSENT_POLICY_VERSION}.granted.`;

export function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const excluded = isTokenizedPath(pathname);

  // Live grant/withdraw from the banner or the footer "Privacy choices".
  useEffect(() => {
    if (excluded) {
      return;
    }
    const sync = () => {
      if (typeof window.gtag !== "function") {
        return;
      }
      window.gtag("consent", "update", {
        analytics_storage: readAnalyticsConsent() === "granted" ? "granted" : "denied",
      });
    };
    window.addEventListener(NK_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(NK_CONSENT_CHANGE_EVENT, sync);
  }, [excluded]);

  if (excluded) {
    return null;
  }

  const bootstrap = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'});
if (document.cookie.split('; ').some(function (c) { return c.indexOf(${JSON.stringify(GRANTED_PREFIX)}) === 0; })) {
  gtag('consent', 'update', {analytics_storage: 'granted'});
}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});`;

  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {bootstrap}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
    </>
  );
}
