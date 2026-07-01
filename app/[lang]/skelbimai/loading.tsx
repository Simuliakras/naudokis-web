import { OfferCardSkeleton } from "@/app/components/cards";

// Route-level Suspense fallback. Mirrors the real FeedScreen frame (nav offset,
// breadcrumb + heading + filter-bar placeholders, then the grid) so the layout
// doesn't jump when the client screen hydrates.
export default function Loading() {
  return (
    <div className="nk-page">
      {/* nav-height spacer so the grid starts where the sticky nav leaves it */}
      <div style={{ height: "var(--nk-nav-h)" }} aria-hidden="true" />
      <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px" }} aria-busy="true">
        <div className="nk-skel" style={{ width: 220, height: 18, borderRadius: 8, marginBottom: 20 }} />
        <div className="nk-skel" style={{ width: "min(60%, 360px)", height: 42, borderRadius: 12, marginBottom: 12 }} />
        <div className="nk-skel" style={{ width: "min(82%, 460px)", height: 20, borderRadius: 8, marginBottom: 32 }} />
        {/* filter-bar-height placeholder (two control rows) */}
        <div className="nk-skel" style={{ width: "100%", height: 116, borderRadius: 16, marginBottom: 36 }} />
        <div className="nk-grid-feed">
          {Array.from({ length: 8 }).map((_, i) => <OfferCardSkeleton key={i} />)}
        </div>
      </main>
    </div>
  );
}
