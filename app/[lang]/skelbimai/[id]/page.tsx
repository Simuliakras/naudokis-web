import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Dict } from "@/app/lib/i18n/types";
import {
  pageMetadata, requireLocale, breadcrumbJsonLd, listingJsonLd, listingLandingPath, NOINDEX_FOLLOW,
} from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListing, fetchListings, listingKey, listingsKey, ListingNotFoundError, type ListingDetail } from "@/app/lib/listings";
import { categoriesKey, fetchCategories } from "@/app/lib/categories";
import { fetchListingMeta, type ListingMeta } from "@/app/lib/listing-seo";
import { fetchAllListingSitemapEntries } from "@/app/lib/listing-sitemap";
import { listingDetailPath, listingIdFromParam, isSyntheticListingParam } from "@/app/lib/listing-url";
import { localePath } from "@/app/lib/i18n/config";
import { truncate } from "@/app/lib/legal/format";
import { ListingScreen } from "@/app/components/ListingScreen";
import { JsonLd } from "@/app/components/JsonLd";
import { QueryProvider } from "@/app/providers";

// Re-render a listing's HTML at most every 5 min. (Literal to satisfy Next's static
// segment-config analysis; same value as LISTING_REVALIDATE, which the data-layer
// fetches use.)
export const revalidate = 300;

// Prerender every public listing at build time.
//
// This is load-bearing for SEO, not just a latency win. A dynamic segment with no
// generateStaticParams is rendered per request with no ISR entry at all (measured:
// `cache-control: no-store`, no `x-nextjs-cache`), and the route-level loading.tsx
// then flushes as the shell — so the real <h1>, the listing body and the Product
// JSON-LD all land inside a `<div hidden>` that only React's inline $RC() script
// reveals. Every crawler that does not execute JS saw a skeleton whose only heading
// was the generic "Nuomojami daiktai". Prerendering resolves the whole tree before
// the HTML is written, which puts the content back in the shell.
//
// Reuses the sitemap's cursor walk so the prerendered set and the advertised set are
// the same set, filtered by the same synthetic-fixture rule. That walk fail-softs to
// a partial (or empty) list, and `dynamicParams` stays at its default `true`, so a
// backend hiccup at build time degrades to on-demand generation — never a failed
// build, and never a 404 for a listing created since the last deploy.
export async function generateStaticParams() {
  const entries = await fetchAllListingSitemapEntries();
  return entries.map((entry) => {
    // The same slug the canonical check below compares against, so a prerendered
    // param can never trip the permanentRedirect branch.
    const path = listingDetailPath(entry);
    return { id: path.slice(path.lastIndexOf("/") + 1) };
  });
}

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

// Owner-authored descriptions are commonly Lithuanian. Keep the English head
// and JSON-LD consistently English unless the API eventually exposes a reviewed
// locale-specific description field; the visible page still shows the original
// text with its language disclosure.
function localizedListingDescription(locale: "lt" | "en", data: ListingMeta, fromDict: string): string {
  return locale === "lt" ? listingDescription(data, fromDict) : fromDict;
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
  const listingId = listingIdFromParam(id);
  if (isSyntheticListingParam(id) || isSyntheticListingParam(listingId)) {
    notFound();
  }
  const data = await fetchListingMeta(listingId, locale);
  const title = data ? detail.seoTitle({ title: data.title.trim(), city: data.city }) : listingFallbackTitle(id, detail);
  const description = data
    ? localizedListingDescription(locale, data, detail.seoDescription({ title: data.title, city: data.city, category: data.categoryNames[0] }))
    : detail.metaFallbackDescription;
  const metadata = pageMetadata({
    locale,
    path: data ? listingDetailPath({ id: listingId, title: data.title, city: data.city }) : `/skelbimai/${id}`,
    title,
    description,
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
  const listingId = listingIdFromParam(id);
  if (isSyntheticListingParam(id) || isSyntheticListingParam(listingId)) {
    notFound();
  }

  // Fetch the detail (so ListingScreen's useListing() hydrates from HTML) and the
  // raw meta (for the Product structured data) in parallel. Catch the detail so a
  // 404 becomes a real HTTP 404 and a transient failure degrades to the client's
  // retryable state rather than crashing the render.
  const qc = makeQueryClient();
  const [detailResult, data] = await Promise.all([
    fetchListing(listingId, locale)
      .then((d) => ({ ok: true as const, d }))
      .catch((e: unknown) => ({ ok: false as const, e })),
    fetchListingMeta(listingId, locale),
  ]);
  if (!detailResult.ok) {
    // Confirmed 404 → render app/[lang]/not-found.tsx (real 404 status; generateMetadata
    // already sets NOINDEX_FOLLOW when meta is null). Transient 5xx/network: leave the
    // cache unseeded so the client refetch shows the retryable error screen.
    if (detailResult.e instanceof ListingNotFoundError) {
      notFound();
    }
  } else {
    qc.setQueryData<ListingDetail>(listingKey(listingId, locale), detailResult.d);
  }
  // Redirect BEFORE prefetching: a legacy bare-UUID URL (app deep links, old
  // shares) is about to 308 away, so any work done for it is thrown away.
  const canonicalPath = data ? listingDetailPath({ id: listingId, title: data.title, city: data.city }) : `/skelbimai/${id}`;
  if (data && id !== canonicalPath.split("/").at(-1)) {
    permanentRedirect(localePath(locale, canonicalPath));
  }

  // Categories feed the breadcrumb's category crumb in ListingScreen. Without this
  // prefetch, SSR renders the tags[0] fallback and the client swaps it for the real
  // category name after hydration — while the BreadcrumbList JSON-LD below already
  // says a third thing. Seed it so all three agree on first paint.
  const categoryId = data?.categoryId;
  await Promise.all([
    qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) }),
    ...(categoryId
      ? [qc.prefetchQuery({
          queryKey: listingsKey(locale, { category: categoryId }),
          queryFn: () => fetchListings(locale, { category: categoryId }),
        })]
      : []),
  ]);

  const schemaDescription = data
    ? localizedListingDescription(locale, data, detail.seoDescription({ title: data.title, city: data.city, category: data.categoryNames[0] }))
    : "";

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: feed.titleAll, path: "/skelbimai" },
    ...(data?.categoryId && data.categoryNames[0]
      ? [{ name: data.categoryNames[0], path: listingLandingPath({ category: data.categoryId }) }]
      : []),
    { name: data?.title ?? listingFallbackTitle(id, detail), path: canonicalPath },
  ]);
  const product = data
    ? listingJsonLd({
        locale, id: listingId, path: canonicalPath, name: data.title, description: schemaDescription, image: data.image,
        priceCents: data.priceCents, ratingAverage: data.ratingAverage, ratingCount: data.ratingCount,
        itemCondition: data.itemCondition, category: data.categoryNames[0],
        sellerName: data.sellerName, sellerIsBusiness: data.sellerIsBusiness,
      })
    : null;

  return (
    <QueryProvider>
      <HydrationBoundary state={dehydrate(qc)}>
        <JsonLd data={breadcrumb} />
        {product && <JsonLd data={product} />}
        <ListingScreen id={listingId} />
      </HydrationBoundary>
    </QueryProvider>
  );
}
