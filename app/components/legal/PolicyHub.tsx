// Legal — Policy Center hub (server). Bilingual navigator over every legal
// document: hero, featured core agreements, grouped doc cards, contacts. Ported
// from the handoff hub.jsx. Reading-progress + back-to-top come from the chrome
// island (with an empty TOC, so no sidebar/drawer render).
import Link from "next/link";
import "./legal.css";
import type { Locale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { getLegalManifest, legalHref, docHref, localizedBlurb } from "@/app/lib/legal/manifest";
import type { LegalDocMeta } from "@/app/lib/legal/types";
import { fmtDate, truncate } from "@/app/lib/legal/format";
import { CONTACT_EMAIL, CONTACT_PRIVACY_EMAIL } from "@/app/lib/contact";
import { Icon } from "./Icon";
import { LegalChrome } from "./LegalChrome";
import { LegalScrollProvider } from "./LegalScroll";
import { LegalTopBar, LegalFooter, hubHrefFor } from "./LegalShell";

export function PolicyHub({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).legal;
  const manifest = getLegalManifest();
  const hubHref = hubHrefFor(locale);
  const langHrefs = { lt: "/teisine", en: "/en/teisine" };

  const byId = (id: string) => manifest.docs.find((d) => d.id === id);
  const featured = ["terms-of-use", "privacy-policy"]
    .map(byId)
    .filter((d): d is LegalDocMeta => Boolean(d));
  const count = manifest.docs.filter((d) => d.id !== "policy-center").length;
  const groups = manifest.groups.filter((g) => g.id !== "core");
  const docsInGroup = (gid: string) =>
    manifest.docs.filter((d) => d.grp === gid && d.id !== "policy-center");

  const contactRows: [string, string | null][] = [
    [t.cGeneral, CONTACT_EMAIL],
    [t.cPrivacy, CONTACT_PRIVACY_EMAIL],
    [t.cDsa, null],
    [t.cSafety, null],
  ];

  return (
    <LegalScrollProvider ids={[]}>
      <div className="nk-lg-root" data-layout="a">
        <LegalTopBar locale={locale} hubHref={hubHref} langHrefs={langHrefs} t={t} />

        <main id="nk-main">
          <section className="nk-lg-hub-hero">
            <p className="nk-lg-eyebrow">{t.hubEyebrow}</p>
            <h1>{t.hubTitle}</h1>
            <p>{t.hubIntro}</p>
            <div className="nk-lg-meta nk-lg-hub-meta">
              <span className="nk-lg-chip"><Icon name="book" size={14} /><b>{count}</b>&nbsp;{t.docsWord}</span>
              <span className="nk-lg-chip"><Icon name="calendar" size={14} />{t.updated}&nbsp;<b>{fmtDate(manifest.updated, locale)}</b></span>
              <Link className="nk-lg-chip" href={legalHref("policy-center", locale)} style={{ color: "var(--nk-purple-light)" }}>
                <Icon name="layers" size={14} />{t.fullHierarchy}<Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </section>

          <div className="nk-lg-hub-feat">
            {featured.map((d) => (
              <Link key={d.id} className="nk-lg-featcard" href={docHref(d, locale)}>
                <span className="nk-lg-featcard__k">{t.featured}</span>
                <h3 className="nk-lg-featcard__t">{d.label[locale]}</h3>
                <p className="nk-lg-featcard__d">{truncate(localizedBlurb(d, locale), 180)}</p>
                <span className="nk-lg-featcard__go">{t.read} <Icon name="arrowRight" size={16} /></span>
              </Link>
            ))}
          </div>

          {groups.map((g) => (
            <section key={g.id} className="nk-lg-hub-section">
              <div className="nk-lg-hub-section__h">
                <h2>{g.label[locale]}</h2>
                <span>{docsInGroup(g.id).length} {t.docsWord}</span>
              </div>
              <div className="nk-lg-cardgrid">
                {docsInGroup(g.id).map((d) => (
                  <Link key={d.id} className="nk-lg-doccard" href={docHref(d, locale)}>
                    <span className="nk-lg-doccard__t">{d.label[locale]}<Icon name="arrowRight" size={16} /></span>
                    <p className="nk-lg-doccard__d">{truncate(localizedBlurb(d, locale), 130)}</p>
                    {!d.hasEn && locale === "en" && <span className="nk-lg-doccard__lt">{t.ltOnlyBadge}</span>}
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section className="nk-lg-hub-section">
            <div className="nk-lg-hub-section__h"><h2>{t.contacts}</h2></div>
            <div className="nk-lg-cardgrid">
              {contactRows.map((r, i) => (
                <div key={i} className="nk-lg-doccard nk-lg-doccard--static">
                  <span className="nk-lg-doccard__t">{r[0]}</span>
                  <p className="nk-lg-doccard__d">
                    {r[1]
                      ? <a href={"mailto:" + r[1]}>{r[1]}</a>
                      : <span>{t.appOrEmail} <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL}</a></span>}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="nk-lg-hub-footwrap">
          <LegalFooter locale={locale} hubHref={hubHref} t={t} />
        </div>

        <LegalChrome toc={[]} contents={t.contents} openMenu={t.openMenu} backTop={t.backTop} readingProgress={t.readingProgress} />
      </div>
    </LegalScrollProvider>
  );
}
