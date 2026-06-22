import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { legalBlurbDescription } from "@/app/lib/legal/manifest";
import { getLegalDoc } from "@/app/lib/legal/loader";
import { DocumentScreen } from "@/app/components/legal/DocumentScreen";
import { JsonLd } from "@/app/components/JsonLd";

const DOC_ID = "terms-of-use";

export async function generateMetadata({ params }: PageProps<"/[lang]/naudojimosi-salygos">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const loaded = await getLegalDoc(DOC_ID, locale);
  if (!loaded) {
    notFound();
  }
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/naudojimosi-salygos",
    title: `${loaded.doc.meta.title} — Naudokis.lt`,
    description: legalBlurbDescription(DOC_ID, locale, legal.metaDescriptionFallback),
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/naudojimosi-salygos">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const loaded = await getLegalDoc(DOC_ID, locale);
  if (!loaded) {
    notFound();
  }
  const { common } = getDictionary(locale);
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: loaded.doc.meta.title, path: "/naudojimosi-salygos" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      <DocumentScreen
        doc={loaded.doc}
        docId={DOC_ID}
        locale={locale}
        usedLang={loaded.usedLang}
        fellBack={loaded.fellBack}
      />
    </>
  );
}
