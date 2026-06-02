import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { LegalPage } from "@/app/components/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/naudojimo-taisykles">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/naudojimo-taisykles", title: legal.terms.metaTitle, description: legal.terms.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/naudojimo-taisykles">) {
  const { lang } = await params;
  requireLocale(lang);
  return <LegalPage doc="terms" />;
}
