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
import { ChipLinkRow, RowHead } from "./headers";
import { EmptyState, OfferCard } from "./cards";
import {
  ListingSkeleton, ListingHeader, Gallery, DetailBody, ReviewsSection,
  BookingPanel, HostCard, MobileBar, detailCrumbs, feedCrumbItems, type DatesControl,
} from "./ListingDetail";
import type { DateRange } from "./DateRangePicker";
import { useAvailability, type Availability } from "@/app/lib/availability";
import { useMarketToday } from "@/app/lib/use-market-today";
import { listingAppPath } from "@/app/lib/app-links";
import { rentalDays } from "@/app/lib/dates";
import { useListing, useListings, ListingNotFoundError, marketplaceErrorKind } from "@/app/lib/listings";
import { useCategories } from "@/app/lib/categories";
import { categoryIconFor, categoryNameFor } from "@/app/lib/category-style";
import { lastFeedUrl, listingLandingHref } from "@/app/lib/search";
import { listingDetailPath } from "@/app/lib/listing-url";
import { localePath } from "@/app/lib/i18n/config";
import { useI18n } from "./I18nProvider";
import { trackEvent } from "@/app/lib/analytics";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";

export function ListingScreen({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const online = useOnlineStatus();
  const [shared, setShared] = useState(false);
  const [shareFailed, setShareFailed] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { data: listing, isLoading, isError, error, refetch } = useListing(id, locale);
  const categories = useCategories(locale).data ?? [];
  useReloadOnReconnect({ online, isError, refetch });

  // Rental dates. The state is lifted here because BookingPanel renders twice (sticky
  // sidebar + mobile inline) and both must show the same range, and because the
  // reserve/contact handlers below need it to build the app deep link.
  //
  // Availability is fetched only once the user opens the picker: the detail page's
  // critical path keeps its current request count, and a below-the-fold, high-intent
  // interaction pays for its own data.
  const today = useMarketToday();
  const [range, setRange] = useState<DateRange | null>(null);
  const [datesArmed, setDatesArmed] = useState(false);
  const availabilityQuery = useAvailability(datesArmed ? id : undefined, today);
  // A transient failure (network/5xx, retries exhausted) lands in the same place as an
  // unreadable payload: we do not know. Never "everything is free".
  const availability: Availability | undefined = availabilityQuery.data
    ?? (availabilityQuery.isError ? { status: "unknown", reason: "fetch-failed" } : undefined);
  const dates: DatesControl = {
    today,
    range,
    onChange: setRange,
    availability,
    isLoading: availabilityQuery.isLoading,
    onOpen: () => setDatesArmed(true),
    onRetry: () => availabilityQuery.refetch(),
  };
  // Derived once for everything outside the booking panel that reacts to the
  // picked range — today that is the Terms section's discount-tier highlight.
  const selectedDays = range ? rentalDays(range.start, range.end) : null;

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
    const kind = marketplaceErrorKind(error);
    return shell(online
      ? <EmptyState illustration="error" tone="danger"
          title={kind === "timeout" ? dict.offline.timeoutTitle : dict.offline.serverTitle}
          subtitle={kind === "timeout" ? dict.offline.timeoutBody : dict.offline.serverBody}
          actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
      : <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body} actionLabel={dict.offline.retry} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />);
  }

  const category = categoryNameFor(categories, listing.categoryId) ?? listing.tags[0];
  const hasNoReviews = listing.ratingCount === 0;

  // Transactional actions are Locked — they open the app-redirect modal. Favoriting
  // only persists in the app, so we do NOT fill the heart here (a "saved" state the
  // web can't keep would be a false success signal); the modal is the feedback.
  // Every trigger carries the listing context so the modal can keep the user's
  // intent (item + price) visible across the install handoff.
  // Single source for the modal's item row: every trigger on this page — header,
  // booking panel, gallery lightbox, reviews empty state — passes this same object,
  // so the category label can never differ between two openings of one listing.
  const listingCtx = {
    title: listing.title,
    thumb: listing.images[0],
    priceLabel: `${listing.price} ${dict.detail.perDayAbbr}`,
    category,
    categoryId: listing.categoryId,
  };
  // Carries the chosen dates into the app — but only once the app is known to read
  // them (APP_READS_DEEPLINK_DATES, currently false). /go already preserves the query
  // on the target, so no other plumbing changes. Note the dates survive the handoff
  // only for visitors who allowed attribution: /go fails closed and drops the target
  // otherwise, which is the deliberate consent trade-off, not a bug.
  const appPath = listingAppPath(listing.id, range);
  const lockFav = () => openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody, listing: listingCtx, appPath });
  // Sharing is a real web action (not app-locked): use the native share sheet
  // where available, otherwise copy the URL and flash a transient "copied" state.
  const share = async () => {
    const url = window.location.href;
    setShareFailed(false);
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2400);
      }
    } catch (error) {
      // Dismissing the native share sheet is not a failure; blocked or unavailable
      // clipboard/share APIs need a visible recovery state.
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareFailed(true);
      }
    }
  };
  const reserve = () => {
    trackEvent("Renter Booking Intent", {
      placement: "listing",
      category: listing.categoryId ?? "unknown",
      // Whether people actually pick dates before handing off is the single number
      // that tells us if this calendar was worth building.
      hasDates: Boolean(range),
      ...(range ? { days: rentalDays(range.start, range.end) } : {}),
    });
    openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody, listing: listingCtx, appPath });
  };
  const contact = () => {
    trackEvent("Owner Contact Intent", { placement: "listing", category: listing.categoryId ?? "unknown" });
    openRedirect({ title: dict.bridge.contactTitle, body: dict.bridge.contactBody, listing: listingCtx, appPath });
  };
  const showReviews = () => openRedirect({ title: dict.bridge.reviewsTitle, body: dict.bridge.reviewsBody, listing: listingCtx, appPath });

  return shell(
    <>
      {/* Breadcrumb sits OUTSIDE .nk-fadecontent: it's persistent chrome shown
          during load too, so it must not re-animate when the body lands — only
          its leaf (category + title) extends past the static Home › Skelbimai prefix. */}
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
        items={detailCrumbs({ category, categoryId: listing.categoryId, title: listing.title, feedLabel: dict.feed.titleAll, locale })} />
      {/* fade in over the skeleton; the fixed mobile bar stays outside the wrapper */}
      <div className="nk-fadecontent">
        <ListingHeader listing={listing} shared={shared} shareFailed={shareFailed} onShare={share} onFav={lockFav} />
        <Gallery images={listing.images} redirectCtx={listingCtx} hasNoReviews={hasNoReviews} appPath={appPath} />

        {/* The sticky sidebar booking panel is hidden on tablet/phone (≤980px);
            surface the booking facts — and the owner trust card, otherwise ~8
            screens deep — inline under the gallery so mobile keeps the price
            breakdown, protection context and the human trust signal up top. The
            fixed MobileBar remains the persistent reserve CTA; the aside copy of
            both cards is hidden ≤980 so nothing renders twice. */}
        <div className="nk-booking-inline">
          <BookingPanel listing={listing} variant="facts" onReserve={reserve} dates={dates} appPath={appPath} />
          {listing.owner && (
            <div style={{ marginTop: "var(--nk-gap-md)" }}>
              <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />
            </div>
          )}
        </div>

        <div className="nk-detail-grid">
          <DetailBody listing={listing} selectedDays={selectedDays} />
          <aside className="nk-reserve">
            <div className="nk-reserve__booking">
              <BookingPanel listing={listing} onReserve={reserve} dates={dates} appPath={appPath} />
            </div>
            {listing.owner && <HostCard owner={listing.owner} rating={listing.rating} ratingCount={listing.ratingCount} onContact={contact} />}
          </aside>
        </div>

        {/* Reviews break out to full width beneath the two-column area (the narrow
            column left a dead region under the sidebar once reviews grow). */}
        <ReviewsSection listing={listing} redirectCtx={listingCtx} appPath={appPath} onShowReviews={showReviews} />

        {listing.categoryId && (
          <SimilarRail
            currentId={listing.id}
            categoryId={listing.categoryId}
            currentCity={listing.city}
            currentPriceCents={listing.priceCents}
            ownerId={listing.owner?.id}
          />
        )}
      </div>

      <MobileBar price={listing.price} appPath={appPath} hidden={footerInView} onReserve={reserve} />
    </>,
  );
}

/* ---------------- Similar-items cross-sell rail ----------------
   The detail page's highest-leverage re-engagement surface — queries the browse
   feed by the top-level category id (localized display names as free-text `q`
   return zero matches on the live API, which silently killed the rail), drops the
   current listing, shows up to 5 (the --rail modifier caps wide desktop at 4-up,
   so a 5th card starts a second row there; phones swipe all 5). A single sibling
   still renders — under a broader honest heading — so launch-size inventory isn't
   a dead end. */
const RAIL_MAX = 5;
function SimilarRail({
  currentId,
  categoryId,
  currentCity,
  currentPriceCents,
  ownerId,
}: {
  currentId: string;
  categoryId: string;
  currentCity?: string;
  currentPriceCents: number;
  ownerId?: string;
}) {
  const { locale, dict } = useI18n();
  const { data } = useListings(locale, { category: categoryId });
  const cats = useCategories(locale).data ?? [];
  const siblings = (data ?? []).filter((o) => o.id !== currentId);
  const ownerItems = ownerId ? siblings.filter((o) => o.ownerId === ownerId) : [];
  const similarPriceItems = currentPriceCents
    ? siblings.filter((o) => Math.abs(o.priceCents - currentPriceCents) / currentPriceCents <= 0.35)
    : [];
  const items = (ownerItems.length >= 2 ? ownerItems : similarPriceItems.length >= 2 ? similarPriceItems : siblings).slice(0, RAIL_MAX);
  if (items.length === 0) {
    return null;
  }
  const heading = items.length >= 2 ? dict.detail.similarHeading : dict.detail.moreItemsHeading;
  const categoryTitle = categoryNameFor(cats, categoryId);
  return (
    <section style={{ marginTop: 64 }} aria-label={heading}>
      <RowHead title={heading} marginBottom="var(--nk-gap-xl)" />
      <ChipLinkRow
        style={{ marginBottom: "var(--nk-gap-xl)" }}
        links={[
          { label: categoryTitle ?? dict.feed.categoryLabel, href: listingLandingHref({ locale, category: categoryId }) },
          ...(currentCity
            ? [{ label: categoryTitle ? `${categoryTitle} · ${currentCity}` : currentCity, href: listingLandingHref({ locale, category: categoryId, city: currentCity }) }]
            : []),
        ]}
      />
      <div className="nk-grid-4 nk-grid-4--rail">
        {items.map((o) => (
          <div key={o.id} className="nk-reveal" style={{ display: "grid" }}>
            <OfferCard title={o.title} city={o.city} subdivision={o.subdivision} price={o.price} unit={dict.common.perDay}
              rating={o.rating} ratingCount={o.ratingCount} hasDelivery={o.hasDelivery}
              photoCount={o.photoCount} deposit={o.deposit} owner={o.owner}
              img={o.img} category={o.category} categoryName={categoryNameFor(cats, o.category)} categoryIcon={categoryIconFor(cats, o.category)}
              href={localePath(locale, listingDetailPath({ id: o.id, title: o.title, city: o.city }))} />
          </div>
        ))}
      </div>
    </section>
  );
}
