import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, categoriesCollectionJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchCategories, categoriesKey } from "@/app/lib/categories";
import { listingLandingPath } from "@/app/lib/landing-routes";
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

  // Fetch once, then seed the cache the same query useCategories() reads (so the
  // tiles are in the HTML) AND feed the JSON-LD from the identical list. Fail open
  // on a backend hiccup (matches the feed page) so an ISR revalidation can't error
  // the whole route — the shell renders and the client query retries.
  const qc = makeQueryClient();
  const categories = await fetchCategories(locale).catch(() => []);
  qc.setQueryData(categoriesKey(locale), categories);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.crumb, path: "/kategorijos" },
  ]);
  // CollectionPage + ItemList of the category landings (name + canonical URL,
  // both from the taxonomy — nothing fabricated). Skipped if the fetch failed:
  // an empty ItemList would misrepresent the page.
  const collection = categories.length
    ? categoriesCollectionJsonLd({
        locale,
        name: t.title,
        description: t.metaDescription,
        path: "/kategorijos",
        items: categories.map((c) => ({ name: c.title, path: listingLandingPath({ category: c.id }) })),
      })
    : null;

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      {collection && <JsonLd data={collection} />}
      <CategoriesScreen />
    </HydrationBoundary>
  );
}
