import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Dict } from "@/app/lib/i18n/types";
import {
  pageMetadata, requireLocale, breadcrumbJsonLd, listingJsonLd,
} from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListing, listingKey } from "@/app/lib/listings";
import { fetchListingMeta, type ListingMeta } from "@/app/lib/listing-seo";
import { ListingScreen } from "@/app/components/ListingScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Per-listing detail is unbounded dynamic data — render on demand, cache 5 min.
// (Literal to satisfy Next's static segment-config analysis; same value as
// LISTING_REVALIDATE, which the data-layer fetches use.)
export const revalidate = 300;

// Prefer the listing's own description (trimmed) when it's substantial; otherwise
// fall back to the templated SEO description from the dictionary.
function listingDescription(data: ListingMeta, fromDict: string): string {
  const clean = data.description.trim().replace(/\s+/g, " ");
  return clean.length >= 80 ? clean.slice(0, 200) : fromDict;
}

// Turn a slug-style id ("dodge-ram-2016") into a readable title ("Dodge Ram 2016")
// for SEO fallbacks when the listing itself can't be fetched. Returns null for
// opaque ids (UUIDs, pure hex/numeric) that carry no human-readable words — the
// caller then uses the generic fallback title instead.
function readableListingId(id: string): string | null {
  let decoded = id;
  try {
    // Next already decodes route params; guard the re-decode so a literal "%"
    // in the id (e.g. "50%-off") doesn't throw URIError and crash metadata.
    decoded = decodeURIComponent(id);
  } catch {
    decoded = id;
  }
  const normalized = decoded
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // No alphabetic content → opaque id (UUID/hex/numeric); not worth surfacing.
  if (!normalized || !/[a-z]/i.test(normalized)) return null;
  return normalized
    .split(" ")
    .map((part) => (/^[a-z]/.test(part) ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

// Title shown when the listing can't be loaded: a humanized slug when the id
// carries readable words, otherwise the generic fallback.
function listingFallbackTitle(id: string, detail: Dict["detail"]): string {
  const readable = readableListingId(id);
  return readable ? detail.metaFallbackTitleForId(readable) : detail.metaFallbackTitle;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/skelbimai/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  const { detail, meta } = getDictionary(locale);
  const data = await fetchListingMeta(id, locale);
  const title = data ? detail.seoTitle({ title: data.title.trim(), city: data.city }) : listingFallbackTitle(id, detail);
  const description = data
    ? listingDescription(data, detail.seoDescription({ title: data.title, city: data.city, category: data.categoryNames[0] }))
    : detail.metaFallbackDescription;
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
    fetchListingMeta(id, locale),
  ]);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: feed.titleAll, path: "/skelbimai" },
    { name: data?.title ?? listingFallbackTitle(id, detail), path: `/skelbimai/${id}` },
  ]);
  const product = data
    ? listingJsonLd({
        locale, id, name: data.title, description: data.description, image: data.image,
        priceCents: data.priceCents, ratingAverage: data.ratingAverage, ratingCount: data.ratingCount,
        itemCondition: data.itemCondition,
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
