import type { MetadataRoute } from "next";
import { locales, defaultLocale, localePrefix } from "@/app/lib/i18n/config";
import { fetchCategories } from "@/app/lib/categories";
import { LT_CITIES } from "@/app/lib/cities";
import { fetchListingsCount } from "@/app/lib/listings";
import { listingLandingPath, SITE_URL } from "@/app/lib/seo";

// Per-locale entries for a bare path ("" → home), with hreflang alternates.
// `lastModified`/`images` are only set for entries with real data (listings) —
// a fabricated build-time lastmod on static pages is worse than none.
function localized(
  path: string,
  priority: number,
  extra?: { lastModified?: Date; images?: string[] },
): MetadataRoute.Sitemap {
  const localizedPath = (locale: (typeof locales)[number]) => {
    const prefix = localePrefix(locale);
    return prefix ? `${prefix}${path}` : path || "/";
  };
  const cleanPriority = (value: number) => Number(value.toFixed(1));
  const languages = {
    ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${localizedPath(l)}`])),
    "x-default": `${SITE_URL}${localizedPath(defaultLocale)}`,
  };
  return locales.map((locale) => ({
    url: `${SITE_URL}${localizedPath(locale)}`,
    changeFrequency: "weekly" as const,
    // The unprefixed default locale is canonical, so rank it slightly higher.
    priority: cleanPriority(locale === defaultLocale ? priority : Math.max(0.1, priority - 0.2)),
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
  ["/naudojimosi-salygos", 0.3],
  ["/paskyros-trynimas", 0.3],
];

// Max simultaneous count lookups when enumerating landing candidates.
const COUNT_CONCURRENCY = 8;

async function listingLandingPaths(): Promise<string[]> {
  const categories = await fetchCategories(defaultLocale).catch(() => []);
  type LandingCandidate = { path: string; category?: string; city?: string };
  const candidates: LandingCandidate[] = [
    ...categories.map((category) => ({ path: listingLandingPath({ category: category.id }), category: category.id })),
    ...LT_CITIES.map((city) => ({ path: listingLandingPath({ city }), city })),
    ...categories.flatMap((category) =>
      LT_CITIES.map((city) => ({
        path: listingLandingPath({ category: category.id, city }),
        category: category.id,
        city,
      })),
    ),
  ];
  // Resolve counts in bounded-concurrency batches: at full catalog this is ~100+
  // candidates (every category × city), and an hourly rebuild must not open one
  // backend connection per candidate at once. Only emit landings that have stock.
  const paths: string[] = [];
  for (let i = 0; i < candidates.length; i += COUNT_CONCURRENCY) {
    const batch = candidates.slice(i, i + COUNT_CONCURRENCY);
    const counts = await Promise.all(
      batch.map((candidate) =>
        fetchListingsCount(defaultLocale, {
          category: candidate.category,
          city: candidate.city,
        }).catch(() => 0),
      ),
    );
    batch.forEach((candidate, j) => {
      if (counts[j] > 0) {
        paths.push(candidate.path);
      }
    });
  }
  return paths;
}

// Re-enumerate category/city landing URLs hourly (the category fetch is cached).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hasListings = await fetchListingsCount(defaultLocale).then((count) => count > 0).catch(() => false);
  const staticEntries = STATIC_PATHS
    .filter(([path]) => path !== "/skelbimai" || hasListings)
    .flatMap(([path, priority]) => localized(path, priority));
  const landingEntries = (await listingLandingPaths()).flatMap((path) => localized(path, 0.65));
  return [...staticEntries, ...landingEntries];
}
