import type { MetadataRoute } from "next";
import { locales, defaultLocale, localePrefix } from "@/app/lib/i18n/config";
import { API_BASE } from "@/app/lib/api";

const SITE_URL = "https://naudokis.lt";

// Per-locale entries for a bare path ("" → home), with hreflang alternates.
// `lastModified`/`images` are only set for entries with real data (listings) —
// a fabricated build-time lastmod on static pages is worse than none.
function localized(
  path: string,
  priority: number,
  extra?: { lastModified?: Date; images?: string[] },
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${localePrefix(l)}${path || "/"}`]),
  );
  return locales.map((locale) => ({
    url: `${SITE_URL}${localePrefix(locale)}${path || "/"}`,
    changeFrequency: "weekly" as const,
    // The unprefixed default locale is canonical, so rank it slightly higher.
    priority: locale === defaultLocale ? priority : Math.max(0.1, priority - 0.2),
    alternates: { languages },
    ...(extra?.lastModified ? { lastModified: extra.lastModified } : {}),
    ...(extra?.images?.length ? { images: extra.images } : {}),
  }));
}

// Static, indexable routes with their default-locale priority. The two legal
// documents keep their pretty top-level routes.
const STATIC_PATHS: [path: string, priority: number][] = [
  ["", 1],
  ["/kaip-tai-veikia", 0.7],
  ["/kategorijos", 0.8],
  ["/skelbimai", 0.8],
  ["/privatumo-politika", 0.3],
  ["/naudojimo-taisykles", 0.3],
];

// Listing-detail enumeration — cursor-paginated and hard-capped so an unbounded
// backend can never blow up (or stall) the build. Any error degrades to "no
// listings" rather than failing the whole sitemap.
type SitemapListings = {
  data?: {
    items?: { id?: string; status?: string; updated_at?: string; images?: { url?: string }[] }[];
    has_more?: boolean;
    next_token?: string;
  };
};
type ListingEntry = { id: string; lastModified?: Date; images: string[] };
const LISTING_CAP = 1000; // NOTE: listings beyond this are not enumerated here.
async function fetchListingEntries(): Promise<ListingEntry[]> {
  const entries: ListingEntry[] = [];
  let token: string | undefined;
  try {
    for (let page = 0; page < 20 && entries.length < LISTING_CAP; page++) {
      const url = new URL(`${API_BASE}/listings`);
      url.searchParams.set("limit", "100");
      if (token) {
        url.searchParams.set("next_token", token);
      }
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) {
        break;
      }
      const body: SitemapListings = await res.json();
      for (const item of body.data?.items ?? []) {
        if (!item.id || (item.status !== undefined && item.status !== "active")) {
          continue;
        }
        const updated = item.updated_at ? new Date(item.updated_at) : undefined;
        entries.push({
          id: item.id,
          lastModified: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
          // First photo only — enough for image indexing without bloating the map.
          images: item.images?.[0]?.url ? [item.images[0].url] : [],
        });
      }
      token = body.data?.next_token;
      if (!body.data?.has_more || !token) {
        break;
      }
    }
  } catch {
    // Keep whatever was collected; never throw from the sitemap.
  }
  if (entries.length >= LISTING_CAP) {
    // Surface silent truncation — listings past the cap are omitted from the map.
    console.warn(`sitemap: listing enumeration hit the ${LISTING_CAP} cap; remaining listings are not included.`);
  }
  return entries.slice(0, LISTING_CAP);
}

// Re-enumerate listings hourly (the fetches above are also cached for an hour).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap(([path, priority]) => localized(path, priority));
  const listingEntries = (await fetchListingEntries()).flatMap((l) =>
    localized(`/skelbimai/${l.id}`, 0.5, { lastModified: l.lastModified, images: l.images }),
  );
  return [...staticEntries, ...listingEntries];
}
