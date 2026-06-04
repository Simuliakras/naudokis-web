import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/app/lib/i18n/config";
import { LT_CITIES, citySlug } from "@/app/lib/cities";
import { API_BASE } from "@/app/lib/api";

const SITE_URL = "https://naudokis.lt";

// Lithuanian is served unprefixed at "/"; English lives at "/en".
const localePrefix = (locale: string) => (locale === defaultLocale ? "" : `/${locale}`);

// Per-locale entries for a bare path ("" → home), with hreflang alternates.
function localized(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${localePrefix(l)}${path || "/"}`]),
  );
  return locales.map((locale) => ({
    url: `${SITE_URL}${localePrefix(locale)}${path || "/"}`,
    changeFrequency: "weekly" as const,
    // The unprefixed default locale is canonical, so rank it slightly higher.
    priority: locale === defaultLocale ? priority : Math.max(0.1, priority - 0.2),
    alternates: { languages },
  }));
}

// Static, indexable routes with their default-locale priority.
const STATIC_PATHS: [path: string, priority: number][] = [
  ["", 1],
  ["/kategorijos", 0.8],
  ["/skelbimai", 0.8],
  ["/privatumo-politika", 0.3],
  ["/naudojimo-taisykles", 0.3],
];

// Listing-detail enumeration — cursor-paginated and hard-capped so an unbounded
// backend can never blow up (or stall) the build. Any error degrades to "no
// listings" rather than failing the whole sitemap.
type SitemapListings = {
  data?: { items?: { id?: string; status?: string }[]; has_more?: boolean; next_token?: string };
};
const LISTING_CAP = 1000; // NOTE: listings beyond this are not enumerated here.
async function fetchListingIds(): Promise<string[]> {
  const ids: string[] = [];
  let token: string | undefined;
  try {
    for (let page = 0; page < 20 && ids.length < LISTING_CAP; page++) {
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
        if (item.id && (item.status === undefined || item.status === "active")) {
          ids.push(item.id);
        }
      }
      token = body.data?.next_token;
      if (!body.data?.has_more || !token) {
        break;
      }
    }
  } catch {
    // Keep whatever was collected; never throw from the sitemap.
  }
  if (ids.length >= LISTING_CAP) {
    // Surface silent truncation — listings past the cap are omitted from the map.
    console.warn(`sitemap: listing enumeration hit the ${LISTING_CAP} cap; remaining listings are not included.`);
  }
  return ids.slice(0, LISTING_CAP);
}

// Re-enumerate listings hourly (the fetches above are also cached for an hour).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap(([path, priority]) => localized(path, priority));
  const cityEntries = LT_CITIES.flatMap((c) => localized(`/miestai/${citySlug(c)}`, 0.6));
  const listingEntries = (await fetchListingIds()).flatMap((id) => localized(`/skelbimai/${id}`, 0.5));
  return [...staticEntries, ...cityEntries, ...listingEntries];
}
