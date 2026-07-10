import type { Metadata } from "next";
import { categoryIdFromSlug, cityFromSlug, requireLocale } from "@/app/lib/seo";
import {
  ListingLandingPage,
  listingLandingMetadata,
  resolveSubcategory,
} from "@/app/lib/listing-landing-page";
import type { LandingSearchParams } from "@/app/lib/landing-params";

export const revalidate = 300;

type CategorySlugPageProps = {
  params: Promise<{ lang: string; category: string; slug: string }>;
  searchParams: Promise<LandingSearchParams>;
};

async function resolveFilters({ locale, category, slug }: { locale: ReturnType<typeof requireLocale>; category: string; slug: string }) {
  const cityName = cityFromSlug(slug);
  if (cityName) {
    return {
      filters: { category: categoryIdFromSlug(category), city: cityName },
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

export async function generateMetadata({ params, searchParams }: CategorySlugPageProps): Promise<Metadata> {
  const { lang, category, slug } = await params;
  const locale = requireLocale(lang);
  const resolved = await resolveFilters({ locale, category, slug });
  return listingLandingMetadata({
    locale,
    filters: resolved.filters,
    searchParams: await searchParams,
    categoriesOverride: resolved.categoriesOverride,
  });
}

export default async function Page({ params, searchParams }: CategorySlugPageProps) {
  const { lang, category, slug } = await params;
  const locale = requireLocale(lang);
  const resolved = await resolveFilters({ locale, category, slug });
  return (
    <ListingLandingPage
      locale={locale}
      filters={resolved.filters}
      searchParams={await searchParams}
      extraCategory={resolved.extraCategory}
    />
  );
}
