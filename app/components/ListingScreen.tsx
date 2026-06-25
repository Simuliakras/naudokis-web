"use client";
// Listing detail PAGE (web-native redesign of the app's listing screen).
// Browsing is real (data from the backend); reserve / contact / favorite are
// locked to the app via the redirect modal. This file is the orchestrator —
// the presentational pieces live in ./ListingDetail.
import { useEffect, useRef, useState } from "react";
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
import { useListing } from "@/app/lib/listings";
import { lastFeedUrl } from "@/app/lib/search";
import { localePath } from "@/app/lib/i18n/config";
import { useI18n } from "./I18nProvider";

export function ListingScreen({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { data: listing, isLoading, isError, refetch } = useListing(id, locale);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || !("IntersectionObserver" in window)) {
      return;
    }
    const io = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const shell = (children: React.ReactNode) => (
    <Chrome>
      <div className="nk-page">
        {/* Return to the feed with the user's last filters intact (deep links fall back to the bare feed). */}
        <Nav onSearch={() => router.push(lastFeedUrl(locale) ?? localePath(locale, "/skelbimai"))} />
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 120px" }}>
          <div className="nk-detail">{children}</div>
        </main>
        <div ref={footerRef}>
          <Footer locale={locale} />
        </div>
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
    return shell(<EmptyState illustration="error" tone="danger" title={dict.detail.loadErrorTitle} subtitle={dict.detail.loadErrorBody} actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />);
  }

  const category = listing.tags[0];
  const isNew = listing.ratingCount === 0;

  // Transactional actions are Locked — they open the app-redirect modal.
  const lockFav = () => { setSaved(true); openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody }); };
  // Sharing is a real web action (not app-locked): use the native share sheet
  // where available, otherwise copy the URL and flash a transient "copied" state.
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2400);
      }
    } catch {
      // The user dismissed the share sheet (or clipboard was blocked) — keep state unchanged.
    }
  };
  const reserve = () => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody });
  const pickDates = () => openRedirect({ title: dict.bridge.datesTitle, body: dict.bridge.datesBody });
  const contact = () => openRedirect({ title: dict.bridge.contactTitle, body: dict.bridge.contactBody });

  return shell(
    <>
      {/* fade in over the skeleton; the fixed mobile bar stays outside the wrapper */}
      <div className="nk-fadecontent">
        <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
          items={detailCrumbs({ category, title: listing.title, categoriesLabel: dict.feed.crumbCategories, locale })} />

        <ListingHeader listing={listing} saved={saved} shared={shared} onShare={share} onFav={lockFav} />
        <Gallery images={listing.images} title={listing.title} isNew={isNew} />

        <div className="nk-detail-grid">
          <DetailBody listing={listing} onContact={contact} />
          <aside className="nk-reserve">
            <BookingPanel listing={listing} onReserve={reserve} onPickDates={pickDates} />
            <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />
          </aside>
        </div>
      </div>

      <MobileBar price={listing.price} hidden={footerInView} onReserve={reserve} />
    </>,
  );
}
