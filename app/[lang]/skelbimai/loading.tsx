import { OfferCardSkeleton } from "@/app/components/cards";

export default function Loading() {
  return (
    <div className="nk-page">
      <main className="nk-container" style={{ paddingBlock: "120px 40px" }}>
        <div className="nk-grid-feed">
          {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={i} />)}
        </div>
      </main>
    </div>
  );
}
