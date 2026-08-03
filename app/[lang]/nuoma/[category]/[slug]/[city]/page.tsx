import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityFromSlug, requireLocale } from "@/app/lib/seo";
import {
  ListingLandingPage,
  listingLandingMetadata,
  resolveSubcategory,
} from "@/app/lib/listing-landing-page";

export const revalidate = 300;

type SubcategoryCityPageProps = {
  params: Promise<{ lang: string; category: string; slug: string; city: string }>;
};

// On-demand ISR for the combinatorial deepest tier (~1,000 paths), without prebuilding
// any of them — only the stocked combinations are ever exposed, via the sitemap.
//
// The EMPTY ARRAY is load-bearing and not the same as omitting this export: Next
// requires generateStaticParams to be present (returning []) for a route to revalidate
// paths at runtime. See node_modules/next/dist/docs/01-app/03-api-reference/04-functions/
// generate-static-params.md ("You must return an empty array from generateStaticParams
// … in order to revalidate (ISR) paths at runtime").
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: SubcategoryCityPageProps): Promise<Metadata> {
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
    categoriesOverride: resolved.categories,
  });
}

export default async function Page({ params }: SubcategoryCityPageProps) {
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
      extraCategory={resolved.subcategory}
    />
  );
}
