import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { LegalPage } from "@/app/components/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/privatumo-politika">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/privatumo-politika", title: legal.privacy.metaTitle, description: legal.privacy.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/privatumo-politika">) {
  const { lang } = await params;
  requireLocale(lang);
  return <LegalPage doc="privacy" />;
}
