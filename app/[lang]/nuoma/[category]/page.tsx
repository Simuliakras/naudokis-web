import type { Metadata } from "next";
import { categoryIdFromSlug, requireLocale } from "@/app/lib/seo";
import { ListingLandingPage, listingLandingMetadata } from "@/app/lib/listing-landing-page";

// Re-render the landing HTML at most every 5 min (matches the feed/home ISR and
// the listings revalidate window), so category/city landings are served from cache
// rather than rendered per request.
export const revalidate = 300;

type CategoryPageProps = { params: Promise<{ lang: string; category: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return listingLandingMetadata({
    locale,
    filters: { category: categoryIdFromSlug(category) },
  });
}

export default async function Page({ params }: CategoryPageProps) {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return <ListingLandingPage locale={locale} filters={{ category: categoryIdFromSlug(category) }} />;
}
