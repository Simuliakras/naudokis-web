import type { Metadata } from "next";
import { requireLocale } from "@/app/lib/seo";
import {
  landingSlugIds,
  ListingLandingPage,
  listingLandingMetadata,
} from "@/app/lib/listing-landing-page";
import type { LandingSearchParams } from "@/app/lib/landing-params";

// Re-render the landing HTML at most every 5 min (matches the feed/home ISR and
// the listings revalidate window), so category/city landings are served from cache
// rather than rendered per request.
export const revalidate = 300;

type CategoryPageProps = {
  params: Promise<{ lang: string; category: string }>;
  searchParams: Promise<LandingSearchParams>;
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return listingLandingMetadata({
    locale,
    filters: { category: landingSlugIds({ locale, categorySlug: category }).categoryId },
    searchParams: await searchParams,
  });
}

export default async function Page({ params, searchParams }: CategoryPageProps) {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return (
    <ListingLandingPage
      locale={locale}
      filters={{ category: landingSlugIds({ locale, categorySlug: category }).categoryId }}
      searchParams={await searchParams}
    />
  );
}
