import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, type InfiniteData } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, itemListJsonLd, collectionPageJsonLd, resolveListingLanding, NOINDEX_FOLLOW, MIN_INDEXABLE_LISTINGS } from "@/app/lib/seo";
import { listingBreadcrumbTrail } from "@/app/lib/breadcrumbs";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListingsCount, fetchListingsPage, listingsInfiniteKey, listingsNeededForPage, LISTINGS_FIRST_CURSOR, type ListingFilters, type ListingsPage } from "@/app/lib/listings";
import { fetchCategories, categoriesKey, type Category } from "@/app/lib/categories";
import { catalogueFiltersFromSearch, firstValue, pageFromLandingSearch, hasNonCanonicalLandingSearch, type LandingSearchParams } from "@/app/lib/landing-params";
import { todayInMarket } from "@/app/lib/dates";
import { FeedScreen } from "@/app/components/FeedScreen";
import { JsonLd } from "@/app/components/JsonLd";
import { QueryProvider } from "@/app/providers";

// Read the ?q/?cat/?city/?sort filters server-side, matching FeedScreen's hook.
type RawSearch = LandingSearchParams;
function filtersFromSearch(sp: RawSearch): ListingFilters {
  // catalogueFiltersFromSearch already resolves q/sort/page/price/delivery; only
  // the feed's own ?cat/?city param names have to be added on top.
  return {
    ...catalogueFiltersFromSearch(sp),
    city: firstValue(sp.city) ?? "",
    category: firstValue(sp.cat) ?? "",
  };
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/skelbimai">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { feed: t, meta } = getDictionary(locale);
  const sp = await searchParams;
  const page = pageFromLandingSearch(sp);
  const categories = await fetchCategories(locale).catch(() => []);
  const landing = resolveListingLanding({
    catParam: firstValue(sp.cat) ?? "",
    cityParam: firstValue(sp.city) ?? "",
    categories,
  });

  // A clean category landing (no city filter) renders the taxonomy's authored
  // copy verbatim — already brand-suffixed and length-budgeted. City-only and
  // category+city combos keep the synthesized, city-aware templates (the backend
  // authors no city dimension); bare browse falls back to the feed defaults.
  const category = landing.category;
  const categoryLabel = category
    ? t.categorySeoLabel(category.id, category.title)
    : undefined;
  // `authored` = a clean category landing (the case described above); narrowing on
  // it lets the ternaries stay flat without a non-null assertion.
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

  const md = pageMetadata({
    locale, path: page > 1 ? `${landing.path}?page=${page}` : landing.path, title, description,
    ogLocale: meta.ogLocale, ogImageAlt: title,
  });
  // Free-text searches, sort/delivery/price variants and invalid filter values
  // create duplicate or thin states. Let crawlers follow their links, but index
  // only the stable browse/category/city/category+city landing URLs. The
  // search-param test is shared with the pretty-URL landing pages so they can't
  // disagree on what counts as non-canonical.
  if (
    hasNonCanonicalLandingSearch(sp) ||
    landing.hasInvalidCategory ||
    landing.hasInvalidCity
  ) {
    md.robots = NOINDEX_FOLLOW;
  } else {
    // Only count far enough to prove that this page exists and, for an SEO
    // landing, that the catalogue clears the minimum-usefulness threshold.
    // Page 1 of the bare feed needs one public result; page N needs the first
    // result that would land on that page.
    const needed = listingsNeededForPage(page, isLanding ? MIN_INDEXABLE_LISTINGS : 1);
    const count = await fetchListingsCount({
      category: landing.category?.id,
      city: landing.city,
    }, { stopAt: needed }).catch(() => 0);
    if (count < needed) {
      md.robots = NOINDEX_FOLLOW;
    }
  }
  return md;
}

export default async function Page({ params, searchParams }: PageProps<"/[lang]/skelbimai">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, feed: t } = getDictionary(locale);
  const sp = await searchParams;
  const filters = filtersFromSearch(sp);

  const qc = makeQueryClient();
  const key = listingsInfiniteKey(locale, filters);
  // Prefetch the category set (FeedScreen's heading + intro and the CollectionPage
  // node) and the first listings page (the feed + ItemList) concurrently — they're
  // independent, and both prefetch* swallow backend errors (the client just
  // refetches), so the combined await never rejects and a hiccup degrades to an
  // empty category set / a client refetch instead of failing render.
  await Promise.all([
    qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) }),
    qc.prefetchInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam }) => fetchListingsPage(locale, filters, pageParam),
      initialPageParam: LISTINGS_FIRST_CURSOR,
    }),
  ]);

  // Resolve the landing from the cached categories for the CollectionPage node
  // (clean category landing only — a city filter keeps the synthesized templates).
  const categories = qc.getQueryData<Category[]>(categoriesKey(locale)) ?? [];
  const landing = resolveListingLanding({ catParam: filters.category ?? "", cityParam: filters.city ?? "", categories });
  const collectionPage = landing.category && !landing.city
    ? collectionPageJsonLd({
        locale,
        name: landing.category.seoTitle,
        description: landing.category.metaDescription,
        path: landing.path,
      })
    : null;

  const cached = qc.getQueryData<InfiniteData<ListingsPage>>(key);
  const listings = cached?.pages.flatMap((p) => p.offers) ?? [];
  if (cached && (filters.page ?? 1) > 1 && listings.length === 0 && !cached.pages[0]?.nextToken) {
    notFound();
  }

  // Same canonical trail the visible FeedScreen breadcrumb renders (and the
  // pretty-URL landing pages emit), so structured and visible data stay in step.
  const breadcrumb = breadcrumbJsonLd(locale, listingBreadcrumbTrail({
    homeLabel: common.breadcrumbHome,
    feedLabel: t.titleAll,
    categoryTitle: landing.category?.title,
    category: landing.category?.id,
    city: landing.city,
  }));
  const itemList = itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title, city: l.city })));

  return (
    <QueryProvider>
      <HydrationBoundary state={dehydrate(qc)}>
        <JsonLd data={breadcrumb} />
        {collectionPage && <JsonLd data={collectionPage} />}
        {listings.length > 0 && <JsonLd data={itemList} />}
        {/* Deliberately NOT wrapped in <Suspense>, and there is no loading.tsx above
            this route either. FeedScreen renders Chrome, whose next/dynamic children
            throw during SSR, so ANY boundary here catches them and streams the whole
            screen into a `<div hidden>` that only React's inline $RC() script reveals.
            This route reads searchParams, so it is dynamic and never prerendered (the
            Next 16 useSearchParams-needs-a-boundary rule only bites on prerendered
            routes); without a boundary the render waits and the real H1, the search
            form and the grid all land in the HTML shell. That is strictly better than
            the content-bearing fallback this used to carry, which — measured — was
            itself inside the hidden region and so never reached a crawler.

            Unlike the pretty-URL landings this screen reads its filters from the URL
            itself, so it must be told which "today" the prefetch above clamped `?dates=`
            against — otherwise its first render keys off the RAW window, misses the
            dehydrated page and fires a throwaway request. Read only when a date token is
            actually present: an undated render stays time-independent. */}
        <FeedScreen serverToday={firstValue(sp.dates) ? todayInMarket() : undefined} />
      </HydrationBoundary>
    </QueryProvider>
  );
}
