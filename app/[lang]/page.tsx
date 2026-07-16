import { requireLocale, organizationJsonLd, webSiteJsonLd, faqJsonLd, softwareApplicationJsonLd } from "@/app/lib/seo";
import { fetchListings } from "@/app/lib/listings";
import { fetchCategories } from "@/app/lib/categories";
import { captureException } from "@/app/lib/report-error";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { Chrome } from "../components/Chrome";
import { Nav, Categories, Offers, Faq, HowItWorks } from "../components/sections";
import { Hero, Features, CtaBanner, Footer } from "../components/sections-home";
import { JsonLd } from "../components/JsonLd";

// Regenerate the static home pages so the prefetched featured listings /
// categories don't stay frozen at build time (same window as the data-layer
// fetch revalidate in app/lib/listings.ts).
export const revalidate = 300;

// One retry, because this page must not degrade over a single blip: see below.
async function retryOnce<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch {
    return await load();
  }
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  // Invalid locale → real 404 via requireLocale (renders app/[lang]/not-found.tsx).
  const locale = requireLocale(lang);
  const dict = getDictionary(locale);

  // These shelves are fully represented in the initial HTML, so pass their data
  // straight to the sections instead of hydrating a client query cache only to
  // read it once — that is what keeps the query runtime out of the home bundle.
  //
  // It also means a failed fetch must THROW rather than render a "couldn't load"
  // shelf. This route is ISR: a degraded render produced during a background
  // regeneration would be written to the cache and served to every visitor for the
  // next five minutes, with no client-side query left to recover it. Throwing keeps
  // the last good entry in place and lets Next retry on the next request.
  const [offers, categories] = await Promise.all([
    retryOnce(() => fetchListings(locale, {})),
    retryOnce(() => fetchCategories(locale)),
  ]).catch((error: unknown) => {
    // Report explicitly: with no QueryClient on this page there is no QueryCache
    // onError hook, so an unreported catalogue outage here would be invisible.
    captureException(error, { route: "home", locale });
    throw error;
  });

  // Interactive sections (Nav, Categories, Offers, Faq) are client components;
  // the presentational ones render on the server and take `locale` directly
  // (sections-home.tsx) so their markup stays out of the client bundle.
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <JsonLd data={webSiteJsonLd(locale)} />
      <JsonLd data={faqJsonLd(dict.faq.items)} />
      <Chrome>
        <div className="nk-page nk-home">
          <Nav />
          <main id="nk-main">
            <Hero locale={locale} />
            <Categories data={categories} />
            <Offers data={offers} categories={categories} />
            <Features locale={locale} />
            <HowItWorks />
            <CtaBanner locale={locale} />
            <Faq
              eyebrow={dict.faq.eyebrow}
              heading={dict.faq.heading}
              subheading={dict.faq.subheading}
              items={dict.faq.items}
            />
          </main>
          <Footer locale={locale} />
        </div>
      </Chrome>
    </>
  );
}
