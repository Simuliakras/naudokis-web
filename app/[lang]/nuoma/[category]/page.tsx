import type { Metadata } from "next";
import { requireLocale } from "@/app/lib/seo";
import {
  categoryStaticParams,
  landingSlugIds,
  ListingLandingPage,
  listingLandingMetadata,
} from "@/app/lib/listing-landing-page";

// Re-render the landing HTML at most every 5 min (matches the feed/home ISR and
// the listings revalidate window), so category/city landings are served from cache
// rather than rendered per request.
export const revalidate = 300;

type CategoryPageProps = {
  params: Promise<{ lang: string; category: string }>;
};

// Prebuild the finite top-level taxonomy. Empty categories are still generated — they
// are real navigation destinations — but their metadata is noindex and the sitemap
// omits them. `params` is populated by the [lang] layout's own generateStaticParams.
export async function generateStaticParams({ params: { lang } }: {
  params: Awaited<LayoutProps<"/[lang]">["params"]>;
}) {
  return categoryStaticParams(requireLocale(lang));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return listingLandingMetadata({
    locale,
    filters: { category: landingSlugIds({ locale, categorySlug: category }).categoryId },
  });
}

export default async function Page({ params }: CategoryPageProps) {
  const { lang, category } = await params;
  const locale = requireLocale(lang);
  return (
    <ListingLandingPage
      locale={locale}
      filters={{ category: landingSlugIds({ locale, categorySlug: category }).categoryId }}
    />
  );
}
