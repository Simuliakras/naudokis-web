import type { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd, itemListJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListings, listingsKey, parseSortKey, type ListingFilters, type Offer } from "@/app/lib/listings";
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
  const md = pageMetadata({
    locale, path: "/skelbimai", title: t.metaTitle, description: t.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
  // Canonical already points at the bare /skelbimai (no query). Additionally keep
  // internal search-result states (?q=) out of the index; the bare browse page
  // and category/city filters still canonicalize here and stay indexable.
  const q = firstValue((await searchParams).q);
  if (q && q.trim()) {
    md.robots = { index: false, follow: true };
  }
  return md;
}

export default async function Page({ params, searchParams }: PageProps<"/[lang]/skelbimai">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, feed: t } = getDictionary(locale);
  const filters = filtersFromSearch(await searchParams);

  // Seed the cache with the same data FeedScreen's useListings() will read, then
  // reuse it for the ItemList. prefetchQuery swallows backend errors (the client
  // just refetches), so a hiccup degrades gracefully instead of failing render.
  const qc = makeQueryClient();
  const key = listingsKey(locale, filters);
  await qc.prefetchQuery({ queryKey: key, queryFn: () => fetchListings(locale, filters) });
  const listings = qc.getQueryData<Offer[]>(key) ?? [];

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
