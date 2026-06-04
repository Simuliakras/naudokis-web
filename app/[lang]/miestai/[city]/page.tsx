import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import {
  pageMetadata, requireLocale, breadcrumbJsonLd, itemListJsonLd,
} from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListings, listingsKey, type Offer } from "@/app/lib/listings";
import { LT_CITIES, citySlug, cityFromSlug } from "@/app/lib/cities";
import { CityScreen } from "@/app/components/CityScreen";
import { JsonLd } from "@/app/components/JsonLd";

// A bounded, known set of city pages — prerender all of them per locale.
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LT_CITIES.map((c) => ({ city: citySlug(c) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/miestai/[city]">): Promise<Metadata> {
  const { lang, city: slug } = await params;
  const locale = requireLocale(lang);
  const city = cityFromSlug(slug);
  if (!city) {
    notFound();
  }
  const { cityPage: t, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: `/miestai/${slug}`, title: t.metaTitle(city), description: t.metaDescription(city),
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/miestai/[city]">) {
  const { lang, city: slug } = await params;
  const locale = requireLocale(lang);
  const city = cityFromSlug(slug);
  if (!city) {
    notFound();
  }
  const { common, cityPage: t } = getDictionary(locale);

  // Seed the cache with the city-scoped listings and reuse them for the ItemList.
  // prefetchQuery swallows backend errors so a hiccup never fails the build.
  const qc = makeQueryClient();
  const key = listingsKey(locale, { city });
  await qc.prefetchQuery({ queryKey: key, queryFn: () => fetchListings(locale, { city }) });
  const listings = qc.getQueryData<Offer[]>(key) ?? [];

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.crumb, path: "/skelbimai" },
    { name: city, path: `/miestai/${slug}` },
  ]);
  const itemList = itemListJsonLd(locale, listings.map((l) => ({ id: l.id, name: l.title })));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemList} />
      <CityScreen city={city} />
    </HydrationBoundary>
  );
}
