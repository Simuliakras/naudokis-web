import type { MetadataRoute } from "next";
import { locales, defaultLocale, localePrefix } from "@/app/lib/i18n/config";
import { fetchCategories, mergeWithFallbackCategories } from "@/app/lib/categories";
import { LT_CITIES } from "@/app/lib/cities";
import { listingLandingPath, SITE_URL } from "@/app/lib/seo";

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

async function listingLandingPaths(): Promise<string[]> {
  const categories = mergeWithFallbackCategories(
    defaultLocale,
    await fetchCategories(defaultLocale).catch(() => []),
  );
  return [
    ...categories.map((category) => listingLandingPath({ category: category.id })),
    ...LT_CITIES.map((city) => listingLandingPath({ city })),
    ...categories.flatMap((category) =>
      LT_CITIES.map((city) => listingLandingPath({ category: category.id, city })),
    ),
  ];
}

// Re-enumerate category/city landing URLs hourly (the category fetch is cached).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap(([path, priority]) => localized(path, priority));
  const landingEntries = (await listingLandingPaths()).flatMap((path) => localized(path, 0.65));
  return [...staticEntries, ...landingEntries];
}
