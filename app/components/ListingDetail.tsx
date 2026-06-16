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
import { useI18n } from "./I18nProvider";

/* ---------------- Shared primitives ---------------- */
function Section({ id, title, sub, first, children }: {
  id: string; title: string; sub?: string; first?: boolean; children: React.ReactNode;
}) {
  return (
    <section id={id} className="nk-sec" style={{ paddingTop: first ? 0 : 44, borderTop: first ? "none" : "1px solid var(--nk-hairline)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: sub ? "var(--nk-gap-2xs)" : 0, marginBottom: "var(--nk-gap-xl)" }}>
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
    <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
      <span style={{ width: 46, height: 46, borderRadius: 13, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} stroke={2} color="var(--nk-purple-hover)" />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", minWidth: 0 }}>
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
    <div className="nk-imgph nk-gtile" style={{ borderRadius: "var(--nk-r-tile)", position: "relative" }}>
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
// Mirrors the real <Section> chrome (top hairline + 44px pad on every section but the first,
// 25px-ish title with a 24px gap to the content) so the focus column shares its exact rhythm.
function SkelSection({ first, titleW = 200, children }: { first?: boolean; titleW?: number | string; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: first ? 0 : 44, borderTop: first ? "none" : "1px solid var(--nk-hairline)" }}>
      <Skel w={titleW} h={26} r={9} style={{ marginBottom: 24 }} />
      {children}
    </div>
  );
}
export function ListingSkeleton() {
  const card: React.CSSProperties = { borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" };
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
        <Skel r={16} h="100%" />
        <Skel h="100%" r={16} /><Skel h="100%" r={16} /><Skel h="100%" r={16} /><Skel h="100%" r={16} />
      </div>
      {/* focus column + reserve sidebar */}
      <div className="nk-detail-grid">
        {/* DetailBody: description → specs → handover → terms → reviews (gap:0, divided by SkelSection) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0 }}>
          {/* description */}
          <SkelSection first titleW={170}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
              <SkelLines rows={4} last="45%" />
              <Skel w={110} h={22} r={8} />
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
          {/* terms — 4 fact cards + green info box */}
          <SkelSection titleW={180}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div className="nk-hl-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", padding: "var(--nk-card-pad-sm)", borderRadius: 16, background: "var(--nk-surface-glass)", border: "1px solid var(--nk-border)" }}>
                    <Skel w={46} h={46} r={13} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><Skel w="70%" h={15} /><Skel w="90%" h={13} /></div>
                  </div>
                ))}
              </div>
              <Skel h={52} r={14} />
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
          <div style={{ ...card, background: "var(--nk-surface)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Skel w={130} h={32} r={9} /><Skel w={70} h={16} /></div>
            <div style={{ display: "flex", gap: 10 }}><Skel h={56} r={13} /><Skel h={56} r={13} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><Skel w="55%" h={14} /><Skel w={48} h={14} /></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><Skel w="40%" h={14} /><Skel w={40} h={14} /></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><Skel w="50%" h={14} /><Skel w={48} h={14} /></div>
              <span style={{ height: 1, background: "var(--nk-divider)", margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}><Skel w="35%" h={17} /><Skel w={64} h={17} /></div>
            </div>
            <Skel h={52} r={25} />
            <Skel h={36} r={11} w="90%" style={{ alignSelf: "center" }} />
            <Skel h={16} r={8} w="70%" style={{ alignSelf: "center" }} />
          </div>
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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "var(--nk-gap-xl)", flexWrap: "wrap", marginBottom: "var(--nk-gap-xl)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 4vw, 50px)", lineHeight: 1.04, letterSpacing: "-0.015em", color: "var(--nk-text)", textWrap: "balance" }}>{listing.title}</h1>
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
              <span style={metaItem}><Icon name="MapPin" size={16} color="var(--nk-text-muted)" stroke={2} /> {listing.city}</span>
              {listing.owner.verified && <Dot />}
            </>
          )}
          {listing.owner.verified && (
            <span style={metaItem}><Icon name="BadgeCheck" size={16} color="var(--nk-green)" stroke={2} /> <span style={{ color: "var(--nk-green)", fontWeight: 600, fontFamily: "var(--nk-font-display)" }}>{t.verifiedOwnerPill}</span></span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--nk-gap-sm)", flex: "none" }}>
        <button className="nk-lfield" style={headerBtn} onClick={onShare} title={dict.bridge.opensAppHint}><Icon name="ArrowUpDown" size={17} stroke={2} color="var(--nk-text)" style={{ transform: "rotate(45deg)" }} /> {t.share}</button>
        <button className="nk-lfield" style={headerBtn} onClick={onFav} title={dict.bridge.opensAppHint}><Icon name="Heart" size={17} stroke={2} color={saved ? "var(--nk-orange)" : "var(--nk-text)"} fill={saved ? "var(--nk-orange)" : "none"} /> {t.save}</button>
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
        <span className="nk-gtile__hint" style={{ position: "absolute", inset: 0, borderRadius: "var(--nk-r-tile)", background: "rgba(20,22,23,.18)" }} />
      </GalleryTile>
      <GalleryTile src={tiles[1]} alt={alt(1)} />
      <GalleryTile src={tiles[2]} alt={alt(2)} />
      <GalleryTile src={tiles[3]} alt={alt(3)} />
      <GalleryTile src={tiles[4]} alt={alt(4)}>
        <button onClick={onMore} style={{ position: "absolute", right: 14, bottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "var(--nk-overlay)", backdropFilter: "blur(12px)", border: "1px solid var(--nk-border-strong)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--nk-text)" }}>
          <Icon name="LayoutGrid" size={16} color="var(--nk-text)" stroke={2} /> {extra > 0 ? t.galleryMore(extra) : t.galleryAll(Math.max(images.length, 1))}
        </button>
      </GalleryTile>
    </div>
  );
}

/* ---------------- Focus-column content sections ---------------- */
function DescriptionSection({ description }: { description: string }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [open, setOpen] = useState(false);
  return (
    <Section id="aprasymas" title={t.descHeading} first>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-lg)", maxWidth: 720 }}>
        <p className="nk-prose" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "30px", color: "var(--nk-text-2)", textWrap: "pretty", maxHeight: open ? "none" : 120, overflow: "hidden", maskImage: open ? "none" : "linear-gradient(180deg,#000 64%,transparent)", WebkitMaskImage: open ? "none" : "linear-gradient(180deg,#000 64%,transparent)" }}>{description}</p>
        {description.length > 180 && (
          <button onClick={() => setOpen((v) => !v)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "var(--nk-gap-xs)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--nk-purple-hover)" }}>
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
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--nk-gap-md)", padding: "15px 0", borderBottom: "1px solid var(--nk-divider)" }}>
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
      <div className="nk-tworow" style={{ alignItems: "stretch", gap: "var(--nk-gap-xl)" }}>
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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "var(--nk-gap-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)" }}>
            <span style={{ width: "var(--nk-size-icon-sm)", height: "var(--nk-size-icon-sm)", borderRadius: 12, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="MapPin" size={20} stroke={2} color="var(--nk-purple-hover)" /></span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)" }}>
              <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)" }}>{t.pickupLabel}</span>
              <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{city || "—"}</span>
            </div>
            <Pill tone="green">{t.pickupFree}</Pill>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)" }}>
            <span style={{ width: "var(--nk-size-icon-sm)", height: "var(--nk-size-icon-sm)", borderRadius: 12, flex: "none", background: "var(--nk-purple-tag)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="Car" size={20} stroke={2} color="var(--nk-purple-hover)" /></span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)" }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xl)" }}>
        <div className="nk-hl-grid">
          <FactCard icon="Tag" title={`${price} ${t.perDay}`} sub={t.termRentSub} />
          <FactCard icon="ShieldCheck" title={`${deposit} ${t.depositNoun}`} sub={t.termDepositSub} />
          <FactCard icon="Calendar" title={t.termDuration} sub={t.termDurationSub} />
          <FactCard icon="RefreshCcw" title={t.termCancel} sub={t.termCancelSub} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", padding: "var(--nk-card-pad-sm)", borderRadius: 14, background: "var(--nk-green-tint)", border: "1px solid var(--nk-green-soft)" }}>
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
                  <span style={{ width: 34, textAlign: "right", fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>{pct}%</span>
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
                <Icon name="User" size={20} stroke={1.6} color="var(--nk-avatar-icon)" />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{r.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-xs)" }}>
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
    <div style={{ background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-2)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--nk-gap-xs)" }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 33, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{listing.price}</span>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-2)" }}>{t.perDay}</span>
        {listing.rating && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-2)", whiteSpace: "nowrap" }}>
            <Icon name="Star" size={14} color="var(--nk-yellow)" fill="var(--nk-yellow)" /> {listing.rating} · {listing.ratingCount}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "var(--nk-gap-sm)" }}>
        <DateField label={t.dateFrom} value={t.sampleDateFrom} onPick={onPickDates} />
        <DateField label={t.dateTo} value={t.sampleDateTo} onPick={onPickDates} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--nk-gap-sm)", fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-2)" }}>
          <span>{t.lineItem(listing.price, days)}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{subtotal}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--nk-gap-sm)", fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-2)" }}>
          <span title={t.serviceFeeHint} style={{ textDecoration: "underline dotted", textUnderlineOffset: 3, cursor: "help" }}>{t.serviceFee}</span><span style={{ color: "var(--nk-green)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.serviceFeeFree}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--nk-gap-sm)", fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>
          <span>{t.depositReturnable}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{deposit}</span>
        </div>
        <span style={{ height: 1, background: "var(--nk-divider)", margin: "2px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--nk-gap-sm)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-text)" }}>
          <span style={{ whiteSpace: "nowrap" }}>{t.totalToday}</span><span style={{ whiteSpace: "nowrap" }}>{total}</span>
        </div>
      </div>
      <button className="nk-btn nk-btn--primary" onClick={onReserve} title={dict.bridge.opensAppHint} style={{ width: "100%", padding: 16, fontSize: 17 }}>
        <Icon name="Smartphone" size={17} stroke={2.2} color="var(--nk-text)" /> {t.reserve}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-xs)", justifyContent: "center", padding: "9px 12px", borderRadius: 11, background: "var(--nk-green-tint)" }}>
        <Icon name="RefreshCcw" size={15} color="var(--nk-green)" stroke={2} />
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-green)", fontWeight: 500 }}>{t.freeCancellation}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-xs)", justifyContent: "center", textAlign: "center" }}>
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
    <div style={{ background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad-sm)", border: "1px solid var(--nk-border)", boxShadow: "var(--nk-edge-top)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)" }}>
        <span className="nk-imgph" style={{ width: 58, height: 58, borderRadius: 29, flex: "none", border: "2px solid var(--nk-green-soft)" }}>
          {owner.avatar && <Image src={owner.avatar} alt={owner.name} fill sizes="58px" style={{ objectFit: "cover" }} />}
          {!owner.avatar && <Icon name="User" size={26} stroke={1.6} color="var(--nk-avatar-icon)" />}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)", minWidth: 0 }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-text)" }}>{owner.name}</span>
          {owner.verified && <Pill tone="green" icon="BadgeCheck">{t.verifiedOwnerPill}</Pill>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--nk-hairline)", borderRadius: 14, overflow: "hidden" }}>
        {stats.map(([v, k], i) => (
          <span key={k} style={{ background: "var(--nk-surface)", padding: "13px 14px", display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-text)", whiteSpace: "nowrap" }}>
              {v}{i === 0 && rating && <Icon name="Star" size={13} color="var(--nk-yellow)" fill="var(--nk-yellow)" />}
            </span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 12, color: "var(--nk-text-muted)" }}>{k}</span>
          </span>
        ))}
      </div>
      <button className="nk-btn nk-btn--outline" onClick={onContact} title={dict.bridge.opensAppHint} style={{ width: "100%", padding: "13px 24px", fontSize: 15.5 }}>
        <Icon name="MessageCircle" size={17} color="var(--nk-text)" stroke={2} /> {t.hostMessage}
      </button>
      <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-xs)", justifyContent: "center", fontFamily: "var(--nk-font-body)", fontSize: 12, color: "var(--nk-text-muted)", textAlign: "center" }}>
        <Icon name="Info" size={14} color="var(--nk-purple-hover)" stroke={2} /> {t.hostVerifiedNote}
      </span>
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
      <button className="nk-btn nk-btn--primary" onClick={onReserve} title={dict.bridge.opensAppHint} style={{ padding: "14px 26px", fontSize: 16 }}>
        <Icon name="Smartphone" size={16} stroke={2.2} color="var(--nk-text)" /> {t.reserveMobile}
      </button>
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
