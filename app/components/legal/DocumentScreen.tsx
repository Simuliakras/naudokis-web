// Legal — full document reading page (server component). Renders under the same
// marketing chrome the home page uses: <Chrome> (app-redirect modal + sticky
// banner), the shared <Nav> and <Footer>. Inside that it keeps the calm reading
// experience — document header, server-rendered block body, a scroll-spy sidebar
// TOC, and the fixed chrome island (reading progress, mobile TOC drawer,
// back-to-top). The bespoke legal topbar/footer, breadcrumb and related-docs
// grid were dropped when the Policy Center hub was retired.
import "./legal.css";
import type { Locale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { LegalDocument } from "@/app/lib/legal/types";
import { Chrome } from "../Chrome";
import { Nav } from "../sections";
import { Footer } from "../sections-home";
import { Inline } from "./Inline";
import { Blocks } from "./Blocks";
import { MetaChips } from "./MetaChips";
import { LegalChrome, TocSidebar } from "./LegalChrome";
import { LegalScrollProvider } from "./LegalScroll";

export function DocumentScreen({
  doc, locale, usedLang, fellBack,
}: {
  doc: LegalDocument;
  locale: Locale;
  usedLang: Locale;
  fellBack: boolean;
}) {
  const t = getDictionary(locale).legal;

  const intro = doc.blocks.find((b) => b.t === "p");
  const bodyBlocks = intro ? doc.blocks.filter((b) => b !== intro) : doc.blocks;

  return (
    <Chrome>
      <div className="nk-page">
        <Nav />
        <LegalScrollProvider ids={doc.toc.map((s) => s.id)}>
          <div className="nk-lg-root" data-layout="a">
            <main id="nk-main" className="nk-lg-shell">
              <header className="nk-lg-dochead">
                <p className="nk-lg-eyebrow">{t.brandSub}</p>
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
                  <Blocks blocks={bodyBlocks} locale={usedLang} briefLabel={t.briefLabel} />
                </article>
              </div>
            </main>

            <LegalChrome
              toc={doc.toc}
              contents={t.contents}
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
