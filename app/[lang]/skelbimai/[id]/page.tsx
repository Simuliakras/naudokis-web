import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Dict } from "@/app/lib/i18n/types";
import {
  pageMetadata, requireLocale, breadcrumbJsonLd, listingJsonLd, NOINDEX_FOLLOW,
} from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListing, listingKey, ListingNotFoundError, type ListingDetail } from "@/app/lib/listings";
import { fetchListingMeta, type ListingMeta } from "@/app/lib/listing-seo";
import { truncate } from "@/app/lib/legal/format";
import { ListingScreen } from "@/app/components/ListingScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Per-listing detail is unbounded dynamic data — render on demand, cache 5 min.
// (Literal to satisfy Next's static segment-config analysis; same value as
// LISTING_REVALIDATE, which the data-layer fetches use.)
export const revalidate = 300;

// Prefer the listing's own description (de-tagged + trimmed) when it's
// substantial; otherwise fall back to the templated SEO description from the
// dictionary. Word-boundary truncation with an ellipsis (shared truncate()) —
// a hard slice amputated SERP snippets mid-word.
function cleanDescription(raw: string): string {
  return raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function listingDescription(data: ListingMeta, fromDict: string): string {
  const clean = cleanDescription(data.description);
  return clean.length >= 80 ? truncate(clean, 160) : fromDict;
}

// Turn a slug-style id ("bosch-gsr-18v") into a readable title ("Bosch Gsr 18v")
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
  const metadata = pageMetadata({
    locale, path: `/skelbimai/${id}`, title, description,
    ogLocale: meta.ogLocale, ogImageAlt: data?.title ?? meta.ogImageAlt, image: data?.image,
  });
  if (!data) {
    metadata.robots = NOINDEX_FOLLOW;
  }
  return metadata;
}

export default async function Page({ params }: PageProps<"/[lang]/skelbimai/[id]">) {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  const { common, feed, detail } = getDictionary(locale);

  // Fetch the detail (so ListingScreen's useListing() hydrates from HTML) and the
  // raw meta (for the Product structured data) in parallel. Catch the detail so a
  // 404 becomes a real HTTP 404 and a transient failure degrades to the client's
  // retryable state rather than crashing the render.
  const qc = makeQueryClient();
  const [detailResult, data] = await Promise.all([
    fetchListing(id, locale)
      .then((d) => ({ ok: true as const, d }))
      .catch((e: unknown) => ({ ok: false as const, e })),
    fetchListingMeta(id, locale),
  ]);
  if (!detailResult.ok) {
    // Confirmed 404 → render app/[lang]/not-found.tsx (real 404 status; generateMetadata
    // already sets NOINDEX_FOLLOW when meta is null). Transient 5xx/network: leave the
    // cache unseeded so the client refetch shows the retryable error screen.
    if (detailResult.e instanceof ListingNotFoundError) {
      notFound();
    }
  } else {
    qc.setQueryData<ListingDetail>(listingKey(id, locale), detailResult.d);
  }

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: feed.titleAll, path: "/skelbimai" },
    { name: data?.title ?? listingFallbackTitle(id, detail), path: `/skelbimai/${id}` },
  ]);
  const product = data
    ? listingJsonLd({
        locale, id, name: data.title, description: cleanDescription(data.description), image: data.image,
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
