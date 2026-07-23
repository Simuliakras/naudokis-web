import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, type InfiniteData } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Locale } from "@/app/lib/i18n/config";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  NOINDEX_FOLLOW,
  MIN_INDEXABLE_LISTINGS,
  pageMetadata,
  resolveListingLanding,
  type ListingLanding,
} from "@/app/lib/seo";
import { listingBreadcrumbTrail } from "@/app/lib/breadcrumbs";
import { makeQueryClient } from "@/app/lib/query";
import { QueryProvider } from "@/app/providers";
import {
  fetchListingsCount,
  fetchListingsPage,
  listingsInfiniteKey,
  listingsNeededForPage,
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
  catalogueFiltersFromSearch,
  hasNonCanonicalLandingSearch,
  pageFromLandingSearch,
  type LandingSearchParams,
} from "@/app/lib/landing-params";
import { resolveCategorySlug, resolveSubcategorySlug } from "@/app/lib/landing-routes";
import { FeedScreen } from "@/app/components/FeedScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Map the taxonomy slugs of a /nuoma URL to backend ids, for this locale.
//
// It only MAPS — there is no redirect here. Canonicalizing a non-canonical spelling
// ("/en/rent/namai-sodas") is the proxy's job (see i18n/route-resolution.ts), so by
// the time a request reaches this function the slug is already canonical. Do not
// "harden" this with `permanentRedirect`: inside an async page body the shell has
// already flushed, and Next then emits a client-side meta tag instead of a 308 —
// which is not a redirect a crawler will honour. That was measured, not assumed.
export function landingSlugIds({
  locale,
  categorySlug,
  subcategorySlug,
}: {
  locale: Locale;
  categorySlug: string;
  subcategorySlug?: string;
}): { categoryId: string; subcategoryId?: string } {
  // Taxonomy ids, NOT a `ListingFilters` — the feed filters on a single category id,
  // so a subcategory landing passes `subcategoryId` as its `category` filter.
  return {
    categoryId: resolveCategorySlug(categorySlug, locale).id,
    subcategoryId: subcategorySlug ? resolveSubcategorySlug(subcategorySlug, locale).id : undefined,
  };
}

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
  const { categoryId: parentId, subcategoryId } = landingSlugIds({
    locale,
    categorySlug,
    subcategorySlug,
  });
  const categories = await fetchAllCategories(locale).catch(() => []);
  const subcategory = categories.find(
    (c) => c.id === subcategoryId && c.parentId === parentId,
  );
  if (!subcategory) {
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
  // Count only far enough to prove that the requested page exists and that the
  // landing clears the minimum-usefulness threshold. This avoids walking the
  // full catalogue during metadata generation for every landing request.
  const needed = listingsNeededForPage(page, MIN_INDEXABLE_LISTINGS);
  // Keep "counted zero" and "could not count" apart. Collapsing a timeout to 0
  // reads as a thin landing, and ISR then caches that `noindex` for the whole
  // revalidate window — a backend blip would deindex healthy categories. An
  // unproven count instead leaves the directive off: indexing a thin page for
  // one window is recoverable, dropping a good one out of the index is not.
  const counted = await fetchListingsCount({
    category: category?.id,
    city: landing.city,
  }, { stopAt: needed })
    .then((n) => ({ ok: true as const, n }))
    .catch(() => ({ ok: false as const, n: 0 }));

  const metadata = pageMetadata({
    locale,
    path: page > 1 ? `${landing.path}?page=${page}` : landing.path,
    title,
    description,
    ogLocale: meta.ogLocale,
    ogImageAlt: title,
  });
  if (hasNonCanonicalLandingSearch(searchParams)) {
    metadata.robots = NOINDEX_FOLLOW;
    return metadata;
  }
  // Low-stock or non-existent paginated landings stay usable and
  // crawlable-through, but are not useful enough to recommend for indexing.
  if (counted.ok && counted.n < needed) {
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
  const resolvedFilters = { ...filters, ...catalogueFiltersFromSearch(searchParams) };
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
  if (cached && page > 1 && listings.length === 0 && !cached.pages[0]?.nextToken) {
    notFound();
  }
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
    <QueryProvider>
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
        {listings.length > 0 && (
          <JsonLd data={itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title, city: l.city })))} />
        )}
        {/* Deliberately NOT wrapped in <Suspense>. FeedScreen renders Chrome, whose
            next/dynamic children throw during SSR, so any boundary here catches them
            and streams the entire screen — Nav, H1, grid — into a `<div hidden>` that
            only React's inline $RC() script reveals. These routes read searchParams,
            so they are dynamic and never prerendered; without a boundary the render
            simply waits and the whole page lands in the HTML shell, which is what a
            crawler that does not execute JS reads. Measured: with the boundary the
            first <h1> a landing emits sat inside the hidden region. */}
        <FeedScreen initialFilters={resolvedFilters} extraCategory={extraCategory} extraCategories={allCategories} />
      </HydrationBoundary>
    </QueryProvider>
  );
}
