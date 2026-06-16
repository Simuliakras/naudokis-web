"use client";
// Listing detail PAGE (web-native redesign of the app's listing screen).
// Browsing is real (data from the backend); reserve / contact / favorite are
// locked to the app via the redirect modal. This file is the orchestrator —
// the presentational pieces live in ./ListingDetail.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Breadcrumb, openRedirect } from "./ui";
import { EmptyState } from "./cards";
import {
  ListingSkeleton, ListingHeader, Gallery, DetailBody,
  BookingPanel, HostCard, MobileBar, detailCrumbs,
} from "./ListingDetail";
import { useListing, formatPrice } from "@/app/lib/listings";
import { lastFeedUrl } from "@/app/lib/search";
import { MOCK_BOOKING, SAMPLE_RENTAL_DAYS } from "@/app/lib/mock";
import { useI18n } from "./I18nProvider";

export function ListingScreen({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const t = dict.detail;
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { data: listing, isLoading, isError, refetch } = useListing(id, locale);

  const shell = (children: React.ReactNode) => (
    <Chrome banner={false}>
      <div className="nk-page">
        {/* Return to the feed with the user's last filters intact (deep links fall back to the bare feed). */}
        <Nav onSearch={() => router.push(lastFeedUrl(locale) ?? "/skelbimai")} />
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 120px" }}>
          <div className="nk-detail">{children}</div>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );

  if (isLoading) {
    return shell(
      <div role="status" aria-live="polite">
        <span className="nk-sr-only">{dict.common.loading}</span>
        <ListingSkeleton />
      </div>,
    );
  }
  if (isError || !listing) {
    return shell(<EmptyState illustration="error" tone="danger" title={t.loadErrorTitle} subtitle={t.loadErrorBody} actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />);
  }

  const category = listing.tags[0];
  const isNew = listing.ratingCount === 0;
  const deposit = formatPrice(MOCK_BOOKING.depositCents, locale);
  const subtotal = formatPrice(listing.priceCents * SAMPLE_RENTAL_DAYS, locale);
  const total = formatPrice(listing.priceCents * SAMPLE_RENTAL_DAYS + MOCK_BOOKING.depositCents, locale);

  // Transactional actions are Locked — they open the app-redirect modal.
  const lockFav = () => { setSaved(true); openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody }); };
  const lockShare = () => openRedirect({ title: dict.bridge.shareTitle, body: dict.bridge.shareBody });
  const reserve = () => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody });
  const pickDates = () => openRedirect({ title: dict.bridge.datesTitle, body: dict.bridge.datesBody });
  const contact = () => openRedirect({ title: dict.bridge.contactTitle, body: dict.bridge.contactBody });

  return shell(
    <>
      {/* fade in over the skeleton; the fixed mobile bar stays outside the wrapper */}
      <div className="nk-fadecontent">
        <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
          items={detailCrumbs({ category, title: listing.title, categoriesLabel: dict.feed.crumbCategories })} />

        <ListingHeader listing={listing} saved={saved} onShare={lockShare} onFav={lockFav} />
        <Gallery images={listing.images} title={listing.title} isNew={isNew} />

        <div className="nk-detail-grid">
          <DetailBody listing={listing} deposit={deposit} onContact={contact} />
          <aside className="nk-reserve">
            <BookingPanel listing={listing} deposit={deposit} days={SAMPLE_RENTAL_DAYS} subtotal={subtotal} total={total} onReserve={reserve} onPickDates={pickDates} />
            <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />
          </aside>
        </div>
      </div>

      <MobileBar price={listing.price} deposit={deposit} onReserve={reserve} />
    </>,
  );
}
