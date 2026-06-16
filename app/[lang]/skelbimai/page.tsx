import type { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary, type InfiniteData } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, itemListJsonLd, resolveListingLanding } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListingsPage, listingsInfiniteKey, LISTINGS_FIRST_CURSOR, parseSortKey, type ListingFilters, type ListingsPage } from "@/app/lib/listings";
import { fetchCategories, mergeWithFallbackCategories } from "@/app/lib/categories";
import { FeedScreen } from "@/app/components/FeedScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Read the ?q/?cat/?city/?sort filters server-side, matching FeedScreen's hook.
// A repeated param (?q=a&q=b) arrives as an array — take the first value.
type RawSearch = Record<string, string | string[] | undefined>;
function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function filtersFromSearch(sp: RawSearch): ListingFilters {
  return {
    q: firstValue(sp.q) ?? "",
    city: firstValue(sp.city) ?? "",
    category: firstValue(sp.cat) ?? "",
    sort: parseSortKey(firstValue(sp.sort)),
  };
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/skelbimai">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { feed: t, meta } = getDictionary(locale);
  const sp = await searchParams;
  const categories = mergeWithFallbackCategories(locale, await fetchCategories(locale).catch(() => []));
  const landing = resolveListingLanding({
    catParam: firstValue(sp.cat) ?? "",
    cityParam: firstValue(sp.city) ?? "",
    categories,
  });

  // Default to the bare browse copy; a category and/or city filter swaps in the
  // dictionary's landing copy (the category label is the LT genitive / EN title).
  const categoryLabel = landing.category
    ? t.categorySeoLabel(landing.category.id, landing.category.title)
    : undefined;
  const title = landing.category || landing.city
    ? t.landingTitle({ category: categoryLabel, city: landing.city })
    : t.metaTitle;
  const description = landing.category || landing.city
    ? t.landingDescription({ category: categoryLabel, city: landing.city })
    : t.metaDescription;

  const md = pageMetadata({
    locale, path: landing.path, title, description,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
  // Free-text searches, sort/delivery variants and invalid filter values create
  // duplicate or thin states. Let crawlers follow their links, but index only the
  // stable browse/category/city/category+city landing URLs.
  const q = firstValue(sp.q);
  const sort = firstValue(sp.sort);
  const delivery = firstValue(sp.delivery);
  if (
    (q && q.trim()) ||
    (sort && parseSortKey(sort) !== "recommended") ||
    delivery === "1" ||
    landing.hasInvalidCategory ||
    landing.hasInvalidCity
  ) {
    md.robots = { index: false, follow: true };
  }
  return md;
}

export default async function Page({ params, searchParams }: PageProps<"/[lang]/skelbimai">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, feed: t } = getDictionary(locale);
  const filters = filtersFromSearch(await searchParams);

  // Seed the cache with the first page FeedScreen's useListingsInfinite() will
  // read, then reuse it for the ItemList. prefetchInfiniteQuery swallows backend
  // errors (the client just refetches), so a hiccup degrades gracefully instead
  // of failing render.
  const qc = makeQueryClient();
  const key = listingsInfiniteKey(locale, filters);
  await qc.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchListingsPage(locale, filters, pageParam),
    initialPageParam: LISTINGS_FIRST_CURSOR,
  });
  const cached = qc.getQueryData<InfiniteData<ListingsPage>>(key);
  const listings = cached?.pages.flatMap((p) => p.offers) ?? [];

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.titleAll, path: "/skelbimai" },
  ]);
  const itemList = itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title })));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemList} />
      {/* FeedScreen reads ?q/?cat/?city/?sort/?delivery via useSearchParams, which
          requires a Suspense boundary on a prerendered route (Next.js 16). */}
      <Suspense>
        <FeedScreen />
      </Suspense>
    </HydrationBoundary>
  );
}
