import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary, type InfiniteData } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Locale } from "@/app/lib/i18n/config";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  NOINDEX_FOLLOW,
  pageMetadata,
  resolveListingLanding,
  type ListingLanding,
} from "@/app/lib/seo";
import { listingBreadcrumbTrail } from "@/app/lib/breadcrumbs";
import { makeQueryClient } from "@/app/lib/query";
import {
  fetchListingsCount,
  fetchListingsPage,
  listingsInfiniteKey,
  LISTINGS_FIRST_CURSOR,
  type ListingFilters,
  type ListingsPage,
} from "@/app/lib/listings";
import {
  categoriesKey,
  dedupeById,
  fetchCategories,
  fetchAllCategories,
  type Category,
} from "@/app/lib/categories";
import {
  hasNonCanonicalLandingSearch,
  pageFromLandingSearch,
  type LandingSearchParams,
} from "@/app/lib/landing-params";
import { categoryIdFromSlug, subcategoryIdFromSlug } from "@/app/lib/landing-routes";
import { FeedScreen } from "@/app/components/FeedScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Resolve a /nuoma/[category]/[subcategory][/city] pair to its backend level-1
// category, validating that the sub is a real child of the parent. Shared by the
// city and city-less subcategory routes so they can't diverge on what 404s.
export async function resolveSubcategory({
  locale,
  categorySlug,
  subcategorySlug,
}: {
  locale: Locale;
  categorySlug: string;
  subcategorySlug: string;
}): Promise<{ categories: Category[]; subcategory: Category }> {
  const parentId = categoryIdFromSlug(categorySlug);
  const subcategoryId = subcategoryIdFromSlug(subcategorySlug);
  const categories = await fetchAllCategories(locale).catch(() => []);
  const subcategory = categories.find(
    (c) => c.id === subcategoryId && c.parentId === parentId,
  );
  if (!parentId || !subcategory) {
    notFound();
  }
  return { categories, subcategory };
}

// Resolve + validate a landing from an already-loaded category set and derive its
// SEO label. Shared by the metadata pass and the render pass so the invalid-slug
// 404 and the category/label resolution can never disagree between the two.
function resolveLanding({
  locale,
  filters,
  categories,
}: {
  locale: Locale;
  filters: ListingFilters;
  categories: Category[];
}): { landing: ListingLanding; category?: Category; categoryLabel?: string } {
  const { feed: t } = getDictionary(locale);
  const landing = resolveListingLanding({
    catParam: filters.category ?? "",
    cityParam: filters.city ?? "",
    categories,
  });
  if (landing.hasInvalidCategory || landing.hasInvalidCity) {
    notFound();
  }
  const category = landing.category;
  const categoryLabel = category ? t.categorySeoLabel(category.id, category.title) : undefined;
  return { landing, category, categoryLabel };
}

export async function listingLandingMetadata({
  locale,
  filters,
  searchParams,
  categoriesOverride,
}: {
  locale: Locale;
  filters: ListingFilters;
  searchParams?: LandingSearchParams;
  categoriesOverride?: Category[];
}): Promise<Metadata> {
  const { feed: t, meta } = getDictionary(locale);
  const categories = categoriesOverride ?? await fetchCategories(locale).catch(() => []);
  const { landing, category, categoryLabel } = resolveLanding({ locale, filters, categories });
  const page = pageFromLandingSearch(searchParams);

  // A clean category landing (no city) renders the taxonomy's authored, already
  // brand-suffixed copy; city-only and category+city combos use the synthesized
  // city-aware templates (the backend authors no city dimension).
  const authored = category && !landing.city ? category : undefined;
  const isLanding = Boolean(category || landing.city);
  const title = authored
    ? authored.metaTitle
    : isLanding
      ? t.landingTitle({ category: categoryLabel, city: landing.city })
      : t.metaTitle;
  const description = authored
    ? authored.metaDescription
    : isLanding
      ? t.landingDescription({ category: categoryLabel, city: landing.city })
      : t.metaDescription;
  const count = await fetchListingsCount(locale, {
    category: category?.id,
    city: landing.city,
  }).catch(() => 0);

  const metadata = pageMetadata({
    locale,
    path: page > 1 ? `${landing.path}?page=${page}` : landing.path,
    title,
    description,
    ogLocale: meta.ogLocale,
    ogImageAlt: meta.ogImageAlt,
  });
  if (hasNonCanonicalLandingSearch(searchParams)) {
    metadata.robots = NOINDEX_FOLLOW;
    return metadata;
  }
  // An empty landing is a thin page: keep it crawlable-through but out of the index.
  if (count <= 0) {
    metadata.robots = NOINDEX_FOLLOW;
  }
  return metadata;
}

export async function ListingLandingPage({
  locale,
  filters,
  searchParams,
  extraCategory,
}: {
  locale: Locale;
  filters: ListingFilters;
  searchParams?: LandingSearchParams;
  extraCategory?: Category;
}) {
  const { common, feed: t } = getDictionary(locale);
  const qc = makeQueryClient();
  const page = pageFromLandingSearch(searchParams);
  const resolvedFilters = { ...filters, page };
  const key = listingsInfiniteKey(locale, resolvedFilters);

  await Promise.all([
    qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) }),
    qc.prefetchInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam }) => fetchListingsPage(locale, resolvedFilters, pageParam),
      initialPageParam: LISTINGS_FIRST_CURSOR,
    }),
  ]);

  const baseCategories = qc.getQueryData<Category[]>(categoriesKey(locale)) ?? [];
  const allCategories = filters.category ? await fetchAllCategories(locale).catch(() => []) : [];
  const categories = dedupeById([...baseCategories, ...allCategories, ...(extraCategory ? [extraCategory] : [])]);
  const { landing, category, categoryLabel } = resolveLanding({ locale, filters, categories });
  const collectionName = category && !landing.city
    ? category.seoTitle
    : t.landingHeading({ category: categoryLabel, city: landing.city });
  const collectionDescription = category && !landing.city
    ? category.metaDescription
    : t.landingDescription({ category: categoryLabel, city: landing.city });

  const cached = qc.getQueryData<InfiniteData<ListingsPage>>(key);
  const listings = cached?.pages.flatMap((p) => p.offers) ?? [];
  const totalCount = cached?.pages[0]?.totalCount ?? listings.length;
  const parentCategory = category?.parentId ? categories.find((c) => c.id === category.parentId) : undefined;

  const breadcrumb = listingBreadcrumbTrail({
    homeLabel: common.breadcrumbHome,
    feedLabel: t.titleAll,
    categoryTitle: parentCategory?.title ?? category?.title,
    category: parentCategory?.id ?? category?.id,
    subcategoryTitle: parentCategory ? category?.title : undefined,
    subcategory: parentCategory ? category?.id : undefined,
    city: landing.city,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumbJsonLd(locale, breadcrumb)} />
      <JsonLd
        data={collectionPageJsonLd({
          locale,
          name: collectionName,
          description: collectionDescription,
          path: landing.path,
        })}
      />
      {totalCount > 0 && listings.length > 0 && (
        <JsonLd data={itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title, city: l.city })))} />
      )}
      <Suspense>
        <FeedScreen initialFilters={resolvedFilters} extraCategory={extraCategory} extraCategories={allCategories} />
      </Suspense>
    </HydrationBoundary>
  );
}
