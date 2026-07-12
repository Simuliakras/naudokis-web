import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { CANONICAL_PATHS, legalBlurbDescription, legalDocs } from "@/app/lib/legal/manifest";
import { getLegalDoc } from "@/app/lib/legal/loader";
import { DocumentScreen } from "@/app/components/legal/DocumentScreen";
import { JsonLd } from "@/app/components/JsonLd";

const POLICY_IDS = legalDocs()
  .map((doc) => doc.id)
  .filter((id) => CANONICAL_PATHS[id]?.startsWith("/politikos/"));

export function generateStaticParams() {
  return POLICY_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/politikos/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = requireLocale(lang);
  if (!POLICY_IDS.includes(slug)) notFound();
  const loaded = await getLegalDoc(slug, locale);
  if (!loaded) notFound();
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale,
    path: CANONICAL_PATHS[slug],
    title: `${loaded.doc.meta.title} | Naudokis.lt`,
    description: legalBlurbDescription(slug, locale, legal.metaDescriptionFallback),
    ogLocale: meta.ogLocale,
    ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/politikos/[slug]">) {
  const { lang, slug } = await params;
  const locale = requireLocale(lang);
  if (!POLICY_IDS.includes(slug)) notFound();
  const loaded = await getLegalDoc(slug, locale);
  if (!loaded) notFound();
  const { common, legal } = getDictionary(locale);
  const path = CANONICAL_PATHS[slug];
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: legal.hubTitle, path: "/teisine" },
    { name: loaded.doc.meta.title, path },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      <DocumentScreen doc={loaded.doc} docId={slug} locale={locale} usedLang={loaded.usedLang} fellBack={loaded.fellBack} />
    </>
  );
}
