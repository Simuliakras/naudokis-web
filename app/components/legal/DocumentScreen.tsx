// Legal — full document reading page (server component). Composes the legal
// topbar (+ LT/EN switch), breadcrumb, header, server-rendered block body with a
// scroll-spy sidebar TOC, related docs, footer, and the fixed chrome island.
// Deliberately NOT wrapped in the marketing <Chrome>/<Nav> — legal pages carry
// no app-redirect UI (per the UI/UX spec).
import Link from "next/link";
import "./legal.css";
import type { Locale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { getLegalManifest, legalHref } from "@/app/lib/legal/manifest";
import type { LegalDocument } from "@/app/lib/legal/types";
import { Icon } from "./Icon";
import { Inline } from "./Inline";
import { Blocks } from "./Blocks";
import { MetaChips } from "./MetaChips";
import { RelatedDocs } from "./RelatedDocs";
import { LegalChrome, TocSidebar } from "./LegalChrome";
import { LegalScrollProvider } from "./LegalScroll";
import { LegalTopBar, LegalFooter, hubHrefFor } from "./LegalShell";

export function DocumentScreen({
  docId, doc, locale, usedLang, fellBack,
}: {
  docId: string;
  doc: LegalDocument;
  locale: Locale;
  usedLang: Locale;
  fellBack: boolean;
}) {
  const t = getDictionary(locale).legal;
  const manifest = getLegalManifest();
  const info = manifest.docs.find((d) => d.id === docId);
  const grp = info ? manifest.groups.find((g) => g.id === info.grp) : undefined;
  const hubHref = hubHrefFor(locale);
  const langHrefs = { lt: legalHref(docId, "lt"), en: legalHref(docId, "en") };

  const intro = doc.blocks.find((b) => b.t === "p");
  const bodyBlocks = intro ? doc.blocks.filter((b) => b !== intro) : doc.blocks;

  return (
    <LegalScrollProvider ids={doc.toc.map((s) => s.id)}>
      <div className="nk-lg-root" data-layout="a">
        <LegalTopBar locale={locale} hubHref={hubHref} langHrefs={langHrefs} t={t} />

        <div className="nk-lg-shell">
          <nav className="nk-lg-crumbs" aria-label={t.breadcrumb}>
            <Link href={hubHref}>{t.policyCenter}</Link>
            <Icon name="chevRight" size={14} />
            {grp && <><span>{grp.label[locale]}</span><Icon name="chevRight" size={14} /></>}
            <span style={{ color: "var(--nk-text-2)" }}>{info ? info.label[locale] : doc.meta.title}</span>
          </nav>

          <header className="nk-lg-dochead">
            <p className="nk-lg-eyebrow">{grp ? grp.label[locale] : t.policyCenter}</p>
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
              <RelatedDocs manifest={manifest} currentId={docId} locale={locale} t={t} />
            </article>
          </div>
        </div>

        <LegalFooter locale={locale} hubHref={hubHref} t={t} />

        <LegalChrome
          toc={doc.toc}
          contents={t.contents}
          openMenu={t.openMenu}
          backTop={t.backTop}
          readingProgress={t.readingProgress}
        />
      </div>
    </LegalScrollProvider>
  );
}
