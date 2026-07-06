// Legal — full document reading page (server component). Uses the shared nav,
// footer and redirect modal, but opts out of the sticky install banner so the
// mobile TOC / back-to-top controls keep a clear fixed-action zone.
import "./legal.css";
import Link from "next/link";
import type { Locale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { LegalDocument } from "@/app/lib/legal/types";
import { legalHref } from "@/app/lib/legal/manifest";
import { CONTACT_EMAIL, CONTACT_PRIVACY_EMAIL } from "@/app/lib/contact";
import { Chrome } from "../Chrome";
import { Nav } from "../sections";
import { Footer } from "../sections-home";
import { Breadcrumb } from "../ui";
import { Inline } from "./Inline";
import { Blocks } from "./Blocks";
import { MetaChips } from "./MetaChips";
import { Icon } from "./Icon";
import { LegalChrome, TocSidebar } from "./LegalChrome";
import { LegalScrollProvider } from "./LegalScroll";

export function DocumentScreen({
  doc, docId, locale, usedLang, fellBack,
}: {
  doc: LegalDocument;
  docId: string;
  locale: Locale;
  usedLang: Locale;
  fellBack: boolean;
}) {
  const { legal: t, common } = getDictionary(locale);

  // Cross-link to the sibling legal document + a contact route.
  const siblingId = docId === "terms-of-use" ? "privacy-policy" : "terms-of-use";
  const siblingHref = legalHref(siblingId, locale);
  const siblingTitle = siblingId === "privacy-policy" ? t.docPrivacyTitle : t.docTermsTitle;
  const contactEmail = docId === "privacy-policy" ? CONTACT_PRIVACY_EMAIL : CONTACT_EMAIL;

  // Only the document's FIRST block counts as the lede, and only when it's a
  // paragraph. Searching for the first `p` anywhere would hoist a paragraph that
  // sits under heading 1 (e.g. the account-deletion doc opens h2 → p), leaving
  // section 1 rendered as an empty heading.
  const intro = doc.blocks[0]?.t === "p" ? doc.blocks[0] : undefined;
  const bodyBlocks = intro ? doc.blocks.slice(1) : doc.blocks;

  return (
    <Chrome>
      <div className="nk-page">
        <Nav />
        <LegalScrollProvider ids={doc.toc.map((s) => s.id)}>
          <div className="nk-lg-root" data-layout="a">
            <main id="nk-main" className="nk-lg-shell">
              <div className="nk-lg-crumbs">
                <Breadcrumb
                  homeLabel={common.breadcrumbHome}
                  label={common.breadcrumbLabel}
                  items={[{ label: doc.meta.title }]}
                />
              </div>
              <header className="nk-lg-dochead">
                <p className="nk-eyebrow" style={{ margin: "0 0 8px" }}>{t.brandSub}</p>
                <h1 className="nk-lg-title">{doc.meta.title}</h1>
                {intro && intro.t === "p" && (
                  <p className="nk-lg-intro"><Inline text={intro.md} locale={usedLang} /></p>
                )}
                <MetaChips meta={doc.meta} locale={usedLang} t={t} />
                {fellBack && <div className="nk-lg-langnote">{t.onlyLt}</div>}
              </header>
              <hr className="nk-lg-headrule" />

              <div className="nk-lg-body">
                {doc.toc.length > 0 && <TocSidebar toc={doc.toc} heading={t.inThisDoc} />}
                <article className="nk-lg-article">
                  <Blocks blocks={bodyBlocks} locale={usedLang} briefLabel={t.briefLabel} warnLabel={t.warnLabel} anchorLabel={t.anchorLabel} />

                  <nav className="nk-lg-related" aria-label={t.relatedHeading}>
                    <h2 className="nk-lg-related__h">{t.relatedHeading}</h2>
                    <div className="nk-lg-related__grid">
                      {siblingHref && (
                        <Link href={siblingHref} className="nk-lg-related__doc">
                          <span>{siblingTitle}</span>
                          <Icon name="arrowRight" size={18} />
                        </Link>
                      )}
                      <a href={"mailto:" + contactEmail} className="nk-lg-related__contact">
                        <span className="nk-lg-related__qh">{t.questionsTitle}</span>
                        <span className="nk-lg-related__qb">{t.questionsBody}</span>
                        <span className="nk-lg-related__cta"><Icon name="mail" size={15} /> {t.contactCta}</span>
                      </a>
                    </div>
                  </nav>
                </article>
              </div>
            </main>

            <LegalChrome
              toc={doc.toc}
              contents={t.contents}
              closeContents={t.closeContents}
              openMenu={t.openMenu}
              backTop={t.backTop}
              readingProgress={t.readingProgress}
            />
          </div>
        </LegalScrollProvider>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
