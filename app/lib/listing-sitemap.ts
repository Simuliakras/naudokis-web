import type { MetadataRoute } from "next";
import { API_BASE, USES_PRODUCTION_API } from "@/app/lib/api";
import { locales, defaultLocale, localePath } from "@/app/lib/i18n/config";
import { SITE_URL } from "@/app/lib/seo";
import { isSyntheticListing, listingDetailPath } from "@/app/lib/listing-url";

export const LISTINGS_PER_SITEMAP = 1000;
const API_PAGE_SIZE = 100;

type SitemapListings = {
  data?: {
    count?: number;
    items?: { id?: string; title?: string; city?: string | null; status?: string; updated_at?: string; images?: { url?: string }[] }[];
    has_more?: boolean;
    next_token?: string;
  };
};

type ListingEntry = { id: string; title?: string; city?: string; lastModified?: Date; images: string[] };

function safePublicImage(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.endsWith("example.com") ? url : undefined;
  } catch {
    return undefined;
  }
}

// A type guard, so the `id` narrows to string and callers need no `!`.
type SitemapItem = NonNullable<NonNullable<SitemapListings["data"]>["items"]>[number];

// THE eligibility rule for the listing sitemap — one definition, used by both the
// count and the entry walk. Two copies of this drifting apart is how a record ends
// up advertised to crawlers but hidden from the feed (see listing-url.ts: a record
// must not be public on one surface and hidden on another).
//
// Deliberately identical to publicListingItems() in listings.ts: `status` must be
// "active" (not merely "not inactive"), and the synthetic check gets the image URLs,
// because some seed rows are only identifiable by their example.com photos. Anything
// looser would advertise a URL the feed refuses to show and the detail page may 404.
function isPublicSitemapListing(item: SitemapItem): item is SitemapItem & { id: string } {
  if (!item.id || item.status !== "active") {
    return false;
  }
  return !isSyntheticListing({
    id: item.id,
    title: item.title,
    imageUrls: item.images?.flatMap((image) => image.url ?? []),
  });
}

async function fetchListingsPage(token?: string): Promise<SitemapListings["data"] | null> {
  const url = new URL(`${API_BASE}/listings`);
  url.searchParams.set("limit", String(API_PAGE_SIZE));
  if (token) {
    url.searchParams.set("next_token", token);
  }
  // Bounded: a hanging backend must not hang a robots.txt / sitemap render, which
  // now walks the whole cursor rather than reading a single page.
  const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    // Must NOT be swallowed as "end of cursor": a 500 halfway through the walk would
    // silently shorten the catalogue, dropping whole sitemap chunks for an hour.
    throw new Error(`[listing-sitemap] ${url.pathname} responded ${res.status}`);
  }
  const body: SitemapListings = await res.json();
  return body.data ?? null;
}

// One cursor walk, shared by both surfaces below. Yields every public listing in
// backend order; throws if any page fails, so a partial walk can never masquerade
// as a complete one.
async function* walkPublicListings(): AsyncGenerator<SitemapItem & { id: string }> {
  let token: string | undefined;
  // A broken backend cursor must never turn a route render into an unbounded loop.
  for (let page = 0; page <= 10_000; page++) {
    const data = await fetchListingsPage(token);
    if (!data) {
      return;
    }
    for (const item of data.items ?? []) {
      if (isPublicSitemapListing(item)) {
        yield item;
      }
    }
    token = data.next_token;
    if (!data.has_more || !token) {
      return;
    }
  }
}

// The listing sitemap is a public SEO surface, so it is emitted only against the
// production catalogue — a dev/staging dataset must never be advertised to
// crawlers. The skip is loud: a silently empty sitemap is indistinguishable from
// a healthy one with no listings.
function skipNonProductionApi(surface: string): boolean {
  if (USES_PRODUCTION_API) {
    return false;
  }
  console.warn(`[listing-sitemap] ${surface} skipped: API_BASE is not the production catalogue (${API_BASE}).`);
  return true;
}

// The catalogue API's `count` is the size of the current cursor page, not a global
// total, so the only way to size the sitemap index is to walk it.
export async function fetchListingSitemapCount(): Promise<number> {
  if (skipNonProductionApi("count")) return 0;
  let total = 0;
  try {
    const walk = walkPublicListings();
    while (!(await walk.next()).done) {
      total++;
    }
  } catch (error) {
    // All-or-nothing on purpose: a partial count advertises FEWER chunks than exist,
    // which hides every listing past the truncation point. Publishing no listing
    // sitemap for one revalidate window is the recoverable failure; publishing a
    // short one is not.
    console.warn("[listing-sitemap] count walk failed; advertising no listing sitemaps this cycle.", error);
    return 0;
  }
  return Math.ceil(total / LISTINGS_PER_SITEMAP);
}

export async function fetchListingSitemapEntries(chunkIndex: number): Promise<ListingEntry[]> {
  if (skipNonProductionApi("entries")) return [];
  const start = Math.max(0, chunkIndex) * LISTINGS_PER_SITEMAP;
  const end = start + LISTINGS_PER_SITEMAP;
  const entries: ListingEntry[] = [];
  let seen = 0;

  try {
    for await (const item of walkPublicListings()) {
      if (seen >= start) {
        const updated = item.updated_at ? new Date(item.updated_at) : undefined;
        const image = safePublicImage(item.images?.[0]?.url);
        entries.push({
          id: item.id,
          title: item.title,
          city: item.city ?? undefined,
          lastModified: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
          images: image ? [image] : [],
        });
      }
      seen++;
      if (seen >= end) {
        break;
      }
    }
  } catch (error) {
    // A short chunk is still a valid chunk (the missing URLs return next cycle), so
    // this degrades rather than 500s the route — but never silently.
    console.warn(`[listing-sitemap] entry walk for chunk ${chunkIndex} failed after ${entries.length} entries.`, error);
  }

  return entries;
}

// Single-file sitemap: every public listing in one walk, for when the whole site is
// one flat /sitemap.xml with no index. A flat sitemap is valid only up to Google's
// 50,000-URL / 50 MB ceiling, and each listing emits one <url> PER LOCALE, so the
// cap is on listings, well under half of 50k with room for the page URLs sharing the
// file. Crossing it truncates loudly — that warning is the signal to restore the
// sitemap index (generateSitemaps) instead of raising the cap.
export const MAX_SINGLE_SITEMAP_LISTINGS = 20_000;

export async function fetchAllListingSitemapEntries(): Promise<ListingEntry[]> {
  if (skipNonProductionApi("entries")) return [];
  const entries: ListingEntry[] = [];
  try {
    for await (const item of walkPublicListings()) {
      const updated = item.updated_at ? new Date(item.updated_at) : undefined;
      const image = safePublicImage(item.images?.[0]?.url);
      entries.push({
        id: item.id,
        title: item.title,
        city: item.city ?? undefined,
        lastModified: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
        images: image ? [image] : [],
      });
      if (entries.length >= MAX_SINGLE_SITEMAP_LISTINGS) {
        console.warn(
          `[listing-sitemap] single sitemap hit the ${MAX_SINGLE_SITEMAP_LISTINGS}-listing cap; truncating. Restore the sitemap index (generateSitemaps) rather than raising this.`,
        );
        break;
      }
    }
  } catch (error) {
    // A short list is still valid (the missing URLs return next cycle); degrade
    // rather than 500 the whole sitemap, but never silently.
    console.warn(`[listing-sitemap] listing walk failed after ${entries.length} entries.`, error);
  }
  return entries;
}

export function localizedListingSitemapEntries(entries: ListingEntry[]): MetadataRoute.Sitemap {
  return entries.flatMap((entry) =>
    locales.map((locale) => {
      // The owner-authored title slug is locale-invariant, but the route segment is
      // not (/skelbimai vs /listings), so this goes through `localePath`.
      const path = listingDetailPath({ id: entry.id, title: entry.title, city: entry.city });
      return {
        url: `${SITE_URL}${localePath(locale, path)}`,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, `${SITE_URL}${localePath(l, path)}`]),
            ),
            "x-default": `${SITE_URL}${localePath(defaultLocale, path)}`,
          },
        },
        ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
        ...(entry.images.length ? { images: entry.images } : {}),
      };
    }),
  );
}
