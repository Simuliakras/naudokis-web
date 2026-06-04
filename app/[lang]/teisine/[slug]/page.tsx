import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import {
  getLegalManifest, getLegalDocMeta, legalHref, legalBlurbDescription,
  CANONICAL_IDS, CANONICAL_PATHS,
} from "@/app/lib/legal/manifest";
import { getLegalDoc } from "@/app/lib/legal/loader";
import { DocumentScreen } from "@/app/components/legal/DocumentScreen";

// All documents are a bounded, known set — prerender each per locale. The two
// canonical docs (privacy-policy / terms-of-use) live at their own pretty routes
// and are excluded here so they aren't reachable under /teisine/<id> too.
export const dynamicParams = false;

export function generateStaticParams() {
  return getLegalManifest()
    .docs.filter((d) => !CANONICAL_IDS.includes(d.id))
    .map((d) => ({ slug: d.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/teisine/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = requireLocale(lang);
  const info = getLegalDocMeta(slug);
  if (!info) {
    notFound();
  }
  const loaded = await getLegalDoc(slug, locale);
  if (!loaded) {
    notFound();
  }
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale,
    path: `/teisine/${slug}`,
    title: `${loaded.doc.meta.title} — Naudokis.lt`,
    description: legalBlurbDescription(slug, locale, legal.metaDescriptionFallback),
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
    ltOnly: !info.hasEn,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/teisine/[slug]">) {
  const { lang, slug } = await params;
  const locale = requireLocale(lang);

  // Canonical docs have their own pretty routes — keep one URL per document.
  if (CANONICAL_PATHS[slug]) {
    redirect(legalHref(slug, locale));
  }

  const loaded = await getLegalDoc(slug, locale);
  if (!loaded) {
    notFound();
  }

  return (
    <DocumentScreen
      docId={slug}
      doc={loaded.doc}
      locale={locale}
      usedLang={loaded.usedLang}
      fellBack={loaded.fellBack}
    />
  );
}
