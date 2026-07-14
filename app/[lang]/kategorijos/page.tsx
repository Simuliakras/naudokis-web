import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, categoriesCollectionJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchAllCategories, categoriesKey } from "@/app/lib/categories";
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

  // ONE fetch of the full tree. The top-level slice is derived from it rather than
  // fetched again, so the parents are not serialized twice into the HTML (once in
  // the dehydrated query state, once in the CategoriesScreen prop).
  //
  // Fail open on a backend hiccup (matches the feed page) so an ISR revalidation
  // can't error the whole route — but seed the cache ONLY on success: hydrating a
  // fake-empty list would render as a successful zero-category page instead of
  // letting the client query fetch fresh (skeleton → data, or the real error state).
  const qc = makeQueryClient();
  const tree = await fetchAllCategories(locale).catch(() => null);
  const allCategories = tree ?? [];
  // fetchCategories() is the same filter+order; deriving it keeps them in lockstep.
  const categories = tree?.filter((category) => category.level === 0) ?? null;
  if (categories) {
    qc.setQueryData(categoriesKey(locale), categories);
  }

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.crumb, path: "/kategorijos" },
  ]);
  // CollectionPage + ItemList of the category landings (name + canonical URL,
  // both from the taxonomy — nothing fabricated). Skipped if the fetch failed:
  // an empty ItemList would misrepresent the page.
  const collection = categories?.length
    ? categoriesCollectionJsonLd({
        locale,
        name: t.title,
        description: t.metaDescription,
        path: "/kategorijos",
        items: allCategories.map((c) => {
          const parent = c.parentId ? allCategories.find((candidate) => candidate.id === c.parentId) : undefined;
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
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      {collection && <JsonLd data={collection} />}
      <CategoriesScreen allCategories={allCategories} />
    </HydrationBoundary>
  );
}
