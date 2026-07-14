import type { MetadataRoute } from "next";
import { API_BASE, USES_PRODUCTION_API } from "@/app/lib/api";
import { locales, localePrefix } from "@/app/lib/i18n/config";
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

function isProductionListing(item: SitemapItem): item is SitemapItem & { id: string } {
  return !!item.id && !isSyntheticListing({ id: item.id, title: item.title });
}

async function fetchListingsPage(token?: string): Promise<SitemapListings["data"] | null> {
  const url = new URL(`${API_BASE}/listings`);
  url.searchParams.set("limit", String(API_PAGE_SIZE));
  if (token) {
    url.searchParams.set("next_token", token);
  }
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return null;
  }
  const body: SitemapListings = await res.json();
  return body.data ?? null;
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

export async function fetchListingSitemapCount(): Promise<number> {
  if (skipNonProductionApi("count")) return 0;
  try {
    const data = await fetchListingsPage();
    return Math.ceil((data?.count ?? data?.items?.length ?? 0) / LISTINGS_PER_SITEMAP);
  } catch {
    return 0;
  }
}

export async function fetchListingSitemapEntries(chunkIndex: number): Promise<ListingEntry[]> {
  if (skipNonProductionApi("entries")) return [];
  const start = Math.max(0, chunkIndex) * LISTINGS_PER_SITEMAP;
  const end = start + LISTINGS_PER_SITEMAP;
  const entries: ListingEntry[] = [];
  let seen = 0;
  let token: string | undefined;

  try {
    for (let page = 0; ; page++) {
      const data = await fetchListingsPage(token);
      if (!data) {
        break;
      }
      for (const item of data.items ?? []) {
        if (!isProductionListing(item) || (item.status !== undefined && item.status !== "active")) {
          continue;
        }
        if (seen >= start && seen < end) {
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
          return entries;
        }
      }
      token = data.next_token;
      if (!data.has_more || !token) {
        break;
      }
      // Keep a broken backend cursor from creating an unbounded route render.
      if (page > 10000) {
        break;
      }
    }
  } catch {
    // Return whatever was collected. Sitemap generation should degrade, not fail.
  }

  return entries;
}

export function localizedListingSitemapEntries(entries: ListingEntry[]): MetadataRoute.Sitemap {
  return entries.flatMap((entry) =>
    locales.map((locale) => {
      const path = listingDetailPath({ id: entry.id, title: entry.title, city: entry.city });
      return {
        url: `${SITE_URL}${localePrefix(locale)}${path}`,
        alternates: {
          languages: {
            ...Object.fromEntries(
              locales.map((l) => [l, `${SITE_URL}${localePrefix(l)}${path}`]),
            ),
            "x-default": `${SITE_URL}${path}`,
          },
        },
        ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
        ...(entry.images.length ? { images: entry.images } : {}),
      };
    }),
  );
}
