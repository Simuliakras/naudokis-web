"use client";
// Site-wide analytics consent banner (Google Analytics) — the counterpart of the
// contextual attribution sheet (ConsentSheet), for the one purpose that IS
// site-wide. Non-modal on purpose: it must never block reading or navigation, so
// no Dialog, no focus trap, no scrim, no Escape. There is no "X": a stored choice
// is the only way it stops showing — a dismissal would re-nag on every page.
//
// The accept carries the primary skin (product decision, 2026-08-01) — this bar is
// the one first-ask surface that does; ConsentSheet still weights its two answers
// identically. What is kept on both here is everything about REACHING the answer:
// the same size, the same type, the same 44px target, both on screen without
// scrolling, and neither autofocused.
//
// The heading is VISIBLE and names the region through aria-labelledby rather than
// aria-label: the same string either way, but now the accessible name is the one
// on screen (WCAG 2.5.3). Its icon chip is the analytics purpose's own icon from
// the footer privacy panel, so the two surfaces read as one family.
//
// Renders nothing when NEXT_PUBLIC_GA_ID is unset (GA never loads, so there is
// nothing to consent to) and on token-bearing account-action pages (kept
// distraction-free; GA is not loaded there either — see Analytics.tsx).
//
// Mounted once via <Chrome/>.
import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./ui";
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
  const titleId = useId();
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
  // globals.css. Measured, not a constant: the bar ranges 136–261px between 1920
  // and 360, as the actions leave the copy's row at --breakpoint-nav and the copy
  // itself wraps from two lines to four. --nk-cookiebar-h's :root default is only
  // the worst case, to keep every clearance sane on the frame before this
  // publishes the real one.
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
    <section ref={measure} className="nk-cookiebar" role="region" aria-labelledby={titleId}>
      {/* The bar is full-bleed, so the content rides the site's own container —
          the same .nk-container the nav's inner row uses, which is what lines the
          chip up with the logo and the actions up with the install CTA. */}
      <div className="nk-container nk-cookiebar__inner">
        <div className="nk-cookiebar__copy">
          <div className="nk-cookiebar__head">
            <span className="nk-cookiebar__icon" aria-hidden="true">
              <Icon name="ChartNoAxesColumn" size={16} stroke={2} />
            </span>
            <h2 id={titleId} className="nk-cookiebar__title">
              {t.title}
            </h2>
          </div>
          <p className="nk-cookiebar__text">
            {t.body}{" "}
            <Link className="nk-consent-privacy" href={localePath(locale, "/privatumo-politika")}>
              {t.privacyLink}
            </Link>
          </p>
        </div>
        {/* Different skin, identical size and type — see the header note. Below the
            nav tier the shared .nk-consent-actions basis still splits the row evenly,
            so on a phone the two answers are exactly the same target. */}
        <div className="nk-consent-actions">
          <button
            type="button"
            className="nk-btn nk-btn--primary nk-btn--sm"
            onClick={() => choose("granted")}
          >
            {t.accept}
          </button>
          <button
            type="button"
            className="nk-btn nk-btn--outline nk-btn--sm"
            onClick={() => choose("denied")}
          >
            {t.decline}
          </button>
        </div>
      </div>
    </section>
  );
}
