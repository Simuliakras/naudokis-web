import type { Metadata } from "next";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import {
  landingSlugIds,
  ListingLandingPage,
  listingLandingMetadata,
  resolveSubcategory,
} from "@/app/lib/listing-landing-page";

export const revalidate = 300;

type CategorySlugPageProps = {
  params: Promise<{ lang: string; category: string; slug: string }>;
};

// On-demand ISR, NOT prebuilt — deliberately, and measured.
//
// This tier is combinatorial: ~140 subcategories plus 24 categories × 8 cities, per
// locale, is 900 pages. A prerendered landing costs ~712KB on disk (HTML + RSC +
// segments), so prebuilding them all produced a 412MB deploy artifact against
// Amplify's 220MB limit — `next build` succeeded and the DEPLOY step then failed.
//
// The empty array is load-bearing and not the same as omitting this export: Next
// requires generateStaticParams to be present (returning []) for a route to
// revalidate paths at runtime. See node_modules/next/dist/docs/01-app/03-api-reference/
// 04-functions/generate-static-params.md ("You must return an empty array … in order
// to revalidate (ISR) paths at runtime").
//
// With `revalidate = 300` above, only the first request in each window renders; the
// rest are served from cache. The linked, high-traffic hubs one level up
// (/nuoma/[category] and /miestai/[city]) ARE prebuilt, so the LCP-sensitive entry
// points still never wait on the backend.
export function generateStaticParams() {
  return [];
}

async function resolveFilters({ locale, category, slug }: { locale: ReturnType<typeof requireLocale>; category: string; slug: string }) {
  // The middle slot is a city if it names one, otherwise a subcategory — the same
  // order i18n/routes.ts translates it in.
  const cityName = cityFromSlug(slug);
  if (cityName) {
    const { categoryId } = landingSlugIds({ locale, categorySlug: category });
    return {
      filters: { category: categoryId, city: cityName },
      extraCategory: undefined,
      categoriesOverride: undefined,
    };
  }
  const resolved = await resolveSubcategory({ locale, categorySlug: category, subcategorySlug: slug });
  return {
    filters: { category: resolved.subcategory.id },
    extraCategory: resolved.subcategory,
    categoriesOverride: resolved.categories,
  };
}

export async function generateMetadata({ params }: CategorySlugPageProps): Promise<Metadata> {
  const { lang, category, slug } = await params;
  const locale = requireLocale(lang);
  const resolved = await resolveFilters({ locale, category, slug });
  return listingLandingMetadata({
    locale,
    filters: resolved.filters,
    categoriesOverride: resolved.categoriesOverride,
  });
}

export default async function Page({ params }: CategorySlugPageProps) {
  const { lang, category, slug } = await params;
  const locale = requireLocale(lang);
  const resolved = await resolveFilters({ locale, category, slug });
  return (
    <ListingLandingPage
      locale={locale}
      filters={resolved.filters}
      extraCategory={resolved.extraCategory}
    />
  );
}
