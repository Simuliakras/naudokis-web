import type { MetadataRoute } from "next";
import { locales, defaultLocale, localePrefix } from "@/app/lib/i18n/config";
import { fetchAllCategories } from "@/app/lib/categories";
import { LT_CITIES } from "@/app/lib/cities";
import { fetchListingsCount } from "@/app/lib/listings";
import { listingLandingPath, SITE_URL, MIN_INDEXABLE_LISTINGS } from "@/app/lib/seo";

// Per-locale entries for a bare path ("" → home), with hreflang alternates.
// `lastModified`/`images` are only set for entries with real data (listings) —
// a fabricated build-time lastmod on static pages is worse than none.
function localized(
  path: string,
  extra?: { lastModified?: Date; images?: string[] },
): MetadataRoute.Sitemap {
  const localizedPath = (locale: (typeof locales)[number]) => {
    const prefix = localePrefix(locale);
    return prefix ? `${prefix}${path}` : path || "/";
  };
  const languages = {
    ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${localizedPath(l)}`])),
    "x-default": `${SITE_URL}${localizedPath(defaultLocale)}`,
  };
  return locales.map((locale) => ({
    url: `${SITE_URL}${localizedPath(locale)}`,
    alternates: { languages },
    ...(extra?.lastModified ? { lastModified: extra.lastModified } : {}),
    ...(extra?.images?.length ? { images: extra.images } : {}),
  }));
}

// Static, indexable routes. Every entry is emitted once per locale, with hreflang
// alternates; `priority` is deliberately omitted (Google ignores it).
const STATIC_PATHS = [
  "",
  "/kaip-tai-veikia",
  "/kategorijos",
  "/skelbimai",
  "/privatumo-politika",
  "/naudojimosi-salygos",
  "/paskyros-trynimas",
];

// Max simultaneous count lookups when enumerating landing candidates.
const COUNT_CONCURRENCY = 8;

async function listingLandingPaths(): Promise<string[]> {
  const categories = await fetchAllCategories(defaultLocale).catch(() => []);
  const parents = categories.filter((category) => !category.parentId);
  const parentById = new Map(parents.map((category) => [category.id, category]));
  type LandingCandidate = { path: string; category?: string; city?: string };
  const candidates: LandingCandidate[] = [
    ...parents.map((category) => ({ path: listingLandingPath({ category: category.id }), category: category.id })),
    // Subcategory landings are real indexable routes too. Without these entries
    // they have no reliable discovery path because the public category grids
    // intentionally show only the top level.
    ...categories.flatMap((subcategory) => {
      const parent = subcategory.parentId ? parentById.get(subcategory.parentId) : undefined;
      return parent
        ? [{
            path: listingLandingPath({ category: parent.id, subcategory: subcategory.id }),
            category: subcategory.id,
          }]
        : [];
    }),
    ...LT_CITIES.map((city) => ({ path: listingLandingPath({ city }), city })),
    ...parents.flatMap((category) =>
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
  //
  // `stopAt` matters here: the only question asked of each candidate is "does it
  // clear MIN_INDEXABLE_LISTINGS?", which the first page of results answers. Without
  // it, every one of the ~100+ candidates walks the cursor to the 240 cap.
  const paths: string[] = [];
  for (let i = 0; i < candidates.length; i += COUNT_CONCURRENCY) {
    const batch = candidates.slice(i, i + COUNT_CONCURRENCY);
    const counts = await Promise.all(
      batch.map((candidate) =>
        fetchListingsCount(
          { category: candidate.category, city: candidate.city },
          { stopAt: MIN_INDEXABLE_LISTINGS },
        ).catch(() => 0),
      ),
    );
    batch.forEach((candidate, j) => {
      if (counts[j] >= MIN_INDEXABLE_LISTINGS) {
        paths.push(candidate.path);
      }
    });
  }
  return paths;
}

// Re-enumerate category/city landing URLs hourly (the category fetch is cached).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only asks "is the catalogue non-empty?" — one listing settles it.
  const hasListings = await fetchListingsCount({}, { stopAt: 1 }).then((count) => count > 0).catch(() => false);
  const staticEntries = STATIC_PATHS
    .filter((path) => path !== "/skelbimai" || hasListings)
    .flatMap((path) => localized(path));
  const landingEntries = (await listingLandingPaths()).flatMap((path) => localized(path));
  return [...staticEntries, ...landingEntries];
}
