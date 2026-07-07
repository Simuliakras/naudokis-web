"use client";
// Route-level Suspense fallback for the listing detail page. The page server-
// prefetches the listing into a HydrationBoundary, so this fallback — not the
// in-component ListingScreen skeleton — is what shows during navigation. It
// mirrors ListingScreen's shell (real Nav + breadcrumb + Footer) so the nav,
// footer and Home › Skelbimai crumb stay on screen and the swap into the
// hydrated page is seamless; only the listing body shimmers. Client component so
// it can read the locale from I18nProvider (loading.tsx nests inside the layout).
import { Nav } from "@/app/components/sections";
import { Footer } from "@/app/components/sections-home";
import { Breadcrumb } from "@/app/components/ui";
import { ListingSkeleton, feedCrumbItems } from "@/app/components/ListingDetail";
import { useI18n } from "@/app/components/I18nProvider";

export default function Loading() {
  const { locale, dict } = useI18n();
  return (
    <div className="nk-page">
      <Nav />
      <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 120px" }} aria-busy="true">
        <span role="status" className="nk-sr-only">{dict.common.loading}</span>
        <div className="nk-detail">
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
            items={feedCrumbItems({ feedLabel: dict.feed.titleAll, locale })} />
          <ListingSkeleton />
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
