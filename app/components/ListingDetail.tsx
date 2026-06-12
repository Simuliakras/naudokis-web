"use client";
// Naudokis UI kit — listing-detail pieces.
// Presentational building blocks + self-contained sections for the listing
// detail PAGE (see ListingScreen.tsx, which orchestrates them). Layout mirrors
// the design bundle's "2026 rigorous redesign" (listing.jsx): premium bento
// gallery, sticky in-page sub-nav, booking panel, trust-rich host card.
import { useState } from "react";
import Image from "next/image";
import { Icon, IconName, Pill } from "./ui";
import { SectionEmpty } from "./cards";
import type { ListingDetail, ListingOwner, ListingReview, RatingBucket } from "@/app/lib/listings";
import { listingSearchHref } from "@/app/lib/search";
import type { Dict } from "@/app/lib/i18n/types";
import { useI18n } from "./I18nProvider";

export type DetailDict = Dict["detail"];

/* ---------------- Sub-nav model ---------------- */
export const SUBNAV_IDS = ["aprasymas", "specifikacijos", "perdavimas", "salygos", "atsiliepimai"] as const;

// Maps each in-page section id to its label key in dict.detail.subnav (validated
// against the section ids; keys checked against the dict at the index site).
const SUBNAV_LABEL_KEYS = {
  aprasymas: "description",
  specifikacijos: "specs",
  perdavimas: "handover",
  salygos: "terms",
  atsiliepimai: "reviews",
} as const satisfies Record<(typeof SUBNAV_IDS)[number], keyof DetailDict["subnav"]>;

/* ---------------- Shared primitives ---------------- */
function Section({ id, title, sub, first, children }: {
  id: string; title: string; sub?: string; first?: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} className="nk-sec" style={{ paddingTop: first ? 0 : 44, borderTop: first ? "none" : "1px solid var(--nk-hairline)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: sub ? 5 : 0, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 25, lineHeight: "30px", color: "var(--nk-text)" }}>{title}</h2>
        {sub && <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

// Compact icon "fact card" used by the rental-terms grid.
function FactCard({ icon, title, sub }: { icon: IconName; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 15, padding: "18px 20px", borderRadius: 16, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
      <span style={{ width: 46, height: 46, borderRadius: 13, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} stroke={2} color="var(--nk-purple-hover)" />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{title}</span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>{sub}</span>
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

function DateField({ label, value, onPick }: { label: string; value: string; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="nk-lfield" style={{ flex: 1, textAlign: "left", display: "flex", flexDirection: "column", gap: 3, padding: "11px 15px", borderRadius: 13, background: "var(--nk-input-bg)", border: "1px solid var(--nk-border)" }}>
      <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nk-text-muted)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)" }}>{value}</span>
        <Icon name="Calendar" size={15} color="var(--nk-purple-hover)" stroke={2} />
      </span>
    </button>
  );
}

function GalleryTile({ src, alt, big, children }: { src?: string; alt?: string; big?: boolean; children?: React.ReactNode }) {
  return (
    <div className="nk-imgph nk-gtile" style={{ borderRadius: big ? 18 : 14, position: "relative" }}>
      {src && (
        <Image src={src} alt={alt ?? ""} fill priority={big}
          sizes={big ? "(max-width: 980px) 100vw, 60vw" : "(max-width: 980px) 50vw, 20vw"}
          style={{ objectFit: "cover" }} />
      )}
      {!src && <Icon name="Image" size={big ? 64 : 34} stroke={1.4} className="nk-imgicon" />}
      {children}
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
export function ListingSkeleton() {
  const sec: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 18 };
  const card: React.CSSProperties = { background: "var(--nk-surface)", borderRadius: 22, padding: 24, border: "1px solid var(--nk-border)", display: "flex", flexDirection: "column", gap: 18 };
  return (
    <div aria-hidden="true" style={{ pointerEvents: "none" }}>
      {/* breadcrumb */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <Skel w={90} h={14} /><Skel w={80} h={14} /><Skel w={130} h={14} />
      </div>
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
        <Skel r={18} h="100%" />
        <Skel h="100%" r={14} /><Skel h="100%" r={14} /><Skel h="100%" r={14} /><Skel h="100%" r={14} />
      </div>
      {/* focus column + reserve sidebar */}
      <div className="nk-detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 44, minWidth: 0 }}>
          <div style={sec}><Skel w={170} h={26} r={9} /><SkelLines rows={4} last="45%" /></div>
          <div style={sec}><Skel w={210} h={26} r={9} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 48 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ padding: "15px 0", borderBottom: "1px solid var(--nk-divider)", display: "flex", justifyContent: "space-between" }}><Skel w={120} h={14} /><Skel w={70} h={14} /></div>
              ))}
            </div>
          </div>
          <div style={sec}><Skel w={220} h={26} r={9} /><Skel h={260} r={18} /></div>
        </div>
        <div className="nk-reserve">
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Skel w={130} h={32} r={9} /><Skel w={70} h={16} /></div>
            <div style={{ display: "flex", gap: 10 }}><Skel h={56} r={13} /><Skel h={56} r={13} /></div>
            <SkelLines rows={3} gap={14} last="100%" />
            <Skel h={52} r={25} />
            <Skel h={36} r={11} w="90%" style={{ alignSelf: "center" }} />
          </div>
          <div style={card}>
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}><Skel w={58} h={58} r={29} /><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}><Skel w="60%" h={18} /><Skel w="80%" h={14} /></div></div>
            <Skel h={84} r={14} />
            <Skel h={48} r={25} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */
const headerBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 9, padding: "10px 16px", borderRadius: 13,
  fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)",
  background: "var(--nk-input-bg)", border: "1px solid var(--nk-border)", whiteSpace: "nowrap",
};
const metaItem: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", whiteSpace: "nowrap" };
const Dot = () => <span style={{ width: 3, height: 3, borderRadius: 2, background: "var(--nk-text-muted)", flex: "none" }} />;

export function ListingHeader({ listing, saved, onShare, onFav }: {
  listing: ListingDetail; saved: boolean; onShare: () => void; onFav: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 4vw, 50px)", lineHeight: 1.04, letterSpacing: "-0.015em", color: "var(--nk-text)", textWrap: "balance" }}>{listing.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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
              <span style={metaItem}><Icon name="MapPin" size={16} color="var(--nk-text-muted)" stroke={2} /> {listing.city}</span>
              {listing.owner.verified && <Dot />}
            </>
          )}
          {listing.owner.verified && (
            <span style={metaItem}><Icon name="BadgeCheck" size={16} color="var(--nk-green)" stroke={2} /> <span style={{ color: "var(--nk-green)", fontWeight: 600, fontFamily: "var(--nk-font-display)" }}>{t.verifiedOwnerPill}</span></span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flex: "none" }}>
        <button className="nk-lfield" style={headerBtn} onClick={onShare}><Icon name="ArrowUpDown" size={17} stroke={2} color="var(--nk-text)" style={{ transform: "rotate(45deg)" }} /> {t.share}</button>
        <button className="nk-lfield" style={headerBtn} onClick={onFav}><Icon name="Heart" size={17} stroke={2} color={saved ? "var(--nk-orange)" : "var(--nk-text)"} fill={saved ? "var(--nk-orange)" : "none"} /> {t.save}</button>
      </div>
    </div>
  );
}

/* ---------------- Bento gallery ---------------- */
export function Gallery({ images, title, isNew, onMore }: { images: string[]; title: string; isNew: boolean; onMore: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const tiles = Array.from({ length: 5 }, (_, i) => images[i]);
  const extra = images.length > 5 ? images.length - 5 : 0;
  const alt = (i: number) => (i === 0 ? title : `${title} — ${i + 1}`);
  return (
    <div className="nk-bento">
      <GalleryTile src={tiles[0]} alt={alt(0)} big>
        {isNew && (
          <span style={{ position: "absolute", top: 16, left: 16 }}>
            <Pill tone="yellow" icon="Sparkles">{t.newListingPill}</Pill>
          </span>
        )}
        <span className="nk-gtile__hint" style={{ position: "absolute", inset: 0, borderRadius: 18, background: "rgba(20,22,23,.18)" }} />
      </GalleryTile>
      <GalleryTile src={tiles[1]} alt={alt(1)} />
      <GalleryTile src={tiles[2]} alt={alt(2)} />
      <GalleryTile src={tiles[3]} alt={alt(3)} />
      <GalleryTile src={tiles[4]} alt={alt(4)}>
        <button onClick={onMore} style={{ position: "absolute", right: 14, bottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "var(--nk-overlay)", backdropFilter: "blur(12px)", border: "1px solid var(--nk-border-strong)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 14.5, color: "#fff" }}>
          <Icon name="LayoutGrid" size={16} color="#fff" stroke={2} /> {extra > 0 ? t.galleryMore(extra) : t.galleryAll(Math.max(images.length, 1))}
        </button>
      </GalleryTile>
    </div>
  );
}

/* ---------------- Sticky in-page sub-nav (scrollspy) ---------------- */
export function SubNav({ activeSec, price, onReserve }: { activeSec: string; price: string; onReserve: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <nav className="nk-subnav" aria-label={dict.common.breadcrumbLabel}>
      <div className="nk-subnav__inner">
        {SUBNAV_IDS.map((sid) => (
          <a key={sid} href={"#" + sid} className={"nk-subnav__a" + (activeSec === sid ? " is-active" : "")}>{t.subnav[SUBNAV_LABEL_KEYS[sid]]}</a>
        ))}
        <button className="nk-subnav__cta nk-btn nk-btn--primary" onClick={onReserve}>{price} {t.perDayShort} · {t.subnavReserve}</button>
      </div>
    </nav>
  );
}

/* ---------------- Focus-column content sections ---------------- */
function DescriptionSection({ description }: { description: string }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [open, setOpen] = useState(false);
  return (
    <Section id="aprasymas" title={t.descHeading} first>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "30px", color: "var(--nk-text-2)", textWrap: "pretty", maxHeight: open ? "none" : 120, overflow: "hidden", maskImage: open ? "none" : "linear-gradient(180deg,#000 64%,transparent)", WebkitMaskImage: open ? "none" : "linear-gradient(180deg,#000 64%,transparent)" }}>{description}</p>
        {description.length > 180 && (
          <button onClick={() => setOpen((v) => !v)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--nk-purple-hover)" }}>
            {open ? t.descLess : t.descMore} <Icon name="ChevronDown" size={16} stroke={2.4} color="var(--nk-purple-hover)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
          </button>
        )}
      </div>
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
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "15px 0", borderBottom: "1px solid var(--nk-divider)" }}>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>{a.label}</span>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)", textAlign: "right" }}>{a.value}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function HandoverSection({ city }: { city: string }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <Section id="perdavimas" title={t.handoverHeading} sub={t.deliverySub(city)}>
      <div className="nk-tworow" style={{ alignItems: "stretch", gap: 24 }}>
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
            <Icon name="Car" size={14} color="var(--nk-text)" stroke={2} /> {t.deliveryZone}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="MapPin" size={20} stroke={2} color="var(--nk-purple-hover)" /></span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{t.pickupLabel}</span>
              <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{city || "—"}</span>
            </div>
            <Pill tone="green">{t.pickupFree}</Pill>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="Car" size={20} stroke={2} color="var(--nk-purple-hover)" /></span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{t.deliveryLabel}</span>
              <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{t.deliveryByArrangement}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function TermsSection({ price, deposit }: { price: string; deposit: string }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <Section id="salygos" title={t.termsHeading}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="nk-hl-grid">
          <FactCard icon="Tag" title={`${price} ${t.perDay}`} sub={t.termRentSub} />
          <FactCard icon="ShieldCheck" title={`${deposit} ${t.depositNoun}`} sub={t.termDepositSub} />
          <FactCard icon="Calendar" title={t.termDuration} sub={t.termDurationSub} />
          <FactCard icon="RefreshCcw" title={t.termCancel} sub={t.termCancelSub} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, background: "var(--nk-green-tint)", border: "1px solid var(--nk-green-soft)" }}>
          <Icon name="ShieldCheck" size={20} color="var(--nk-green)" stroke={2} />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, lineHeight: "21px", color: "var(--nk-text-2)" }}>
            <b style={{ fontFamily: "var(--nk-font-display)", color: "var(--nk-text)" }}>{t.depositSafeTitle}</b> {t.depositSafeBody}
          </span>
        </div>
      </div>
    </Section>
  );
}

// Rating summary (big average + per-star bars) followed by the review cards grid.
// Rendered only when there are reviews; the empty state is handled by the caller.
function ReviewsBreakdown({ rating, ratingValue, ratingCount, breakdown, reviews, reviewCountLabel, showAllLabel, onContact }: {
  rating?: string;
  ratingValue: number;
  ratingCount: number;
  breakdown: RatingBucket[];
  reviews: ListingReview[];
  reviewCountLabel: string;
  showAllLabel: string;
  onContact: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* rating breakdown */}
      <div style={{ padding: 24, borderRadius: 18, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0 44px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingRight: 44, borderRight: "1px solid var(--nk-divider)" }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 56, lineHeight: 1, color: "var(--nk-text)" }}>{rating}</span>
            <Stars value={ratingCount > 0 ? ratingValue : 0} size={18} />
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)", whiteSpace: "nowrap" }}>{reviewCountLabel}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {breakdown.map(({ stars, count }) => {
              const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, width: 30, fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>
                    {stars}<Icon name="Star" size={12} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
                  </span>
                  <span style={{ flex: 1, height: 7, borderRadius: 4, background: "var(--nk-divider)", overflow: "hidden" }}>
                    <span style={{ display: "block", width: pct + "%", height: "100%", borderRadius: 4, background: "linear-gradient(90deg,var(--nk-yellow),var(--nk-yellow-deep))" }} />
                  </span>
                  <span style={{ width: 34, textAlign: "right", fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* review cards */}
      <div className="nk-rev-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {reviews.map((r) => (
          <div key={r.name} style={{ display: "flex", flexDirection: "column", gap: 11, padding: 22, borderRadius: 16, background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span className="nk-imgph" style={{ width: 42, height: 42, borderRadius: 21, flex: "none" }}>
                <Icon name="User" size={20} stroke={1.6} color="#5b6163" />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{r.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stars value={r.stars} size={13} /><span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)" }}>· {r.date}</span>
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 15, lineHeight: "24px", color: "var(--nk-text-2)" }}>{r.text}</p>
          </div>
        ))}
      </div>
      <button className="nk-btn nk-btn--ghost" style={{ alignSelf: "flex-start", borderColor: "var(--nk-border)" }} onClick={onContact}>
        {showAllLabel} <Icon name="ArrowRight" size={16} stroke={2} color="var(--nk-text)" />
      </button>
    </div>
  );
}

function ReviewsSection({ listing, onContact }: { listing: ListingDetail; onContact: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <Section id="atsiliepimai" title={t.reviewsHeading}>
      {listing.reviews.length > 0 ? (
        <ReviewsBreakdown rating={listing.rating} ratingValue={listing.ratingValue} ratingCount={listing.ratingCount}
          breakdown={listing.ratingBreakdown} reviews={listing.reviews}
          reviewCountLabel={dict.common.reviewCount(listing.ratingCount)} showAllLabel={t.reviewsShowAll(listing.ratingCount)}
          onContact={onContact} />
      ) : (
        <SectionEmpty icon="MessageCircle" title={t.reviewsEmptyTitle} subtitle={t.reviewsEmptyBody} />
      )}
    </Section>
  );
}

// The full focus column: description → specs → handover → terms → reviews.
export function DetailBody({ listing, deposit, onContact }: {
  listing: ListingDetail; deposit: string; onContact: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
      <DescriptionSection description={listing.description} />
      {listing.attributes.length > 0 && <SpecsSection attributes={listing.attributes} />}
      <HandoverSection city={listing.city} />
      <TermsSection price={listing.price} deposit={deposit} />
      <ReviewsSection listing={listing} onContact={onContact} />
    </div>
  );
}

/* ---------------- Sidebar: booking panel ----------------
   Sticky reserve card (desktop): price, sample dates, cost breakdown, reserve CTA. */
export function BookingPanel({ listing, deposit, days, subtotal, total, onReserve, onPickDates }: {
  listing: ListingDetail;
  deposit: string;
  days: number;
  subtotal: string;
  total: string;
  onReserve: () => void;
  onPickDates: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ background: "var(--nk-surface)", borderRadius: 22, padding: 24, display: "flex", flexDirection: "column", gap: 18, border: "1px solid var(--nk-border-strong)", boxShadow: "0 24px 60px rgba(0,0,0,.34)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 33, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{listing.price}</span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-2)" }}>{t.perDay}</span>
        {listing.rating && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-2)", whiteSpace: "nowrap" }}>
            <Icon name="Star" size={14} color="var(--nk-yellow)" fill="var(--nk-yellow)" /> {listing.rating} · {listing.ratingCount}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <DateField label={t.dateFrom} value={t.sampleDateFrom} onPick={onPickDates} />
        <DateField label={t.dateTo} value={t.sampleDateTo} onPick={onPickDates} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-2)" }}>
          <span>{t.lineItem(listing.price, days)}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{subtotal}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-2)" }}>
          <span title={t.serviceFeeHint} style={{ textDecoration: "underline dotted", textUnderlineOffset: 3, cursor: "help" }}>{t.serviceFee}</span><span style={{ color: "var(--nk-green)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.serviceFeeFree}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>
          <span>{t.depositReturnable}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{deposit}</span>
        </div>
        <span style={{ height: 1, background: "var(--nk-divider)", margin: "2px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-text)" }}>
          <span style={{ whiteSpace: "nowrap" }}>{t.totalToday}</span><span style={{ whiteSpace: "nowrap" }}>{total}</span>
        </div>
      </div>
      <button className="nk-btn nk-btn--primary" onClick={onReserve} style={{ width: "100%", padding: 16, fontSize: 17 }}>{t.reserve}</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "9px 12px", borderRadius: 11, background: "var(--nk-green-tint)" }}>
        <Icon name="RefreshCcw" size={15} color="var(--nk-green)" stroke={2} />
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-green)", fontWeight: 500 }}>{t.freeCancellation}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", textAlign: "center" }}>
        <Icon name="ShieldCheck" size={15} color="var(--nk-text-muted)" stroke={2} />
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 12.5, color: "var(--nk-text-muted)" }}>{t.escrowNote}</span>
      </div>
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
  const stats: [string, string][] = [
    [rating ?? "—", t.hostStatRating],
    [String(ratingCount), t.hostStatReviews],
    [t.hostResponseTime, t.hostStatResponse],
    [t.hostMemberSince, t.hostStatMember],
  ];
  return (
    <div style={{ background: "var(--nk-surface)", borderRadius: 22, padding: 22, border: "1px solid var(--nk-border)", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <span className="nk-imgph" style={{ width: 58, height: 58, borderRadius: 29, flex: "none", border: "2px solid var(--nk-green-soft)" }}>
          {owner.avatar && <Image src={owner.avatar} alt={owner.name} fill sizes="58px" style={{ objectFit: "cover" }} />}
          {!owner.avatar && <Icon name="User" size={26} stroke={1.6} color="#5b6163" />}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-text)" }}>{owner.name}</span>
          {owner.verified && <Pill tone="green" icon="BadgeCheck">{t.verifiedOwnerPill}</Pill>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--nk-hairline)", borderRadius: 14, overflow: "hidden" }}>
        {stats.map(([v, k], i) => (
          <span key={k} style={{ background: "var(--nk-surface)", padding: "13px 14px", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-text)", whiteSpace: "nowrap" }}>
              {v}{i === 0 && rating && <Icon name="Star" size={13} color="var(--nk-yellow)" fill="var(--nk-yellow)" />}
            </span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 12, color: "var(--nk-text-muted)" }}>{k}</span>
          </span>
        ))}
      </div>
      <button className="nk-btn nk-btn--outline" onClick={onContact} style={{ width: "100%", padding: "13px 24px", fontSize: 15.5 }}>
        <Icon name="MessageCircle" size={17} color="var(--nk-text)" stroke={2} /> {t.hostMessage}
      </button>
      <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontFamily: "var(--nk-font-body)", fontSize: 12, color: "var(--nk-text-muted)", textAlign: "center" }}>
        <Icon name="Info" size={14} color="var(--nk-purple-hover)" stroke={2} /> {t.hostVerifiedNote}
      </span>
    </div>
  );
}

/* ---------------- Safety band ---------------- */
export function SafetyBand() {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div style={{ marginTop: 44, borderRadius: 22, background: "var(--nk-bg-deep)", border: "1px solid var(--nk-hairline)", padding: "clamp(24px,3vw,36px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <Icon name="ShieldCheck" size={22} color="var(--nk-green)" stroke={2} />
        <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 22, color: "var(--nk-text)" }}>{t.safetyHeading}</h2>
      </div>
      <div className="nk-safety-grid">
        {t.safetyItems.map((s) => (
          <div key={s.title} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <span style={{ width: 44, height: 44, borderRadius: 13, background: "var(--nk-green-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={s.icon} size={21} color="var(--nk-green)" stroke={2} />
            </span>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16.5, color: "var(--nk-text)" }}>{s.title}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, lineHeight: "21px", color: "var(--nk-text-muted)" }}>{s.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Mobile reserve bar ---------------- */
export function MobileBar({ price, deposit, onReserve }: { price: string; deposit: string; onReserve: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  return (
    <div className="nk-mbar">
      <span style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, color: "var(--nk-text)" }}>{price} <span style={{ fontFamily: "var(--nk-font-body)", fontWeight: 400, fontSize: 15, color: "var(--nk-text-2)" }}>{t.perDayShort}</span></span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)" }}>{deposit} {t.depositNoun}</span>
      </span>
      <button className="nk-btn nk-btn--primary" onClick={onReserve} style={{ padding: "14px 26px", fontSize: 16 }}>{t.reserveMobile}</button>
    </div>
  );
}

/* ---------------- Breadcrumb items helper ----------------
   Categories → (category search) → listing title. */
export function detailCrumbs({ category, title, categoriesLabel }: {
  category?: string; title: string; categoriesLabel: string;
}) {
  return [
    { label: categoriesLabel, href: "/kategorijos" },
    ...(category ? [{ label: category, href: listingSearchHref({ q: category }) }] : []),
    { label: title },
  ];
}
