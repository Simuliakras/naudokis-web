import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import {
  pageMetadata, requireLocale, breadcrumbJsonLd, listingJsonLd,
} from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListing, listingKey, LISTING_REVALIDATE } from "@/app/lib/listings";
import { ListingScreen } from "@/app/components/ListingScreen";
import { JsonLd } from "@/app/components/JsonLd";
import { API_BASE } from "@/app/lib/api";

// Per-listing detail is unbounded dynamic data — render on demand, cache 5 min.
// (Literal to satisfy Next's static segment-config analysis; same value as
// LISTING_REVALIDATE, which the data-layer fetches use.)
export const revalidate = 300;

// Raw server-side fetch for metadata + Product JSON-LD (title/description/image,
// plus the raw price/rating numbers the structured data needs).
type ListingMeta = {
  title: string;
  description: string;
  image?: string;
  priceCents: number;
  ratingAverage: number | null;
  ratingCount: number;
};
// Only the raw backend fields this metadata fetch reads (the full shape lives in
// listings.ts). Typed so res.json() doesn't leak `any` into the meta mapping.
type RawListing = {
  title?: string;
  description?: string;
  images?: { url?: string }[];
  price_per_day_cents?: number;
  rating_average?: number | null;
  rating_count?: number;
};
async function fetchListingMeta(id: string): Promise<ListingMeta | null> {
  try {
    // Same URL + options as fetchListing's server call so Next memoizes them
    // into a single request (the detail page also prefetches that query).
    const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: LISTING_REVALIDATE } });
    if (!res.ok) return null;
    const body: { data?: RawListing } = await res.json();
    const l = body.data;
    if (!l?.title) return null;
    return {
      title: l.title,
      description: (l.description ?? "").slice(0, 200),
      image: l.images?.[0]?.url,
      priceCents: typeof l.price_per_day_cents === "number" ? l.price_per_day_cents : 0,
      ratingAverage: typeof l.rating_average === "number" ? l.rating_average : null,
      ratingCount: typeof l.rating_count === "number" ? l.rating_count : 0,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/skelbimai/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  const { detail, meta } = getDictionary(locale);
  const data = await fetchListingMeta(id);
  const title = data ? `${data.title}${detail.metaTitleSuffix}` : detail.metaFallbackTitle;
  const description = data?.description || detail.metaFallbackDescription;
  return pageMetadata({
    locale, path: `/skelbimai/${id}`, title, description,
    ogLocale: meta.ogLocale, ogImageAlt: data?.title ?? meta.ogImageAlt, image: data?.image,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/skelbimai/[id]">) {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  const { common, feed, detail } = getDictionary(locale);

  // Prefetch the detail query so ListingScreen's useListing() hydrates from HTML;
  // fetch the raw meta in parallel for the Product structured data.
  const qc = makeQueryClient();
  const [, data] = await Promise.all([
    qc.prefetchQuery({ queryKey: listingKey(id, locale), queryFn: () => fetchListing(id, locale) }),
    fetchListingMeta(id),
  ]);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: feed.titleAll, path: "/skelbimai" },
    { name: data?.title ?? detail.metaFallbackTitle, path: `/skelbimai/${id}` },
  ]);
  const product = data
    ? listingJsonLd({
        locale, id, name: data.title, description: data.description, image: data.image,
        priceCents: data.priceCents, ratingAverage: data.ratingAverage, ratingCount: data.ratingCount,
      })
    : null;

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      {product && <JsonLd data={product} />}
      <ListingScreen id={id} />
    </HydrationBoundary>
  );
}
