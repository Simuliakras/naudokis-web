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
import { EmptyState, OfferCard } from "./cards";
import {
  ListingSkeleton, ListingHeader, Gallery, DetailBody, ReviewsSection,
  BookingPanel, HostCard, MobileBar, detailCrumbs, feedCrumbItems,
} from "./ListingDetail";
import { useListing, useListings, ListingNotFoundError } from "@/app/lib/listings";
import { useCategories } from "@/app/lib/categories";
import { categoryIconFor } from "@/app/lib/category-style";
import { lastFeedUrl } from "@/app/lib/search";
import { localePath } from "@/app/lib/i18n/config";
import { useI18n } from "./I18nProvider";

export function ListingScreen({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [shared, setShared] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { data: listing, isLoading, isError, error, refetch } = useListing(id, locale);

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
          {/* Persistent live region (mounted before its content changes — a live
              region born WITH content announces nothing on most SR/browser pairs). */}
          <span role="status" className="nk-sr-only">{isLoading ? dict.common.loading : ""}</span>
          <div className="nk-detail">{children}</div>
        </main>
        <div ref={footerRef}>
          <Footer locale={locale} />
        </div>
      </div>
    </Chrome>
  );

  if (isLoading) {
    // Known-before-fetch chrome (breadcrumb) renders immediately; only the
    // listing body below shimmers. The shell's status region announces loading.
    return shell(
      <>
        <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
          items={feedCrumbItems({ feedLabel: dict.feed.titleAll, locale })} />
        <ListingSkeleton />
      </>,
    );
  }
  // A gone/deleted listing (client soft-404: an SPA navigation or a background
  // refetch that 404s). Server-side deletions already hard-404 via notFound() in
  // page.tsx; this covers the client-only paths, where "browse others" — not a
  // retry that can never succeed — is the right recovery.
  if (error instanceof ListingNotFoundError) {
    return shell(
      <EmptyState
        illustration="notFound"
        title={dict.detail.goneTitle}
        subtitle={dict.detail.goneBody}
        actionLabel={dict.detail.backToListings}
        actionPrimary
        actionIcon="ArrowRight"
        onAction={() => router.push(lastFeedUrl(locale) ?? localePath(locale, "/skelbimai"))}
      />,
    );
  }
  if (isError || !listing) {
    return shell(<EmptyState illustration="error" tone="danger" title={dict.detail.loadErrorTitle} subtitle={dict.detail.loadErrorBody} actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />);
  }

  const category = listing.tags[0];
  const isNew = listing.ratingCount === 0;

  // Transactional actions are Locked — they open the app-redirect modal. Favoriting
  // only persists in the app, so we do NOT fill the heart here (a "saved" state the
  // web can't keep would be a false success signal); the modal is the feedback.
  // Every trigger carries the listing context so the modal can keep the user's
  // intent (item + price) visible across the install handoff.
  const listingCtx = { title: listing.title, thumb: listing.images[0], priceLabel: `${listing.price} ${dict.detail.perDay}` };
  const lockFav = () => openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody, listing: listingCtx });
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
  const reserve = () => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody, listing: listingCtx });
  const contact = () => openRedirect({ title: dict.bridge.contactTitle, body: dict.bridge.contactBody, listing: listingCtx });
  const showReviews = () => openRedirect({ title: dict.bridge.reviewsTitle, body: dict.bridge.reviewsBody, listing: listingCtx });

  return shell(
    <>
      {/* Breadcrumb sits OUTSIDE .nk-fadecontent: it's persistent chrome shown
          during load too, so it must not re-animate when the body lands — only
          its leaf (category + title) extends past the static Home › Skelbimai prefix. */}
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
        items={detailCrumbs({ category, title: listing.title, feedLabel: dict.feed.titleAll, locale })} />
      {/* fade in over the skeleton; the fixed mobile bar stays outside the wrapper */}
      <div className="nk-fadecontent">
        <ListingHeader listing={listing} shared={shared} onShare={share} onFav={lockFav} />
        <Gallery images={listing.images} title={listing.title} isNew={isNew} />

        {/* The sticky sidebar booking panel is hidden on tablet/phone (≤980px);
            surface the booking facts — and the owner trust card, otherwise ~8
            screens deep — inline under the gallery so mobile keeps the price
            breakdown, protection context and the human trust signal up top. The
            fixed MobileBar remains the persistent reserve CTA; the aside copy of
            both cards is hidden ≤980 so nothing renders twice. */}
        <div className="nk-booking-inline">
          <BookingPanel listing={listing} variant="facts" onReserve={reserve} />
          {listing.owner && (
            <div style={{ marginTop: "var(--nk-gap-md)" }}>
              <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />
            </div>
          )}
        </div>

        <div className="nk-detail-grid">
          <DetailBody listing={listing} />
          <aside className="nk-reserve">
            <div className="nk-reserve__booking">
              <BookingPanel listing={listing} onReserve={reserve} />
            </div>
            {listing.owner && <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />}
          </aside>
        </div>

        {/* Reviews break out to full width beneath the two-column area (the narrow
            column left a dead region under the sidebar once reviews grow). */}
        <ReviewsSection listing={listing} onShowReviews={showReviews} />

        {listing.categoryId && <SimilarRail currentId={listing.id} categoryId={listing.categoryId} />}
      </div>

      <MobileBar price={listing.price} hidden={footerInView} onReserve={reserve} />
    </>,
  );
}

/* ---------------- Similar-items cross-sell rail ----------------
   The detail page's highest-leverage re-engagement surface — queries the browse
   feed by the top-level category id (localized display names as free-text `q`
   return zero matches on the live API, which silently killed the rail), drops the
   current listing, shows up to 4. A single sibling still renders — under a broader
   honest heading — so launch-size inventory isn't a dead end. */
function SimilarRail({ currentId, categoryId }: { currentId: string; categoryId: string }) {
  const { locale, dict } = useI18n();
  const { data } = useListings(locale, { category: categoryId });
  const cats = useCategories(locale).data ?? [];
  const items = (data ?? []).filter((o) => o.id !== currentId).slice(0, 4);
  if (items.length === 0) {
    return null;
  }
  const heading = items.length >= 2 ? dict.detail.similarHeading : dict.detail.moreItemsHeading;
  return (
    <section style={{ marginTop: 64 }} aria-label={heading}>
      <h2 style={{ margin: "0 0 24px", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text)" }}>{heading}</h2>
      <div className="nk-grid-4">
        {items.map((o) => (
          <div key={o.id} className="nk-reveal" style={{ display: "grid" }}>
            <OfferCard title={o.title} city={o.city} subdivision={o.subdivision} price={o.price} unit={dict.common.perDay}
              rating={o.rating} ratingCount={o.ratingCount} hasDelivery={o.hasDelivery}
              img={o.img} category={o.category} categoryIcon={categoryIconFor(cats, o.category)}
              href={localePath(locale, `/skelbimai/${o.id}`)} />
          </div>
        ))}
      </div>
    </section>
  );
}
