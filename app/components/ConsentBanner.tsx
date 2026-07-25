"use client";
// Site-wide analytics consent banner (Google Analytics) — the counterpart of the
// contextual attribution sheet (ConsentSheet), for the one purpose that IS
// site-wide. Non-modal on purpose: it must never block reading or navigation, so
// no Dialog, no focus trap, no scrim, no Escape. Both actions carry identical
// visual weight and there is no "X": a stored choice is the only way it stops
// showing — a dismissal would re-nag on every page.
//
// Renders nothing when NEXT_PUBLIC_GA_ID is unset (GA never loads, so there is
// nothing to consent to) and on token-bearing account-action pages (kept
// distraction-free; GA is not loaded there either — see Analytics.tsx).
//
// Mounted once via <Chrome/>.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { GA_ENABLED, trackEvent } from "@/app/lib/analytics";
import { localePath } from "@/app/lib/i18n/config";
import { isTokenizedPath } from "@/app/lib/app-links";
import {
  NK_CONSENT_CHANGE_EVENT,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/app/lib/consent";

export function ConsentBanner() {
  const { locale, dict } = useI18n();
  const t = dict.consentBanner;
  const pathname = usePathname();
  // Starts closed; the stored status lands in the effect below. The same change
  // listener also closes it: writing a choice (here or anywhere else) flips the
  // status away from "unknown".
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(readAnalyticsConsent() === "unknown");
    sync();
    window.addEventListener(NK_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(NK_CONSENT_CHANGE_EVENT, sync);
  }, []);

  // Publish the bar's height so the floating chrome it would otherwise cover
  // (.nk-backtotop, the legal TOC FAB) can clear it — see --nk-bars-h in
  // globals.css. Measured, not a constant: the bar wraps from one line to three
  // between 320 and 720px, and the CSS fallback only covers the worst case.
  // A callback ref rather than an effect, so the observer is attached the moment
  // the node exists and torn down the moment it goes — the element is conditional,
  // and a ref object would still be null on the render that mounts it.
  //
  // Both teardown paths are live, and which one runs depends on the branch: React 19
  // calls the returned cleanup INSTEAD of re-invoking the ref with null, so the
  // ResizeObserver path clears the property from its cleanup, while the path that
  // returns nothing (no ResizeObserver) is cleared by the null call below.
  const measure = useCallback((node: HTMLElement | null) => {
    const root = document.documentElement;
    if (!node) {
      root.style.removeProperty("--nk-cookiebar-h");
      return;
    }
    const publish = () => root.style.setProperty("--nk-cookiebar-h", `${node.offsetHeight}px`);
    publish();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--nk-cookiebar-h");
    };
  }, []);

  if (!GA_ENABLED || !open || isTokenizedPath(pathname)) {
    return null;
  }

  const choose = (choice: "granted" | "denied") => {
    // writeAnalyticsConsent dispatches the change event, which flips gtag's
    // consent state first — so an accept is measured with cookies and a decline
    // as a Consent-Mode cookieless ping.
    writeAnalyticsConsent(choice);
    trackEvent("Analytics Consent", { choice });
  };

  return (
    <section ref={measure} className="nk-cookiebar" role="region" aria-label={t.title}>
      <p className="nk-cookiebar__text">
        {t.body}{" "}
        <Link className="nk-consent-privacy" href={localePath(locale, "/privatumo-politika")}>
          {t.privacyLink}
        </Link>
      </p>
      {/* Same button skin on both: equal prominence is the legal requirement here. */}
      <div className="nk-consent-actions">
        <button type="button" className="nk-btn nk-btn--outline" onClick={() => choose("granted")}>
          {t.accept}
        </button>
        <button type="button" className="nk-btn nk-btn--outline" onClick={() => choose("denied")}>
          {t.decline}
        </button>
      </div>
    </section>
  );
}
