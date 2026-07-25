"use client";
// Footer "Privacy choices" — the permanent home of both website choices: install
// attribution (AppsFlyer) and analytics (Google Analytics), so either can be
// changed or withdrawn from any page without hunting for its prompt.
//
// Withdrawing stores an explicit refusal rather than deleting the cookie: /go and
// gtag read "denied" exactly as they read a missing cookie, but the person who
// just said no isn't asked again. Withdrawing analytics also deletes Google's
// _ga* cookies (see consent.ts). These are WEBSITE preferences — they
// deliberately say nothing about the app's own analytics setting, which the user
// controls in the app.
//
// Lives in the Footer, so it renders inside StatusScreen (the error/404 chrome) too —
// and StatusScreen reads the dictionary OPTIONALLY, because the [lang] layout can call
// notFound() for an invalid locale before mounting I18nProvider. Today the proxy always
// rewrites to a valid locale, so that path isn't reachable and useI18n would not
// actually throw; this leaf matches the surrounding convention rather than betting the
// footer on that staying true.
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Dialog, Icon, Switch, type IconName } from "./ui";
import { useI18nOptional } from "./I18nProvider";
import { GA_ENABLED, trackEvent } from "@/app/lib/analytics";
import { localePath } from "@/app/lib/i18n/config";
import type { ConsentDetail, ConsentPurposeCopy } from "@/app/lib/i18n/types";
import {
  NK_CONSENT_CHANGE_EVENT,
  readAnalyticsConsent,
  readConsent,
  writeAnalyticsConsent,
  writeConsent,
  type ConsentStatus,
} from "@/app/lib/consent";

/* ---------------- Fact sheet ----------------
   The "what this means" disclosure, shared by every card so the collapse logic
   exists once. Class-based, deliberately NOT <details>/<summary>: useFocusTrap's
   FOCUSABLE selector matches a[href]/button/input/[tabindex] and never `summary`,
   so a summary in the last card would sit past the last matched element and become
   unreachable by keyboard.

   `inert` is what removes the collapsed facts from the a11y tree — the 0fr grid row
   only clips paint (same fix as FaqRow). The region sits AFTER its trigger, so it
   always grows downward and never moves the panel's scroll position; there is no
   scrollIntoView here on purpose. Text only: nothing focusable may go inside, or
   the overflow clip would cut its focus ring. */
function Details({ label, facts }: { label: string; facts: ConsentDetail[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <>
      <button type="button" className="nk-consent-card__disc" aria-expanded={open}
        aria-controls={panelId} onClick={() => setOpen((was) => !was)}>
        {label}
        <Icon name="ChevronDown" size={15} stroke={2.2} />
      </button>
      <div id={panelId} className="nk-consent-card__panel" data-open={open} inert={!open}>
        <div>
          <dl className="nk-consent-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}

/* ---------------- Consent card ----------------
   One processing = one card: icon, purpose, processor line, one plain sentence, a
   trailing control and the fact sheet. Every row in the panel is this component —
   the two switched purposes and the always-on statement — because they must stay
   visually indistinguishable apart from that trailing control. Give the "statement"
   variant its own markup and the two drift the moment either is touched.

   The card's own chrome does NOT vary with a switch's state either: equal prominence
   is the legal requirement, so a granted purpose must never look more "correct" than
   a refused one. `variant` marks a card that carries no choice at all, not a state.

   The title is a <span>, not a heading: the switch takes its accessible name from it
   via aria-labelledby, and heading semantics on a control's own label make screen
   readers stutter the string twice. The <ul> already carries the structure. Only this
   component knows those ids, so `control` receives them rather than guessing.

   Writing is instant — the cookie is written on change and the change event re-syncs
   every surface — so there is no Save button to forget and no aria-live status line:
   aria-checked already announces the new state, and a polite region on top of it
   would just double-announce. */
function ConsentCard({ icon, copy, detailsLabel, control, variant = "choice" }: {
  icon: IconName;
  copy: ConsentPurposeCopy;
  detailsLabel: string;
  control: (labelling: { labelledBy: string; describedBy: string }) => React.ReactNode;
  // "statement" = a fact about the site, not something the reader can change
  variant?: "choice" | "statement";
}) {
  const titleId = useId();
  const metaId = useId();
  return (
    <li className={"nk-consent-card" + (variant === "statement" ? " nk-consent-card--static" : "")}>
      <div className="nk-consent-card__head">
        <span className="nk-consent-card__icon" aria-hidden="true">
          <Icon name={icon} size={18} stroke={2} />
        </span>
        <span className="nk-consent-card__text">
          <span className="nk-consent-card__title" id={titleId}>{copy.title}</span>
          <span className="nk-consent-card__meta" id={metaId}>{copy.meta}</span>
        </span>
        {control({ labelledBy: titleId, describedBy: metaId })}
      </div>
      <p className="nk-consent-card__body">{copy.body}</p>
      <Details label={detailsLabel} facts={copy.details} />
    </li>
  );
}

export function PrivacyChoices() {
  const { locale, dict } = useI18nOptional();
  const t = dict.privacyChoices;
  const [open, setOpen] = useState(false);
  // Start "unknown" so the first client render matches the server HTML; the real
  // values land in the effect below (the panel can't be open before that anyway).
  const [attribution, setAttribution] = useState<ConsentStatus>("unknown");
  const [analytics, setAnalytics] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    const sync = () => {
      setAttribution(readConsent());
      setAnalytics(readAnalyticsConsent());
    };
    sync();
    window.addEventListener(NK_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(NK_CONSENT_CHANGE_EVENT, sync);
  }, []);

  const attributionGranted = attribution === "granted";
  const analyticsGranted = analytics === "granted";
  const chooseAttribution = (allow: boolean) => {
    writeConsent(allow ? "granted" : "denied");
    trackEvent("Attribution Preference", { choice: allow ? "granted" : "withdrawn" });
  };
  const chooseAnalytics = (allow: boolean) => {
    writeAnalyticsConsent(allow ? "granted" : "denied");
    trackEvent("Analytics Preference", { choice: allow ? "granted" : "withdrawn" });
  };

  return (
    <>
      <button type="button" className="nk-privacy-trigger" onClick={() => setOpen(true)}>
        {t.trigger}
      </button>

      <Dialog open={open} onDismiss={() => setOpen(false)} title={t.title} description={t.scopeNote}
        closeLabel={t.close} panelClassName="nk-privacy-panel">
        {/* A real list, so the count is announced before the reading starts — a blind
            user learns how many purposes exist without walking all of them first. */}
        <ul className="nk-consent-list">
          {/* Always-on row. NOT a disabled switch: a dimmed control says "not right
              now", which invites a hunt for how to enable it, and screen readers
              announce it as "switch, dimmed". This states a fact — nk_attr_consent
              and nk_ga_consent are the only cookies set without consent, and they
              exist solely to remember the two answers below. It still gets the same
              fact sheet, which is what makes "always on" credible rather than a
              legal fig leaf. */}
          <ConsentCard
            icon="Lock"
            copy={t.essential}
            detailsLabel={t.detailsLabel}
            variant="statement"
            control={() => <span className="nk-consent-card__always">{t.alwaysOn}</span>}
          />
          <ConsentCard
            icon="Download"
            copy={t.attribution}
            detailsLabel={t.detailsLabel}
            control={(labelling) => (
              <Switch {...labelling} checked={attributionGranted} onChange={chooseAttribution}
                onLabel={t.on} offLabel={t.off} />
            )}
          />
          {/* Without a GA id there is no analytics processing to consent to, so the
              panel omits that card (mirrors the gate in Analytics/ConsentBanner). */}
          {GA_ENABLED && (
            <ConsentCard
              icon="ChartNoAxesColumn"
              copy={t.analytics}
              detailsLabel={t.detailsLabel}
              control={(labelling) => (
                <Switch {...labelling} checked={analyticsGranted} onChange={chooseAnalytics}
                  onLabel={t.on} offLabel={t.off} />
              )}
            />
          )}
        </ul>
        {/* Panel level, never inside a card: the cards' collapsed regions clip
            overflow, which would cut this link's focus ring. */}
        <Link className="nk-consent-privacy" href={localePath(locale, "/privatumo-politika")}>
          {t.privacyLink}
          <Icon name="ArrowRight" size={15} stroke={2.2} />
        </Link>
      </Dialog>
    </>
  );
}
