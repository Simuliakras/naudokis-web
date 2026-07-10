import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import {
  ListingLandingPage,
  listingLandingMetadata,
  resolveSubcategory,
} from "@/app/lib/listing-landing-page";
import type { LandingSearchParams } from "@/app/lib/landing-params";

export const revalidate = 300;

type SubcategoryCityPageProps = {
  params: Promise<{ lang: string; category: string; slug: string; city: string }>;
  searchParams: Promise<LandingSearchParams>;
};

export async function generateMetadata({ params, searchParams }: SubcategoryCityPageProps): Promise<Metadata> {
  const { lang, category, slug, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  const resolved = await resolveSubcategory({ locale, categorySlug: category, subcategorySlug: slug });
  return listingLandingMetadata({
    locale,
    filters: { category: resolved.subcategory.id, city: cityName },
    searchParams: await searchParams,
    categoriesOverride: resolved.categories,
  });
}

export default async function Page({ params, searchParams }: SubcategoryCityPageProps) {
  const { lang, category, slug, city } = await params;
  const locale = requireLocale(lang);
  const cityName = cityFromSlug(city);
  if (!cityName) {
    notFound();
  }
  const resolved = await resolveSubcategory({ locale, categorySlug: category, subcategorySlug: slug });
  return (
    <ListingLandingPage
      locale={locale}
      filters={{ category: resolved.subcategory.id, city: cityName }}
      searchParams={await searchParams}
      extraCategory={resolved.subcategory}
    />
  );
}
