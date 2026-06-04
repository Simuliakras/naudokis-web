import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireLocale, organizationJsonLd, webSiteJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListings, listingsKey } from "@/app/lib/listings";
import { fetchCategories, categoriesKey } from "@/app/lib/categories";
import { HomeApp } from "../components/HomeApp";
import { JsonLd } from "../components/JsonLd";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = requireLocale(lang);

  // Prefetch the same queries the Offers/Categories home sections read so the
  // featured cards are present in the initial HTML.
  const qc = makeQueryClient();
  await Promise.all([
    qc.prefetchQuery({ queryKey: listingsKey(locale), queryFn: () => fetchListings(locale, {}) }),
    qc.prefetchQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd(locale)} />
      <HomeApp />
    </HydrationBoundary>
  );
}
