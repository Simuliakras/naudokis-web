import type { Metadata } from "next";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import {
  categorySlugStaticParams,
  landingSlugIds,
  ListingLandingPage,
  listingLandingMetadata,
  resolveSubcategory,
} from "@/app/lib/listing-landing-page";

export const revalidate = 300;

type CategorySlugPageProps = {
  params: Promise<{ lang: string; category: string; slug: string }>;
};

// Prebuild both finite middle-segment sets (subcategories and cities) so these pages
// are served as ISR HTML instead of waiting on the API during the request that
// establishes LCP. `params` is populated by the [lang] layout's generateStaticParams.
export async function generateStaticParams({ params: { lang } }: {
  params: Awaited<LayoutProps<"/[lang]">["params"]>;
}) {
  return categorySlugStaticParams(requireLocale(lang));
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
