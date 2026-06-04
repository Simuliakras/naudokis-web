import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchCategories, categoriesKey } from "@/app/lib/categories";
import { CategoriesScreen } from "@/app/components/CategoriesScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Categories change rarely — statically generate per locale, revalidate hourly.
export const revalidate = 3600;

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
  const locale = requireLocale(lang);
  const { common, categoriesPage: t } = getDictionary(locale);

  // Prefetch the same query useCategories() reads so the tiles are in the HTML.
  const qc = makeQueryClient();
  await qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) });

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.crumb, path: "/kategorijos" },
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      <CategoriesScreen />
    </HydrationBoundary>
  );
}
