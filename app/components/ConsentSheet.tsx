"use client";
// Install-attribution consent prompt — contextual, never a site-wide banner.
//
// It opens only when someone acts on an install CTA and no choice is stored yet
// (see use-install-cta.ts). Both actions carry identical visual weight and neither
// is preselected: clicking "download" is not consent, and refusing must be exactly
// as easy as allowing. Dismissing (Escape / close / scrim) stores NOTHING and
// aborts the action — it is not a refusal.
//
// Mounted once via <Chrome/>.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dialog } from "./ui";
import { useI18n } from "./I18nProvider";
import { trackEvent } from "@/app/lib/analytics";
import { localePath } from "@/app/lib/i18n/config";
import {
  NK_CONSENT_ASK_EVENT,
  writeConsent,
  type ConsentAskDetail,
  type ConsentDecision,
} from "@/app/lib/consent";

export function ConsentSheet() {
  const { locale, dict } = useI18n();
  const t = dict.consent;
  const [open, setOpen] = useState(false);
  const resolve = useRef<((decision: ConsentDecision) => void) | null>(null);

  // askConsent() checks this flag: the sheet loads via next/dynamic, so a click can
  // land before it mounts. Until it does, askConsent fails closed (no attribution).
  useEffect(() => {
    window.__nkConsentReady = true;
    const onAsk = (event: Event) => {
      resolve.current = (event as CustomEvent<ConsentAskDetail>).detail.resolve;
      setOpen(true);
    };
    window.addEventListener(NK_CONSENT_ASK_EVENT, onAsk);
    return () => {
      window.__nkConsentReady = false;
      window.removeEventListener(NK_CONSENT_ASK_EVENT, onAsk);
    };
  }, []);

  // The one exit path: store the choice (never a dismissal), tell the caller, close.
  const settle = useCallback((decision: ConsentDecision) => {
    if (decision !== "dismissed") {
      writeConsent(decision);
    }
    trackEvent("Attribution Consent", { choice: decision });
    setOpen(false);
    resolve.current?.(decision);
    resolve.current = null;
  }, []);

  const dismiss = useCallback(() => settle("dismissed"), [settle]);

  return (
    <Dialog open={open} onDismiss={dismiss} title={t.title} description={t.body} closeLabel={t.close}>
      <Link className="nk-consent-privacy" href={localePath(locale, "/privatumo-politika")}>
        {t.privacyLink}
      </Link>
      {/* Same button skin on both: equal prominence is the legal requirement here. */}
      <div className="nk-consent-actions">
        <button type="button" className="nk-btn nk-btn--outline" onClick={() => settle("granted")}>
          {t.allow}
        </button>
        <button type="button" className="nk-btn nk-btn--outline" onClick={() => settle("denied")}>
          {t.decline}
        </button>
      </div>
    </Dialog>
  );
}
