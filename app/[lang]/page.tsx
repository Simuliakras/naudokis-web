import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { requireLocale, organizationJsonLd, webSiteJsonLd, faqJsonLd, softwareApplicationJsonLd } from "@/app/lib/seo";
import { makeQueryClient } from "@/app/lib/query";
import { fetchListings, listingsKey } from "@/app/lib/listings";
import { fetchCategories, categoriesKey } from "@/app/lib/categories";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { Chrome } from "../components/Chrome";
import { Nav, Categories, Offers, Faq, UseCases } from "../components/sections";
import { Hero, Features, HowItWorksStrip, CtaBanner, Footer } from "../components/sections-home";
import { JsonLd } from "../components/JsonLd";

// Regenerate the static home pages so the prefetched featured listings /
// categories don't stay frozen at build time (same window as the data-layer
// fetch revalidate in app/lib/listings.ts).
export const revalidate = 300;

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

  // Interactive sections (Nav, Categories, Offers, Faq) are client components;
  // the presentational ones render on the server and take `locale` directly
  // (sections-home.tsx) so their markup stays out of the client bundle.
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={webSiteJsonLd(locale)} />
      <JsonLd data={faqJsonLd(getDictionary(locale).faq.items)} />
      <Chrome>
        <div className="nk-page">
          <Nav />
          <main id="nk-main">
            <Hero locale={locale} />
            <Categories />
            <Offers />
            {/* 1-2-3 model strip right after the product rows — answers "why
                can't I book here?" without opening the How-It-Works page */}
            <HowItWorksStrip locale={locale} />
            <Features locale={locale} />
            <UseCases />
            <CtaBanner locale={locale} />
            <Faq />
          </main>
          <Footer locale={locale} />
        </div>
      </Chrome>
    </HydrationBoundary>
  );
}
