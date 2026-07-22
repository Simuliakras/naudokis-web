import type { MetadataRoute } from "next";
import { locales, defaultLocale, localePath } from "@/app/lib/i18n/config";
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
  // `localePath` translates the route segments as well as adding the prefix, so the
  // English entry is /en/listings, not /en/skelbimai. Both the `url` and the
  // hreflang cluster have to agree with the page's own canonical or the cluster is
  // ignored — see app/lib/i18n/routes.ts.
  const localizedPath = (locale: (typeof locales)[number]) => localePath(locale, path);
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
const SITEMAP_REVALIDATE = 3600;

// `landing` is the URL shape (parent id + optional child id + city);
// `categoryFilter` is the LEAF category id, which is what the backend's
// ?category= expects — for a subcategory landing the two differ.
type LandingCandidate = {
  landing: { category?: string; subcategory?: string; city?: string };
  categoryFilter?: string;
};

// Keep only the candidates that clear MIN_INDEXABLE_LISTINGS, in bounded-concurrency
// batches: an hourly rebuild must not open one backend connection per candidate at
// once.
//
// `stopAt` matters here: the only question asked of each candidate is "does it clear
// the threshold?", which the first page of results answers. Without it, every
// candidate walks the cursor to the 240 cap.
//
// A single failed probe drops one URL for an hour, which self-heals and costs little
// (a sitemap omission is not a deindex signal). A run where *every* probe failed is
// a backend outage, not an empty catalogue — throw rather than publish a sitemap that
// claims the whole marketplace vanished.
async function keepStocked(candidates: LandingCandidate[]): Promise<LandingCandidate[]> {
  const stocked: LandingCandidate[] = [];
  let failures = 0;
  for (let i = 0; i < candidates.length; i += COUNT_CONCURRENCY) {
    const batch = candidates.slice(i, i + COUNT_CONCURRENCY);
    const counts = await Promise.all(
      batch.map((candidate) =>
        fetchListingsCount(
          { category: candidate.categoryFilter, city: candidate.landing.city },
          { stopAt: MIN_INDEXABLE_LISTINGS, revalidate: SITEMAP_REVALIDATE },
        ).catch(() => {
          failures += 1;
          return 0;
        }),
      ),
    );
    batch.forEach((candidate, j) => {
      if (counts[j] >= MIN_INDEXABLE_LISTINGS) {
        stocked.push(candidate);
      }
    });
  }
  if (candidates.length > 0 && failures === candidates.length) {
    throw new Error("sitemap: every listing-count probe failed");
  }
  return stocked;
}

async function listingLandingPaths(): Promise<string[]> {
  // Deliberately unguarded. Swallowing this to [] drops every category landing
  // from the sitemap — silently, with a 200 — and takes the subcategory tier's
  // only machine-readable discovery path with it. Throwing keeps the last good
  // sitemap served from the ISR cache instead (see the Next ISR guide: throw so
  // the cache is not updated).
  const categories = await fetchAllCategories(defaultLocale);
  const parents = categories.filter((category) => !category.parentId);
  const parentById = new Map(parents.map((category) => [category.id, category]));

  const base: LandingCandidate[] = [
    ...parents.map((category) => ({ landing: { category: category.id }, categoryFilter: category.id })),
    // Subcategory landings are real indexable routes too. Without these entries
    // they have no reliable discovery path because the public category grids
    // intentionally show only the top level.
    ...categories.flatMap((subcategory) => {
      const parent = subcategory.parentId ? parentById.get(subcategory.parentId) : undefined;
      return parent
        ? [{
            landing: { category: parent.id, subcategory: subcategory.id },
            categoryFilter: subcategory.id,
          }]
        : [];
    }),
    ...LT_CITIES.map((city) => ({ landing: { city } })),
  ];
  const stocked = await keepStocked(base);

  // Expand only the categories that already cleared the threshold nationally. A
  // city filter can only narrow a result set, so a category short of the minimum
  // overall cannot reach it in any single city — probing the full category × city
  // grid would spend hundreds of requests per rebuild ruling out combinations
  // arithmetic already rules out. This is also what reaches the deepest tier,
  // /nuoma/{category}/{subcategory}/{city}, which nothing on the site links to.
  const withCity = stocked
    .filter((candidate) => candidate.categoryFilter)
    .flatMap((candidate) =>
      LT_CITIES.map((city) => ({
        landing: { ...candidate.landing, city },
        categoryFilter: candidate.categoryFilter,
      })),
    );

  return [...stocked, ...await keepStocked(withCity)]
    .map((candidate) => listingLandingPath(candidate.landing));
}

// Re-enumerate category/city landing URLs hourly (the category fetch is cached).
// Must remain a literal: Next 16 statically analyses route segment exports and
// rejects even a same-module constant here.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only asks "is the catalogue non-empty?" — one listing settles it.
  const hasListings = await fetchListingsCount(
    {},
    { stopAt: 1, revalidate: SITEMAP_REVALIDATE },
  ).then((count) => count > 0).catch(() => false);
  const staticEntries = STATIC_PATHS
    .filter((path) => path !== "/skelbimai" || hasListings)
    .flatMap((path) => localized(path));
  const landingEntries = (await listingLandingPaths()).flatMap((path) => localized(path));
  return [...staticEntries, ...landingEntries];
}
