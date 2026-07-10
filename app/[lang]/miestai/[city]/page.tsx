import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import { ListingLandingPage, listingLandingMetadata } from "@/app/lib/listing-landing-page";
import type { LandingSearchParams } from "@/app/lib/landing-params";

// Cache the landing HTML for up to 5 min (matches the feed/home ISR window).
export const revalidate = 300;

type CityPageProps = {
  params: Promise<{ lang: string; city: string }>;
  searchParams: Promise<LandingSearchParams>;
};

export async function generateMetadata({ params, searchParams }: CityPageProps): Promise<Metadata> {
  const { lang, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  return listingLandingMetadata({
    locale,
    filters: { city: cityName },
    searchParams: await searchParams,
  });
}

export default async function Page({ params, searchParams }: CityPageProps) {
  const { lang, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  return <ListingLandingPage locale={locale} filters={{ city: cityName }} searchParams={await searchParams} />;
}
