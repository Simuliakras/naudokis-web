// Legal — shared topbar + footer (server). Used by both the document pages and
// the Policy Center hub. The LT/EN switch targets are passed in so each surface
// can point the toggle at the right per-locale URL.
import Link from "next/link";
import type { Locale } from "@/app/lib/i18n/config";
import type { LegalDict } from "@/app/lib/i18n/types";
import { legalHref } from "@/app/lib/legal/manifest";
import { CONTACT_EMAIL } from "@/app/lib/contact";

export function hubHrefFor(locale: Locale): string {
  return locale === "lt" ? "/teisine" : `/${locale}/teisine`;
}

export function LegalTopBar({
  locale, hubHref, langHrefs, t,
}: {
  locale: Locale;
  hubHref: string;
  langHrefs: { lt: string; en: string };
  t: LegalDict;
}) {
  return (
    <header className="nk-lg-topbar">
      <div className="nk-lg-topbar__in">
        <Link className="nk-lg-brand" href={hubHref}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/naudokis/icon.png" alt="" />
          <span>Naudokis<small>{t.brandSub}</small></span>
        </Link>
        <div className="nk-lg-topbar__spacer" />
        <div className="nk-lg-seg" role="group" aria-label={t.langSwitchLabel}>
          <span className="nk-lg-seg__lbl">{t.langSwitchLabel}</span>
          <Link href={langHrefs.lt} aria-current={locale === "lt" ? "true" : undefined} hrefLang="lt">LT</Link>
          <Link href={langHrefs.en} aria-current={locale === "en" ? "true" : undefined} hrefLang="en">EN</Link>
        </div>
      </div>
    </header>
  );
}

export function LegalFooter({
  locale, hubHref, t,
}: {
  locale: Locale;
  hubHref: string;
  t: LegalDict;
}) {
  return (
    <footer className="nk-lg-foot">
      <div className="nk-lg-foot__in">
        <div className="nk-lg-foot__c">
          {t.footHelp} {t.footWrite} <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a><br />
          {t.company}
        </div>
        <nav className="nk-lg-foot__links">
          <Link href={hubHref}>{t.policyCenter}</Link>
          <Link href={legalHref("terms-of-use", locale)}>{t.termsLabel}</Link>
          <Link href={legalHref("privacy-policy", locale)}>{t.privacyLabel}</Link>
        </nav>
      </div>
    </footer>
  );
}
