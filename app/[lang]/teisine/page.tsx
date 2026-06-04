import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { PolicyHub } from "@/app/components/legal/PolicyHub";

export async function generateMetadata({ params }: PageProps<"/[lang]/teisine">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/teisine", title: `${legal.hubTitle} — Naudokis.lt`, description: legal.hubMetaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/teisine">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  return <PolicyHub locale={locale} />;
}
