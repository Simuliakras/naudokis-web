"use client";
// Naudokis UI kit — listing-detail pieces.
// Presentational building blocks + self-contained sections for the listing
// detail PAGE (see ListingScreen.tsx, which orchestrates them). Layout mirrors
// the design bundle's "2026 rigorous redesign" (listing.jsx): premium bento
// gallery, sticky in-page sub-nav, booking panel, trust-rich host card.
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon, IconName, Pill, openRedirect } from "./ui";
import { RowHead } from "./headers";
import { SectionEmpty } from "./cards";
import { formatLocation } from "@/app/lib/listings";
import type { ListingDetail, ListingDelivery, ListingOwner, ListingReview, RatingBucket } from "@/app/lib/listings";
import { RichText } from "@/app/lib/rich-text";
import { listingLandingHref } from "@/app/lib/search";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { prefersReducedMotion } from "@/app/lib/motion";
import { GOOGLE_MAPS_API_KEY } from "@/app/lib/api";
import { goHref } from "@/app/lib/attribution";
import { useI18n } from "./I18nProvider";
import { trackEvent } from "@/app/lib/analytics";

/* ---------------- Shared primitives ---------------- */
function Section({ id, title, sub, first, children }: {
  id: string; title: string; sub?: string; first?: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} className="nk-sec" style={{ marginTop: first ? 0 : 32, paddingTop: first ? 0 : 32 }}>
      <RowHead title={title} sub={sub} marginBottom="var(--nk-gap-xl)" />
      {children}
    </section>
  );
}

// Compact icon "fact card" used by the rental-terms grid.
function FactCard({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  return (
    <div className="nk-fact" style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
      <span className="nk-fact__disk" style={{ width: 46, height: 46, borderRadius: 13, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} stroke={2} color="var(--nk-purple-hover)" />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", minWidth: 0 }}>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{sub}</span>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{title}</span>
      </span>
    </div>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="Star" size={size} color="var(--nk-yellow)" fill={i < Math.round(value) ? "var(--nk-yellow)" : "none"} />
      ))}
    </span>
  );
}

function GalleryTile({ src, alt, big, fullWidth, onOpen, children }: {
  src?: string; alt?: string; big?: boolean; fullWidth?: boolean; onOpen?: () => void; children?: React.ReactNode;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = Boolean(src && failedSrc !== src);
  // The big tile is the listing LCP. `preload` emits the <link rel=preload
  // imagesrcset> that starts the fetch during head parsing; loading="eager" +
  // fetchPriority alone only help once the element itself has been discovered.
  // One quality for every tile: the hero must not be compressed HARDER than the
  // thumbnails, and a single value keeps the optimizer cache shared.
  const inner = (
    <>
      {src && failedSrc !== src && (
        <Image src={src} alt={alt ?? ""} fill
          preload={big}
          quality={75}
          sizes={fullWidth
            ? "(max-width: 980px) 100vw, min(calc(100vw - 164px), 1340px)"
            : big
            // the detail column caps at 1340px — a bare vw kept scaling the
            // request past it (~1.5-3x pixels at wide/ultrawide)
            ? "(max-width: 980px) 100vw, min(60vw, 800px)"
            : "(max-width: 980px) 50vw, min(20vw, 268px)"}
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
            setFailedSrc(src);
          }}
          style={{ objectFit: "cover" }} />
      )}
      {!showPhoto && <Icon name={src ? "ImageOff" : "Image"} size={big ? 64 : 34} stroke={1.4} className="nk-imgicon" />}
      {(showPhoto || !src) && children}
    </>
  );
  // A tile with a photo opens the lightbox; the empty-state placeholder stays a plain div.
  if (onOpen && showPhoto) {
    return (
      <button type="button" onClick={onOpen} className="nk-imgph nk-gtile nk-gtile--btn" style={{ borderRadius: "var(--nk-r-tile)", position: "relative" }}>
        {inner}
      </button>
    );
  }
  return (
    <div className="nk-imgph nk-gtile" style={{ borderRadius: "var(--nk-r-tile)", position: "relative" }}>
      {inner}
    </div>
  );
}

/* ---------------- Loading skeleton ----------------
   Mirrors the real layout (breadcrumb → header → bento gallery → focus column +
   sticky reserve/host cards) so the page doesn't reflow when data lands. */
function Skel({ w = "100%", h = 14, r = 8, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <span className="nk-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />;
}
function SkelLines({ rows = 3, gap = 12, last = "60%" }: { rows?: number; gap?: number; last?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: rows }).map((_, i) => <Skel key={i} h={13} w={i === rows - 1 ? last : "100%"} />)}
    </div>
  );
}
// Mirrors the real <Section> chrome (32px-above / 32px-below gutter on every
// section but the first, 25px-ish title with a 24px gap to the content) so the
// focus column shares its exact rhythm.
function SkelSection({ first, titleW = 200, children }: { first?: boolean; titleW?: number | string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: first ? 0 : 32, paddingTop: first ? 0 : 32 }}>
      <Skel w={titleW} h={26} r={9} style={{ marginBottom: 24 }} />
      {children}
    </div>
  );
}
export function ListingSkeleton() {
  const card: React.CSSProperties = { borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" };
  // Booking card skeleton — rendered in the sticky sidebar (with the reserve
  // button) and inline on mobile (facts-only, no button), mirroring the real
  // BookingPanel in order and height — price header → confirmInApp reassurance
  // line → reserve CTA — so neither breakpoint reflows when the content lands.
  const bookingSkel = (withButton: boolean) => (
    <div style={{ ...card, background: "var(--nk-surface)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Skel w={130} h={32} r={9} /><Skel w={70} h={16} /></div>
      {/* the muted confirmInApp line — one sentence that wraps to ~2 lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <Skel w="100%" h={13} r={7} />
        <Skel w="55%" h={13} r={7} />
      </div>
      {withButton && <Skel h={52} r={25} />}
    </div>
  );
  return (
    // Content-only: the breadcrumb is real, known-before-fetch chrome — the
    // caller (ListingScreen / the route loading.tsx) renders it above this.
    <div aria-hidden="true" style={{ pointerEvents: "none" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minWidth: 240 }}>
          <Skel w="62%" h={44} r={12} />
          <div style={{ display: "flex", gap: 16 }}><Skel w={120} h={16} /><Skel w={150} h={16} /><Skel w={170} h={16} /></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}><Skel w={110} h={42} r={13} /><Skel w={110} h={42} r={13} /></div>
      </div>
      {/* gallery — mirrors the bento exactly */}
      <div className="nk-bento">
        <Skel r={16} h="100%" />
        <Skel h="100%" r={16} /><Skel h="100%" r={16} /><Skel h="100%" r={16} /><Skel h="100%" r={16} />
      </div>
      {/* mobile inline booking facts (mirrors .nk-booking-inline in the real screen) */}
      <div className="nk-booking-inline">{bookingSkel(false)}</div>
      {/* focus column + reserve sidebar */}
      <div className="nk-detail-grid">
        {/* DetailBody: description → specs → handover → terms → reviews (gap:0, spaced by SkelSection) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
          {/* description */}
          <SkelSection first titleW={170}>
            <div style={{ maxWidth: 720 }}>
              <SkelLines rows={4} last="45%" />
            </div>
          </SkelSection>
          {/* specs */}
          <SkelSection titleW={210}>
            <div className="nk-spec-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "15px 0", borderBottom: "1px solid var(--nk-divider)" }}><Skel w={120} h={14} /><Skel w={70} h={14} /></div>
              ))}
            </div>
          </SkelSection>
          {/* handover — map + two info rows */}
          <SkelSection titleW={230}>
            <div className="nk-tworow" style={{ alignItems: "stretch", gap: 24 }}>
              <Skel h={200} r={16} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <Skel w="var(--nk-size-icon-sm)" h="var(--nk-size-icon-sm)" r={12} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}><Skel w="55%" h={13} /><Skel w="80%" h={16} /></div>
                  </div>
                ))}
              </div>
            </div>
          </SkelSection>
          {/* terms — 4 fact cards */}
          <SkelSection titleW={180}>
            <div className="nk-hl-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
                  <Skel w={46} h={46} r={13} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Skel w="70%" h={15} /><Skel w="90%" h={13} /></div>
                </div>
              ))}
            </div>
          </SkelSection>
          {/* reviews — breakdown card + 2 review cards + show-all */}
          <SkelSection titleW={200}>
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <div className="nk-ratebreak" style={{ padding: "var(--nk-card-pad)", borderRadius: "var(--nk-r-md)", background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)", display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingRight: 44, borderRight: "1px solid var(--nk-divider)" }}>
                  <Skel w={72} h={52} r={10} /><Skel w={96} h={16} /><Skel w={70} h={13} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><Skel w={30} h={14} /><Skel h={7} r={4} /><Skel w={34} h={13} /></div>
                  ))}
                </div>
              </div>
              <div className="nk-rev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--nk-gap-md)" }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <Skel w={42} h={42} r={21} />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Skel w="60%" h={15} /><Skel w="45%" h={13} /></div>
                    </div>
                    <SkelLines rows={3} last="70%" />
                  </div>
                ))}
              </div>
              <Skel w={170} h={44} r={13} />
            </div>
          </SkelSection>
        </div>
        {/* reserve sidebar: booking panel + host card */}
        <div className="nk-reserve">
          <div className="nk-reserve__booking">{bookingSkel(true)}</div>
          <div style={{ ...card, padding: "var(--nk-card-pad-sm)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)", boxShadow: "var(--nk-edge-top)" }}>
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}><Skel w={58} h={58} r={29} /><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}><Skel w="60%" h={18} /><Skel w={120} h={24} r={12} /></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--nk-hairline)", borderRadius: 14, overflow: "hidden" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ background: "var(--nk-surface)", padding: "13px 14px", display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}><Skel w={44} h={17} /><Skel w={64} h={12} /></div>
              ))}
            </div>
            <Skel h={48} r={25} />
            <Skel h={14} r={8} w="80%" style={{ alignSelf: "center" }} />
          </div>
        </div>
      </div>
      {/* mobile reserve bar (shown <=980px, where the sidebar is hidden) */}
      <div className="nk-mbar">
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}><Skel w={120} h={22} /><Skel w={90} h={13} /></div>
        <Skel w={150} h={48} r={25} />
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */
const headerBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 16px", minHeight: "var(--nk-tap)", borderRadius: 13,
  fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)",
  background: "var(--nk-input-bg)", border: "1px solid var(--nk-border)", whiteSpace: "nowrap",
};
const metaItem: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", whiteSpace: "nowrap" };
const Dot = () => <span style={{ width: 3, height: 3, borderRadius: 2, background: "var(--nk-text-muted)", flex: "none" }} />;

export function ListingHeader({ listing, shared, shareFailed, onShare, onFav }: {
  listing: ListingDetail; shared: boolean; shareFailed: boolean; onShare: () => void; onFav: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--nk-gap-xl)", flexWrap: "wrap", marginBottom: "var(--nk-gap-xl)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 4vw, 44px)", lineHeight: 1.04, letterSpacing: 0, color: "var(--nk-text)", textWrap: "balance", overflowWrap: "anywhere", hyphens: "auto" }}>{listing.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", flexWrap: "wrap" }}>
          {listing.rating && (
            <>
              <span style={metaItem}>
                <Icon name="Star" size={16} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
                <b style={{ fontWeight: 700, color: "var(--nk-text)" }}>{listing.rating}</b>
                <a href="#atsiliepimai" style={{ color: "var(--nk-text-muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>{dict.common.reviewCount(listing.ratingCount)}</a>
              </span>
              <Dot />
            </>
          )}
          {listing.city && (
            <>
              <span style={metaItem}><Icon name="MapPin" size={16} color="var(--nk-text-muted)" stroke={2} /> {formatLocation(listing.city, listing.subdivision)}</span>
              {listing.owner?.verified && <Dot />}
            </>
          )}
          {listing.owner?.verified && (
            <span style={metaItem}><Icon name="BadgeCheck" size={16} color="var(--nk-green)" stroke={2} /> <span style={{ color: "var(--nk-green)", fontWeight: 600, fontFamily: "var(--nk-font-display)" }}>{t.verifiedOwnerPill}</span></span>
          )}
        </div>
      </div>
      {/* flex sizing lives in CSS: an inline flex:none here silently overrode the
          ≤430px full-width actions-row rule for months */}
      <div className="nk-lhead__actions" style={{ display: "flex", gap: "var(--nk-gap-sm)" }}>
        <button className="nk-lfield" style={headerBtn} onClick={onShare}><Icon name="Share2" size={17} stroke={2} color="var(--nk-text)" /> {shared ? t.shareCopied : t.share}</button>
        <button className="nk-lfield" style={headerBtn} onClick={onFav} title={dict.bridge.opensAppHint}><Icon name="Heart" size={17} stroke={2} color="var(--nk-text)" fill="none" /> {t.save}</button>
      </div>
      <span role="status" style={{ width: "100%", fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-danger)" }}>
        {shareFailed ? t.shareFailed : ""}
      </span>
    </div>
  );
}

/* ---------------- Bento gallery ----------------
   Viewing photos needs no account, so the bento opens a real lightbox (prev/next,
   keyboard, focus-trap). Only the app-bound actions stay locked — the lightbox
   footer keeps the "reserve in the app" CTA. */
export function Gallery({ images, title, hasNoReviews, appPath }: { images: string[]; title: string; hasNoReviews: boolean; appPath: string }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [lightbox, setLightbox] = useState<number | null>(null);
  const count = images.length;
  const shown = images.slice(0, 5); // render only real tiles — never empty placeholders
  const extra = count > 5 ? count - 5 : 0;
  const alt = (i: number) => (i === 0 ? title : `${title} — ${i + 1}`);
  const open = (i: number) => setLightbox(i);

  // A factual review-state chip; zero reviews must never be presented as proof
  // that the listing itself is new.
  const reviewPill = hasNoReviews ? (
    <span className="nk-chip-glass" style={{ position: "absolute", top: 16, left: 16, zIndex: 2, color: "var(--nk-yellow)" }}>
      <Icon name="Sparkles" size={14} color="var(--nk-yellow)" stroke={2} /> {t.newListingPill}
    </span>
  ) : null;

  // No photos on the wire → a single graceful hero placeholder with a caption,
  // never a grid of grey boxes. (data-count="0" makes the bento a single tile.)
  if (count === 0) {
    return (
      <div className="nk-bento" data-count="0">
        <GalleryTile big>
          {reviewPill}
          <span style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", pointerEvents: "none", fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{t.noPhotos}</span>
        </GalleryTile>
      </div>
    );
  }

  return (
    <>
      {/* data-count drives count-aware grids (1..5); ≥5 gets the "+N more" overlay. */}
      <div className="nk-bento" data-count={Math.min(count, 5)}>
        {shown.map((src, i) => (
          <GalleryTile key={i} src={src} alt={alt(i)} big={i === 0} fullWidth={count === 1} onOpen={() => open(i)}>
            {i === 0 && (
              <>
          {reviewPill}
                <span className="nk-gtile__hint" style={{ position: "absolute", inset: 0, borderRadius: "var(--nk-r-tile)", background: "rgba(20,22,23,.18)" }} />
                {/* Persistent lightbox affordance on the hero for small photo sets —
                    counts ≥5 keep their "+N" chip on the last tile instead. */}
                {count > 1 && count < 5 && (
                  <span className="nk-gtile__more">
                    <Icon name="LayoutGrid" size={16} color="var(--nk-text)" stroke={2} /> {t.galleryAll(count)}
                  </span>
                )}
                {count === 1 && (
                  <span className="nk-gtile__more" role="img" aria-label={t.galleryExpand}>
                    <Icon name="Expand" size={16} color="var(--nk-text)" stroke={2} />
                  </span>
                )}
              </>
            )}
            {i === shown.length - 1 && count >= 5 && (
              <span className="nk-gtile__more">
                <Icon name="LayoutGrid" size={16} color="var(--nk-text)" stroke={2} /> {extra > 0 ? t.galleryMore(extra) : t.galleryAll(count)}
              </span>
            )}
          </GalleryTile>
        ))}
      </div>
      {lightbox !== null && (
        <GalleryLightbox images={images} title={title} appPath={appPath} start={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

/* ---------------- Gallery lightbox ----------------
   Full-screen photo viewer: prev/next, Esc/arrow keys, focus trap, scroll lock. */

// Shared by the main photo and the neighbour warmer so the optimizer URL (and
// thus the cache key) is byte-identical. The panel caps at 1180px and the photo
// is letterboxed by object-fit:contain, so a bare 100vw would over-fetch on wide
// screens; declaring the real ~1024px slot lands DPR1 on the 1080 candidate and
// DPR2 exactly on 2048 with no visible softening.
const LB_SIZES = "(min-width: 1200px) 1024px, 100vw";

// Main lightbox photo with a load/error state tied to the ACTUAL image load
// (mounted with key={index} so it resets per navigation): a spinner shows until
// onLoad flips the reveal, and a failed load swaps to a localized fallback rather
// than a broken-image icon. fetchPriority high so the in-view photo wins over the
// low-priority neighbour warmers.
// Byte-identical to the big bento tile's `sizes`, so the browser reuses the
// already-cached grid rendition as an instant low-res underlay while the
// full-res LB_SIZES photo loads (Airbnb-style paint-what-you-had-then-swap).
const LB_UNDERLAY_SIZES = "(max-width: 980px) 100vw, 60vw";

function LightboxImage({ src, alt, errorLabel }: { src: string; alt: string; errorLabel: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);
  // A cached image can already be `complete` before onLoad attaches; flip on mount
  // so the spinner never sticks over an already-loaded photo.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, []);
  return (
    <div className="nk-lightbox__img">
      {status !== "loaded" && (
        <span className="nk-imgph nk-lightbox__ph" aria-hidden={status !== "error"}>
          {status === "error" ? (
            <span className="nk-lightbox__err">
              <Icon name="ImageOff" size={30} stroke={1.5} className="nk-imgicon" />
              <span>{errorLabel}</span>
            </span>
          ) : (
            <Icon name="LoaderCircle" size={30} stroke={2} className="nk-imgicon nk-lightbox__spin" />
          )}
        </span>
      )}
      {/* Cached-rendition underlay: paints instantly on a cache hit and covers the
          spinner; while it also loads, it's transparent and the spinner shows through. */}
      {status === "loading" && (
        <Image src={src} alt="" aria-hidden fill sizes={LB_UNDERLAY_SIZES} loading="eager" fetchPriority="low"
          style={{ objectFit: "contain" }} />
      )}
      {status !== "error" && (
        <Image ref={imgRef} src={src} alt={alt} fill sizes={LB_SIZES} loading="eager" fetchPriority="high"
          className="nk-lightbox__photo" data-loaded={status === "loaded"}
          onLoad={() => setStatus("loaded")} onError={() => setStatus("error")}
          style={{ objectFit: "contain" }} />
      )}
    </div>
  );
}

function GalleryLightbox({ images, title, appPath, start, onClose }: {
  images: string[]; title: string; appPath: string; start: number; onClose: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [i, setI] = useState(start);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null); // restored when the lightbox closes
  const touchStartX = useRef<number | null>(null); // horizontal-swipe origin (touch paging)
  const thumbsRef = useRef<HTMLDivElement>(null); // scrolls the active thumb into view
  const many = images.length > 1;
  const prev = useCallback(() => setI((v) => (v - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setI((v) => (v + 1) % images.length), [images.length]);
  // Warm only the two neighbours (wrap-around, deduped) so prev/next is a cache
  // hit; bounded to 2 fetches regardless of photo count.
  const warm = many
    ? [...new Set([(i - 1 + images.length) % images.length, (i + 1) % images.length])].filter((n) => n !== i)
    : [];

  // Mount-only: lock body scroll, move focus into the dialog, and restore focus
  // to the opener on close. Kept separate from the keydown effect so a parent
  // re-render (which changes the onClose identity) never re-steals focus.
  useEffect(() => {
    lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      lastFocused.current?.focus();
    };
  }, []);

  // Esc closes, arrows page (when multiple). Tab-trapping is handled by useFocusTrap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && many) {
        e.preventDefault();
        prev();
        return;
      }
      if (e.key === "ArrowRight" && many) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, many]);

  // Keep the active thumbnail visible in the overflow-x strip as the index changes
  // (arrow keys, nav buttons, swipe). block:"nearest" avoids nudging the scroll-locked page.
  useEffect(() => {
    if (!many) {
      return;
    }
    const active = thumbsRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    active?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [i, many]);

  useFocusTrap(panelRef, true);

  return (
    <div className="nk-lightbox" role="dialog" aria-modal="true" aria-label={t.galleryViewLabel} onClick={onClose}>
      <div ref={panelRef} className="nk-lightbox__panel" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="nk-lightbox__close" onClick={onClose} aria-label={t.galleryClose}>
          <Icon name="X" size={20} color="var(--nk-text)" />
        </button>
        <div className="nk-lightbox__stage"
          onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || !many) { return; }
            const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
            touchStartX.current = null;
            if (dx > 40) { prev(); } else if (dx < -40) { next(); }
          }}>
          {many && (
            <button className="nk-lightbox__nav" onClick={prev} aria-label={t.galleryPrev}>
              <Icon name="ArrowLeft" size={22} stroke={2} color="var(--nk-text)" />
            </button>
          )}
          <LightboxImage key={i} src={images[i]} alt={i === 0 ? title : `${title} — ${i + 1}`} errorLabel={t.galleryImageError} />
          {many && (
            <button className="nk-lightbox__nav" onClick={next} aria-label={t.galleryNext}>
              <Icon name="ArrowRight" size={22} stroke={2} color="var(--nk-text)" />
            </button>
          )}
        </div>
        {/* Off-screen, non-interactive prefetch of the adjacent photos (identical
            optimizer params → cache hit on paging). fetchPriority low so it never
            competes with the in-view photo. */}
        {warm.length > 0 && (
          <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
            {warm.map((n) => (
              <span key={n} style={{ position: "relative", display: "block", width: 1, height: 1 }}>
                <Image src={images[n]} alt="" fill sizes={LB_SIZES} loading="eager" fetchPriority="low" />
              </span>
            ))}
          </div>
        )}
        {many && (
          <div ref={thumbsRef} className="nk-lightbox__thumbs">
            {images.map((src, idx) => (
              <button key={idx} type="button" onClick={() => setI(idx)} aria-current={idx === i}
                aria-label={`${idx + 1} / ${images.length}`}
                className={"nk-lightbox__thumb" + (idx === i ? " is-active" : "")}>
                <Image src={src} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
        <div className="nk-lightbox__bar">
          {/* "1 / 1" is dead chrome on single-photo sets — the empty span keeps the
              reserve CTA right-aligned in the space-between bar. */}
          {many ? (
            <span className="nk-lightbox__count" aria-live="polite">{i + 1} / {images.length}</span>
          ) : (
            <span aria-hidden />
          )}
          <button className="nk-btn nk-btn--primary nk-btn--sm" title={dict.bridge.opensAppHint}
            onClick={() => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody, listing: { title, thumb: images[i] }, appPath })}>
            <Icon name="Smartphone" size={16} stroke={2.2} color="var(--nk-text)" /> {t.reserve}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Focus-column content sections ---------------- */
function DescriptionSection({ description }: { description: string }) {
  const { locale, dict } = useI18n();
  const t = dict.detail;
  // Long owner text is clamped to ~6 lines on phones (see .nk-desc-clamp); the
  // toggle renders only when the clamp actually hides content, and stays once
  // expanded so the reader can always collapse back.
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expanded) {
      return;
    }
    const el = bodyRef.current;
    if (!el) {
      return;
    }
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description, expanded]);
  return (
    <Section id="aprasymas" title={t.descHeading} first>
      {/* Owner UGC stays Lithuanian on /en — disclose the original language rather
          than render unlabelled foreign text (never machine-translate client-side). */}
      {locale !== "lt" && (
        <p style={{ margin: "0 0 var(--nk-gap-sm)", fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>{t.descOriginalNote}</p>
      )}
      <div ref={bodyRef} className={"nk-prose" + (expanded ? "" : " nk-desc-clamp")} style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "30px", color: "var(--nk-text-2)", textWrap: "pretty" }}><RichText html={description} /></div>
      {(overflowing || expanded) && (
        <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}
          style={{ marginTop: "var(--nk-gap-xs)", padding: "10px 0", minHeight: "var(--nk-tap)", border: 0, background: "none", cursor: "pointer", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-purple-hover)" }}>
          {expanded ? t.descLess : t.descMore}
          <Icon name="ChevronDown" size={16} stroke={2} color="var(--nk-purple-hover)" style={{ transform: expanded ? "rotate(180deg)" : undefined }} />
        </button>
      )}
    </Section>
  );
}

function SpecsSection({ attributes }: { attributes: ListingDetail["attributes"] }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <Section id="specifikacijos" title={t.specsHeading}>
      <div className="nk-spec-grid">
        {attributes.map((a) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--nk-gap-md)", padding: "15px 0", borderBottom: "1px solid var(--nk-divider)" }}>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>{a.label}</span>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)", textAlign: "right" }}>{a.value}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DeliveryZoneGraphic({ radiusKm }: { radiusKm: number | null }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 200, border: "1px solid var(--nk-border)", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(120% 90% at 50% 40%, var(--nk-bg) 0%, var(--nk-bg-deep) 100%)" }}>
      {/* faint road grid */}
      <span style={{ position: "absolute", left: 0, right: 0, top: "32%", height: 2, background: "var(--nk-hairline)" }} />
      <span style={{ position: "absolute", left: 0, right: 0, top: "68%", height: 2, background: "var(--nk-hairline)" }} />
      <span style={{ position: "absolute", top: 0, bottom: 0, left: "28%", width: 2, background: "var(--nk-hairline)" }} />
      <span style={{ position: "absolute", top: 0, bottom: 0, left: "70%", width: 2, background: "var(--nk-hairline)" }} />
      {/* delivery radius */}
      <span style={{ position: "absolute", left: "50%", top: "50%", width: 200, height: 200, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "var(--nk-purple-soft)", border: "1.5px solid var(--nk-accent-border)" }} />
      <span style={{ position: "absolute", left: "50%", top: "50%", width: 110, height: 110, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "var(--nk-purple-soft)" }} />
      {/* pin */}
      <span style={{ position: "relative", width: 46, height: 46, borderRadius: 23, background: "var(--nk-purple)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px var(--nk-purple-glow-2)" }}>
        <Icon name="MapPin" size={24} color="var(--nk-text)" stroke={2.2} />
      </span>
      <span style={{ position: "absolute", left: 14, bottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, background: "var(--nk-overlay)", backdropFilter: "blur(10px)", border: "1px solid var(--nk-border-soft)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--nk-text)" }}>
        <Icon name="Car" size={14} color="var(--nk-text)" stroke={2} /> {radiusKm ? t.deliveryZoneKm(radiusKm) : t.deliveryZone}
      </span>
    </div>
  );
}

// One pickup/delivery row in the handover panel.
function HandoverRow({ icon, label, value, pill }: { icon: IconName; label: string; value: string; pill?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)" }}>
      <span style={{ width: "var(--nk-size-icon-sm)", height: "var(--nk-size-icon-sm)", borderRadius: 12, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={20} stroke={2} color="var(--nk-purple-hover)" /></span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)" }}>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{label}</span>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{value}</span>
      </div>
      {pill}
    </div>
  );
}

function HandoverSection({ city, subdivision, delivery }: { city: string; subdivision?: string; delivery: ListingDelivery }) {
  const { locale, dict } = useI18n();
  const t = dict.detail;
  const [mapAllowed, setMapAllowed] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setMapAllowed(localStorage.getItem("nk_google_maps_allowed") === "1");
      } catch {
        // Storage can be unavailable in strict/private contexts; explicit consent
        // still works for the current render.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const pickupLocation = formatLocation(city, subdivision);
  const mapSrc = GOOGLE_MAPS_API_KEY && city
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${city}, Lietuva`)}&zoom=11&language=${locale}`
    : null;
  // A listing offers pickup, delivery, or both; show only the rows that apply,
  // falling back to a plain location row when the data lists neither. The subtitle
  // gets the same flags so its copy never promises an option the rows don't show.
  const showPickup = delivery.pickup || !delivery.delivery;
  return (
    <Section id="perdavimas" title={t.handoverHeading} sub={t.deliverySub(city, { pickup: showPickup, delivery: delivery.delivery })}>
      <div className="nk-tworow" style={{ alignItems: "stretch", gap: "var(--nk-gap-xl)" }}>
        {mapSrc && mapAllowed ? (
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 200, border: "1px solid var(--nk-border)" }}>
            <iframe
              src={mapSrc}
              title={t.mapTitle(city)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        ) : mapSrc ? (
          <div className="nk-map-consent">
            <DeliveryZoneGraphic radiusKm={delivery.radiusKm} />
            <div className="nk-map-consent__panel">
              <p>{t.mapNotice}</p>
              <div className="nk-map-consent__actions">
                <button type="button" className="nk-btn nk-btn--ghost" onClick={() => {
                  setMapAllowed(true);
                  try { localStorage.setItem("nk_google_maps_allowed", "1"); } catch {}
                  trackEvent("Google Maps Loaded", { locale, placement: "listing_handover" });
                }}>{t.mapLoad}</button>
                <a href={localePath(locale, "/privatumo-politika")}>{t.mapPrivacy}</a>
              </div>
            </div>
          </div>
        ) : (
          <DeliveryZoneGraphic radiusKm={delivery.radiusKm} />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "var(--nk-gap-md)" }}>
          {showPickup && (
            <HandoverRow icon="MapPin" label={t.pickupLabel} value={pickupLocation || "—"} pill={<Pill tone="green">{t.pickupFree}</Pill>} />
          )}
          {delivery.delivery && (
            <HandoverRow
              icon="Car"
              label={t.deliveryLabel}
              value={delivery.radiusKm ? t.deliveryRadius(delivery.radiusKm) : t.deliveryByArrangement}
              // Only the owner's own per-km rate; when the wire carries none the row
              // stays badge-less rather than implying a price we don't have.
              pill={delivery.pricePerKm ? <Pill tone="accent">{t.deliveryPerKm(delivery.pricePerKm)}</Pill> : undefined}
            />
          )}
        </div>
      </div>
    </Section>
  );
}

function TermsSection({ listing }: { listing: ListingDetail }) {
  const t = useI18n().dict.detail;
  return (
    <Section id="salygos" title={t.termsHeading}>
      <div className="nk-hl-grid">
        <FactCard icon="Tag" title={`${listing.price} ${t.perDay}`} sub={t.termRentSub} />
        <FactCard icon="ShieldCheck" title={listing.deposit ? t.depositTitle(listing.deposit) : t.depositNone} sub={t.termDepositSub} />
        <FactCard icon="Calendar" title={t.durationRange(listing.minDays, listing.maxDays)} sub={t.termDurationSub} />
        <FactCard icon="RefreshCcw" title={t.cancellationLabel(listing.cancellation)} sub={t.termCancelSub} />
      </div>
    </Section>
  );
}

// Rating summary (big average + per-star bars) followed by the review cards grid.
// Rendered only when there are reviews; the empty state is handled by the caller.
function ReviewsBreakdown({ rating, ratingValue, ratingCount, breakdown, reviews, reviewCountLabel, showAllLabel, onShowReviews }: {
  rating?: string;
  ratingValue: number;
  ratingCount: number;
  breakdown: RatingBucket[];
  reviews: ListingReview[];
  reviewCountLabel: string;
  showAllLabel: string;
  onShowReviews: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xl)" }}>
      {/* rating breakdown */}
      <div style={{ padding: "var(--nk-card-pad)", borderRadius: "var(--nk-r-md)", background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
        <div className="nk-ratebreak" style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-gap-xs)", paddingRight: 44, borderRight: "1px solid var(--nk-divider)" }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 56, lineHeight: 1, color: "var(--nk-text)" }}>{rating}</span>
            <Stars value={ratingCount > 0 ? ratingValue : 0} size={18} />
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)", whiteSpace: "nowrap" }}>{reviewCountLabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)" }}>
            {breakdown.map(({ stars, count }) => {
              const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-sm)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, width: 30, fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>
                    {stars}<Icon name="Star" size={12} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
                  </span>
                  <span style={{ flex: 1, height: 7, borderRadius: 4, background: "var(--nk-divider)", overflow: "hidden" }}>
                    <span style={{ display: "block", width: pct + "%", height: "100%", borderRadius: 4, background: "linear-gradient(90deg,var(--nk-yellow),var(--nk-yellow-deep))" }} />
                  </span>
                  <span className="nk-tnum" style={{ width: 34, textAlign: "right", fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* review cards */}
      <div className="nk-rev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--nk-gap-md)" }}>
        {reviews.map((r) => (
          <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-sm)" }}>
              <span className="nk-imgph" style={{ width: 42, height: 42, borderRadius: 21, flex: "none" }}>
                {r.avatar && <Image src={r.avatar} alt={r.name} fill sizes="42px" style={{ objectFit: "cover" }} />}
                {!r.avatar && <Icon name="User" size={20} stroke={1.6} color="var(--nk-avatar-icon)" />}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)", overflowWrap: "anywhere", hyphens: "auto" }}>{r.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-xs)" }}>
                  <Stars value={r.stars} size={13} /><span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)" }}>· {r.date}</span>
                </span>
              </div>
            </div>
            {/* UGC: hyphenate long LT compounds; anywhere only as the last resort
                so pasted URLs/tokens can never clip at ≤360px card widths */}
            <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 15, lineHeight: "24px", color: "var(--nk-text-2)", hyphens: "auto", overflowWrap: "anywhere" }}>{r.text}</p>
          </div>
        ))}
      </div>
      {/* Opens the reviews app-redirect (not the contact-owner one). */}
      <button className="nk-btn nk-btn--ghost" style={{ alignSelf: "flex-start", borderColor: "var(--nk-border)" }} onClick={onShowReviews}>
        {showAllLabel} <Icon name="ArrowRight" size={16} stroke={2} color="var(--nk-text)" />
      </button>
    </div>
  );
}

export function ReviewsSection({ listing, onShowReviews }: { listing: ListingDetail; onShowReviews: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <Section id="atsiliepimai" title={t.reviewsHeading}>
      {listing.ratingCount > 0 ? (
        <ReviewsBreakdown rating={listing.rating} ratingValue={listing.ratingValue} ratingCount={listing.ratingCount}
          breakdown={listing.ratingBreakdown} reviews={listing.reviews}
          reviewCountLabel={dict.common.reviewCount(listing.ratingCount)} showAllLabel={t.reviewsInApp(listing.ratingCount)}
          onShowReviews={onShowReviews} />
      ) : (
        <SectionEmpty icon="MessageCircle" title={t.reviewsEmptyTitle} subtitle={t.reviewsEmptyBody}
          actionLabel={t.reserve}
          onAction={() => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody, listing: { title: listing.title, thumb: listing.images[0], priceLabel: `${listing.price} ${t.perDay}` } })} />
      )}
    </Section>
  );
}

// The focus column: description → specs → handover → terms. Reviews break out to
// full width beneath the two-column grid (see ListingScreen) so the reviews module
// never sits marooned in the narrow column with dead space under the sidebar.
export function DetailBody({ listing }: { listing: ListingDetail }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
      <DescriptionSection description={listing.description} />
      {listing.attributes.length > 0 && <SpecsSection attributes={listing.attributes} />}
      <HandoverSection city={listing.city} subdivision={listing.subdivision} delivery={listing.delivery} />
      <TermsSection listing={listing} />
    </div>
  );
}

/* ---------------- Sidebar: booking panel ----------------
   Sticky reserve card (desktop): per-day price, one honest in-app reassurance line
   (nothing transacts on the bridge — dates + final price are confirmed in the app),
   and the reserve CTA.
   variant="facts" drops the reserve button — used inline on mobile (≤980px), where
   the sticky sidebar is hidden and the fixed MobileBar carries the reserve CTA, so
   the price + reassurance line still travel to phone users. */
export function BookingPanel({ listing, onReserve, variant = "full" }: {
  listing: ListingDetail;
  onReserve: () => void;
  variant?: "full" | "facts";
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-2)" }}>
      {/* flexWrap: at the 981px sidebar minimum a max price + 5-digit review count
          overflowed the card — the rating chip drops to its own line instead */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--nk-gap-xs)", flexWrap: "wrap" }}>
        <span className="nk-tnum" style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 33, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{listing.price}</span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-2)" }}>{t.perDay}</span>
        {listing.rating && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-2)" }}>
            <Icon name="Star" size={14} color="var(--nk-yellow)" fill="var(--nk-yellow)" /> {listing.rating} · {listing.ratingCount}
          </span>
        )}
      </div>
      {/* One honest line: nothing transacts on the bridge — dates and the final
          price are confirmed in the app. Replaces the old fee "table" whose every
          value just read "Programėlėje". */}
      <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, lineHeight: "18px", color: "var(--nk-text-muted)" }}>{t.confirmInApp}</span>
      {variant !== "facts" && (
        <a className="nk-btn nk-btn--primary" href={goHref(`/listing/${listing.id}`)}
          onClick={(event) => { event.preventDefault(); onReserve(); }} title={dict.bridge.opensAppHint}
          data-nk-redirect data-nk-redirect-title={dict.bridge.reserveTitle} data-nk-redirect-body={dict.bridge.reserveBody}
          data-nk-redirect-target={`/listing/${listing.id}`}
          style={{ width: "100%", padding: 16, fontSize: 17 }}>
          <Icon name="Smartphone" size={17} stroke={2.2} color="var(--nk-text)" /> {t.reserve}
        </a>
      )}
    </div>
  );
}

/* ---------------- Sidebar: host card ----------------
   Owner/host trust card: avatar, name + verified pill, a 2×2 stat grid, contact CTA. */
export function HostCard({ owner, rating, ratingCount, onContact }: {
  owner: ListingOwner;
  rating?: string;
  ratingCount: number;
  onContact: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  // Three numeric stats. Verification is already shown by the green pill above,
  // so the long "Verified profile" phrase is no longer shoehorned into a numeric
  // slot; the items cell uses a bare count (its label carries the noun). On a
  // zero-review listing, lead with the positive "items" cell rather than "— / 0".
  type HostStat = { value: string; label: string; star?: boolean };
  const ratingStat: HostStat = { value: rating ?? "—", label: t.hostStatRating, star: !!rating };
  const reviewsStat: HostStat = { value: String(ratingCount), label: t.hostStatReviews };
  const listingsStat: HostStat = { value: String(owner.listingsCount), label: t.hostStatListings };
  const stats: HostStat[] = ratingCount === 0
    ? [listingsStat, ratingStat, reviewsStat]
    : [ratingStat, reviewsStat, listingsStat];
  return (
    <div style={{ background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad-sm)", border: "1px solid var(--nk-border)", boxShadow: "var(--nk-edge-top)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)" }}>
        <span className="nk-imgph" style={{ width: 58, height: 58, borderRadius: 29, flex: "none", border: "2px solid var(--nk-green-soft)" }}>
          {owner.avatar && <Image src={owner.avatar} alt={owner.name} fill sizes="58px" style={{ objectFit: "cover" }} />}
          {!owner.avatar && <Icon name="User" size={26} stroke={1.6} color="var(--nk-avatar-icon)" />}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)", minWidth: 0 }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-text)" }}>{owner.name}</span>
          {owner.verified && (
            <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <Pill tone="green" icon="BadgeCheck" size="sm">{t.verifiedOwnerPill}</Pill>
            </span>
          )}
        </div>
      </div>
      {/* Tenure/responsiveness signals — the strongest pre-review trust facts. Only
          rendered when the wire actually carries them (never fabricated). */}
      {(owner.memberSince || owner.responseTimeHours != null) && (
        <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 14px", fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)", textAlign: "center" }}>
          {owner.memberSince && <span>{t.hostMemberSince(owner.memberSince)}</span>}
          {owner.responseTimeHours != null && <span>{t.hostResponseTime(owner.responseTimeHours)}</span>}
        </span>
      )}
      {owner.verified && (
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 13, lineHeight: "19px", color: "var(--nk-text-muted)", textAlign: "center" }}>
          {t.verifiedOwnerNote}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--nk-hairline)", borderRadius: 14, overflow: "hidden" }}>
        {stats.map((s) => (
          <span key={s.label} style={{ background: "var(--nk-surface)", padding: "20px 10px", display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-text)", whiteSpace: "nowrap" }}>
              {s.value}{s.star && <Icon name="Star" size={13} color="var(--nk-yellow)" fill="var(--nk-yellow)" />}
            </span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 12, color: "var(--nk-text-muted)" }}>{s.label}</span>
          </span>
        ))}
      </div>
      <button className="nk-btn nk-btn--outline" onClick={onContact} title={dict.bridge.opensAppHint} data-testid="nk-contact-owner" style={{ width: "100%", padding: "13px 24px", fontSize: 15.5 }}>
        <Icon name="MessageCircle" size={17} color="var(--nk-text)" stroke={2} /> {t.hostMessage}
      </button>
    </div>
  );
}

/* ---------------- Mobile reserve bar ---------------- */
export function MobileBar({ price, appPath, hidden, onReserve }: { price: string; appPath: string; hidden?: boolean; onReserve: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div className={"nk-mbar" + (hidden ? " is-hidden" : "")}>
      <span style={{ display: "flex", flexDirection: "column" }}>
        <span className="nk-tnum" style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, color: "var(--nk-text)" }}>{price} <span style={{ fontFamily: "var(--nk-font-body)", fontWeight: 400, fontSize: 15, color: "var(--nk-text-2)" }}>{t.perDayShort}</span></span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)" }}>{t.mobileBookingNote}</span>
      </span>
      <a className="nk-btn nk-btn--primary" href={goHref(appPath)}
        onClick={(event) => { event.preventDefault(); onReserve(); }} title={dict.bridge.opensAppHint}
        data-nk-redirect data-nk-redirect-title={dict.bridge.reserveTitle} data-nk-redirect-body={dict.bridge.reserveBody}
        data-nk-redirect-target={appPath}
        style={{ padding: "14px 26px", fontSize: 16 }}>
        <Icon name="Smartphone" size={16} stroke={2.2} color="var(--nk-text)" /> {t.reserveMobile}
      </a>
    </div>
  );
}

/* ---------------- Breadcrumb items helper ----------------
   Feed → canonical category landing → listing title. The feed parent matches the header's
   active-nav section, the landing pages and the page's own BreadcrumbList JSON-LD,
   so the site presents one canonical trail for a listing. */
// The feed-root crumb on its own — what the loading states show before the
// listing (and its category leaf) are known. Keeps the /skelbimai href in one
// place so the detail trail and both loading skeletons can't drift.
export function feedCrumbItems({ feedLabel, locale }: { feedLabel: string; locale: Locale }) {
  return [{ label: feedLabel, href: localePath(locale, "/skelbimai") }];
}

export function detailCrumbs({ category, categoryId, title, feedLabel, locale }: {
  category?: string; categoryId?: string; title: string; feedLabel: string; locale: Locale;
}) {
  return [
    ...feedCrumbItems({ feedLabel, locale }),
    ...(category && categoryId ? [{ label: category, href: listingLandingHref({ category: categoryId, locale }) }] : []),
    { label: title },
  ];
}
