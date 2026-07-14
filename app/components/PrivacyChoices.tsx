"use client";
// Footer "Privacy choices" — the permanent home of the install-attribution choice,
// so it can be changed or withdrawn from any page without hunting for the prompt.
//
// Withdrawing stores an explicit refusal rather than deleting the cookie: /go reads
// "denied" exactly as it reads a missing cookie (straight to the store, AppsFlyer
// never sees the click), but the person who just said no isn't asked again on their
// next install click. This is a WEBSITE preference — it deliberately says nothing
// about the app's own analytics setting, which the user controls in the app.
//
// Lives in the Footer, so it renders inside StatusScreen (the error/404 chrome) too —
// and StatusScreen reads the dictionary OPTIONALLY, because the [lang] layout can call
// notFound() for an invalid locale before mounting I18nProvider. Today the proxy always
// rewrites to a valid locale, so that path isn't reachable and useI18n would not
// actually throw; this leaf matches the surrounding convention rather than betting the
// footer on that staying true.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "./ui";
import { useI18nOptional } from "./I18nProvider";
import { trackEvent } from "@/app/lib/analytics";
import { localePath } from "@/app/lib/i18n/config";
import {
  NK_CONSENT_CHANGE_EVENT,
  readConsent,
  writeConsent,
  type ConsentStatus,
} from "@/app/lib/consent";

export function PrivacyChoices() {
  const { locale, dict } = useI18nOptional();
  const t = dict.privacyChoices;
  const [open, setOpen] = useState(false);
  // Starts "unknown" so the first client render matches the server HTML; the real
  // value lands in the effect below (the panel can't be open before that anyway).
  const [status, setStatus] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    const sync = () => setStatus(readConsent());
    sync();
    window.addEventListener(NK_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(NK_CONSENT_CHANGE_EVENT, sync);
  }, []);

  const granted = status === "granted";
  const choose = (allow: boolean) => {
    writeConsent(allow ? "granted" : "denied");
    trackEvent("Attribution Preference", { choice: allow ? "granted" : "withdrawn" });
  };

  return (
    <>
      <button type="button" className="nk-privacy-trigger" onClick={() => setOpen(true)}>
        {t.trigger}
      </button>

      <Dialog open={open} onDismiss={() => setOpen(false)} title={t.title} description={t.body}
        closeLabel={t.close}>
        {/* Announced, not just repainted — the status IS the answer to why you opened this. */}
        <p className="nk-consent-status" aria-live="polite">
          {t.statusLabel}: <strong>{granted ? t.statusAllowed : t.statusNotAllowed}</strong>
        </p>
        <div className="nk-consent-actions">
          <button type="button" className="nk-btn nk-btn--outline" onClick={() => choose(!granted)}>
            {granted ? t.withdraw : t.allow}
          </button>
        </div>
        <p className="nk-consent-note">{t.scopeNote}</p>
        <Link className="nk-consent-privacy" href={localePath(locale, "/privatumo-politika")}>
          {t.privacyLink}
        </Link>
      </Dialog>
    </>
  );
}
