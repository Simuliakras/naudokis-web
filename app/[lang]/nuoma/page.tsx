import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, categoriesCollectionJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchAllCategories, allCategoriesKey } from "@/app/lib/categories";
import { listingLandingPath } from "@/app/lib/landing-routes";
import { CategoriesScreen } from "@/app/components/CategoriesScreen";
import { JsonLd } from "@/app/components/JsonLd";
import { QueryProvider } from "@/app/providers";

// Categories change rarely — statically generate per locale, revalidate hourly.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/nuoma">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { categoriesPage: t, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/nuoma", title: t.metaTitle, description: t.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/nuoma">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, categoriesPage: t } = getDictionary(locale);

  // ONE fetch of the full tree, seeded into the directory's query slot so the
  // dehydrated HTML already carries every subcategory link (crawlable, no
  // client refetch on first paint).
  //
  // Fail open on a backend hiccup (matches the feed page) so an ISR revalidation
  // can't error the whole route — but seed the cache ONLY on success: hydrating a
  // fake-empty list would render as a successful zero-category page instead of
  // letting the client query fetch fresh (skeleton → data, or the real error state).
  const qc = makeQueryClient();
  const tree = await fetchAllCategories(locale).catch(() => null);
  if (tree) {
    qc.setQueryData(allCategoriesKey(locale), tree);
  }

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.crumb, path: "/nuoma" },
  ]);
  // CollectionPage + ItemList of the category landings (name + canonical URL,
  // both from the taxonomy — nothing fabricated). Skipped if the fetch failed:
  // an empty ItemList would misrepresent the page.
  const collection = tree?.length
    ? categoriesCollectionJsonLd({
        locale,
        name: t.title,
        description: t.metaDescription,
        path: "/nuoma",
        items: tree.map((c) => {
          const parent = c.parentId ? tree.find((candidate) => candidate.id === c.parentId) : undefined;
          return {
            name: c.title,
            path: parent
              ? listingLandingPath({ category: parent.id, subcategory: c.id })
              : listingLandingPath({ category: c.id }),
          };
        }),
      })
    : null;

  return (
    <QueryProvider>
      <HydrationBoundary state={dehydrate(qc)}>
        <JsonLd data={breadcrumb} />
        {collection && <JsonLd data={collection} />}
        <CategoriesScreen />
      </HydrationBoundary>
    </QueryProvider>
  );
}
