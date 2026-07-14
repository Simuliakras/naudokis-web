"use client";
// Route-level loading UI for the catalogue surfaces (feed, landings, listing detail).
//
// A client component on purpose: loading.tsx receives no route params, but it renders
// inside the layout's I18nProvider, so useI18nOptional() resolves the real locale
// during SSR. That is what lets the copy come from the dictionary like everywhere
// else, instead of shipping both languages and picking one with a :lang() CSS switch.
//
// It reuses the same head and card skeletons the real screens use, so the transition
// loading → page keeps the H1, the grid and the card heights exactly where they were.
import { useI18nOptional } from "./I18nProvider";
import { PageHead } from "./headers";
import { OfferCardSkeleton } from "./cards";
import { ListingSkeleton } from "./ListingDetail";

// Roughly a first viewport of the feed grid — enough to fill the fold at any column
// count without paying to render a full page of cards nobody will see.
const FEED_SKELETON_CARDS = 8;

export function CatalogueLoading({ detail = false }: { detail?: boolean }) {
  const { dict } = useI18nOptional();
  const t = dict.feed;

  return (
    <main id="nk-main" className="nk-container" aria-busy="true" style={{ paddingBlock: "var(--nk-page-top) 56px" }}>
      <span className="nk-sr-only" role="status">{dict.common.loading}</span>
      {detail ? (
        <ListingSkeleton />
      ) : (
        <>
          {/* The head is known before the fetch, so render it for real — same
              PageHead the feed itself uses, so nothing shifts when data lands. */}
          <PageHead eyebrow={t.eyebrow} title={t.titleAll} subtitle={t.subtitleAll} maxWidth="65ch" />
          <span className="nk-skel" style={{ display: "block", height: 58, borderRadius: 14, marginBottom: "var(--nk-gap-lg)" }} />
          <div className="nk-grid-feed" aria-hidden="true">
            {Array.from({ length: FEED_SKELETON_CARDS }, (_, index) => <OfferCardSkeleton key={index} />)}
          </div>
        </>
      )}
    </main>
  );
}
