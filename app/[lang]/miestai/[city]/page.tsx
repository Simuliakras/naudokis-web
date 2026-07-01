import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import { ListingLandingPage, listingLandingMetadata } from "@/app/lib/listing-landing-page";

// Cache the landing HTML for up to 5 min (matches the feed/home ISR window).
export const revalidate = 300;

type CityPageProps = { params: Promise<{ lang: string; city: string }> };

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { lang, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  return listingLandingMetadata({
    locale,
    filters: { city: cityName },
  });
}

export default async function Page({ params }: CityPageProps) {
  const { lang, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  return <ListingLandingPage locale={locale} filters={{ city: cityName }} />;
}
