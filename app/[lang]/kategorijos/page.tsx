import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { CategoriesPage } from "@/app/components/CategoriesPage";

export async function generateMetadata({ params }: PageProps<"/[lang]/kategorijos">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { categoriesPage: t, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/kategorijos", title: t.metaTitle, description: t.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/kategorijos">) {
  const { lang } = await params;
  requireLocale(lang);
  return <CategoriesPage />;
}
