import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { legalBlurbDescription } from "@/app/lib/legal/manifest";
import { getLegalDoc } from "@/app/lib/legal/loader";
import { DocumentScreen } from "@/app/components/legal/DocumentScreen";

const DOC_ID = "privacy-policy";

export async function generateMetadata({ params }: PageProps<"/[lang]/privatumo-politika">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const loaded = await getLegalDoc(DOC_ID, locale);
  if (!loaded) {
    notFound();
  }
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/privatumo-politika",
    title: `${loaded.doc.meta.title} — Naudokis.lt`,
    description: legalBlurbDescription(DOC_ID, locale, legal.metaDescriptionFallback),
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/privatumo-politika">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const loaded = await getLegalDoc(DOC_ID, locale);
  if (!loaded) {
    notFound();
  }
  return (
    <DocumentScreen
      docId={DOC_ID}
      doc={loaded.doc}
      locale={locale}
      usedLang={loaded.usedLang}
      fellBack={loaded.fellBack}
    />
  );
}
