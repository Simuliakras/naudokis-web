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
  categorySlugForId,
  citySlugFor,
  resolveCategorySlug,
  resolveSubcategorySlug,
  subcategorySlugForId,
} from "@/app/lib/landing-routes";
import { LT_CITIES } from "@/app/lib/cities";
import { FeedScreen } from "@/app/components/FeedScreen";
import { JsonLd } from "@/app/components/JsonLd";

/* ---------------- Static params ----------------
   The landing tiers are finite and known at build time, so they are prerendered
   rather than rendered on demand. That is the whole point of these routes taking no
   searchParams: without segment params Next renders them per request, which on
   Amplify produced `no-store` HTML and put backend TTFB on the mobile LCP path.

   `fetchAllCategories` is deliberately unguarded, matching app/sitemap.ts: a silent
   [] would quietly downgrade every landing back to on-demand rendering — the exact
   regression this exists to prevent — so a taxonomy outage should fail the build
   loudly instead. */

// The top-level category landings: /nuoma/[category].
export async function categoryStaticParams(locale: Locale): Promise<{ category: string }[]> {
  const categories = await fetchAllCategories(locale);
  return categories
    .filter((category) => !category.parentId)
    .map((category) => ({ category: categorySlugForId(category.id, locale) }));
}

// The middle segment of /nuoma/[category]/[slug] is either a subcategory or a city —
// the same order i18n/routes.ts translates it in. Both sets are finite, so both are
// prebuilt.
export async function categorySlugStaticParams(
  locale: Locale,
): Promise<{ category: string; slug: string }[]> {
  const categories = await fetchAllCategories(locale);
  const parents = categories.filter((category) => !category.parentId);
  return parents.flatMap((parent) => {
    const category = categorySlugForId(parent.id, locale);
    const subcategories = categories
      .filter((candidate) => candidate.parentId === parent.id)
      .map((candidate) => ({ category, slug: subcategorySlugForId(candidate.id, locale) }));
    return [...subcategories, ...LT_CITIES.map((city) => ({ category, slug: citySlugFor(city) }))];
  });
}

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

// These routes take NO searchParams — reading them would make the whole tier dynamic,
// which is exactly what prerendering it was meant to stop (see FeedScreen). So a
// landing URL is always page 1 with no filter variants: there is no ?page= to honour
// and nothing that could make it non-canonical. Page 2+ of a filtered feed lives on
// /skelbimai, which is dynamic and canonicalizes itself.
export async function listingLandingMetadata({
  locale,
  filters,
  categoriesOverride,
}: {
  locale: Locale;
  filters: ListingFilters;
  categoriesOverride?: Category[];
}): Promise<Metadata> {
  const { feed: t, meta } = getDictionary(locale);
  const categories = categoriesOverride ?? await fetchCategories(locale).catch(() => []);
  const { landing, category, categoryLabel } = resolveLanding({ locale, filters, categories });

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
  const metadata = pageMetadata({
    locale,
    path: landing.path,
    title,
    description,
    ogLocale: meta.ogLocale,
    ogImageAlt: title,
  });
  // Count only far enough to settle whether this landing clears the shared indexation
  // floor — never walk the full catalogue during metadata generation.
  //
  // Keep "counted zero" and "could not count" apart. Collapsing a timeout to 0
  // reads as a thin landing, and ISR then caches that `noindex` for the whole
  // revalidate window — a backend blip would deindex healthy landings. An
  // unproven count instead leaves the directive off: indexing a thin page for
  // one window is recoverable, dropping a good one out of the index is not.
  const counted = await fetchListingsCount(
    { category: category?.id, city: landing.city },
    { stopAt: MIN_INDEXABLE_LISTINGS },
  )
    .then((n) => ({ ok: true as const, n }))
    .catch(() => ({ ok: false as const, n: 0 }));
  // An empty landing stays usable and crawlable-through, but is not useful enough to
  // recommend for indexing.
  if (counted.ok && counted.n < MIN_INDEXABLE_LISTINGS) {
    metadata.robots = NOINDEX_FOLLOW;
  }
  return metadata;
}

export async function ListingLandingPage({
  locale,
  filters,
  extraCategory,
}: {
  locale: Locale;
  filters: ListingFilters;
  extraCategory?: Category;
}) {
  const { common, feed: t } = getDictionary(locale);
  const qc = makeQueryClient();
  const key = listingsInfiniteKey(locale, filters);

  await Promise.all([
    qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) }),
    qc.prefetchInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam }) => fetchListingsPage(locale, filters, pageParam),
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

  const listings = qc.getQueryData<InfiniteData<ListingsPage>>(key)?.pages.flatMap((p) => p.offers) ?? [];
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
            city: landing.city,
          })}
        />
        {listings.length > 0 && (
          <JsonLd data={itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title, city: l.city })))} />
        )}
        {/* Deliberately NOT wrapped in <Suspense>. FeedScreen renders Chrome, whose
            next/dynamic children throw during SSR, so any boundary here catches them
            and streams the entire screen — Nav, H1, grid — into a `<div hidden>` that
            only React's inline $RC() script reveals. Without a boundary the whole
            page lands in the HTML shell, which is what a crawler that does not
            execute JS reads. Measured: with the boundary the first <h1> a landing
            emits sat inside the hidden region. */}
        <FeedScreen initialFilters={filters} extraCategory={extraCategory} extraCategories={allCategories} />
      </HydrationBoundary>
    </QueryProvider>
  );
}
