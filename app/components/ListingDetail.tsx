"use client";
// Listing detail PAGE (web-native redesign of the app's listing screen).
// Browsing is real (data from the backend); reserve / contact / favorite are
// locked to the app via the redirect modal.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav, Footer } from "./sections";
import { Chrome } from "./Chrome";
import { Icon, IconName, Breadcrumb, Pill, openRedirect } from "./ui";
import { EmptyState } from "./cards";
import { useListing, formatPrice } from "@/app/lib/listings";
import { MOCK_BOOKING } from "@/app/lib/mock";
import { useI18n } from "./I18nProvider";

function GalleryTile({ src, big, children }: { src?: string; big?: boolean; children?: React.ReactNode }) {
  return (
    <div className="nk-imgph" data-img={src ? "" : undefined}
      style={{ borderRadius: big ? 18 : 14, position: "relative", backgroundImage: src ? `url("${src}")` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
      {!src && <Icon name="Image" size={big ? 64 : 34} stroke={1.4} className="nk-imgicon" />}
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, badge, badgeTone, last }: {
  icon: IconName; label: string; value: string; badge?: string; badgeTone?: "green" | "yellow"; last?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 0", borderBottom: last ? "none" : "1px solid var(--nk-border-faint)" }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, flex: "none", background: "var(--nk-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={21} stroke={2} color="var(--nk-accent-text)" />
      </span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-muted)" }}>{label}</span>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-text)" }}>{value}</span>
      </div>
      {badge && <Pill tone={badgeTone === "green" ? "green" : "yellow"}>{badge}</Pill>}
    </div>
  );
}

export function ListingDetail({ id }: { id: string }) {
  const { locale, dict } = useI18n();
  const t = dict.detail;
  const router = useRouter();
  const [descOpen, setDescOpen] = useState(false);
  const { data: listing, isLoading, isError, refetch } = useListing(id, locale);

  const shell = (children: React.ReactNode) => (
    <Chrome banner={false}>
      <div className="nk-page">
        <Nav onSearch={() => router.push("/skelbimai")} />
        <main className="nk-container" style={{ paddingBlock: "28px 140px" }}>{children}</main>
        <Footer />
      </div>
    </Chrome>
  );

  if (isLoading) {
    return shell(
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="nk-skel" style={{ width: 280, height: 24, borderRadius: 8 }} />
        <div className="nk-skel" style={{ width: "60%", height: 52, borderRadius: 10 }} />
        <div className="nk-skel" style={{ height: 520, borderRadius: 18 }} />
      </div>,
    );
  }
  if (isError || !listing) {
    return shell(<EmptyState icon="SearchX" title={t.loadErrorTitle} subtitle={t.loadErrorBody} actionLabel={dict.offers.errorAction} onAction={() => refetch()} />);
  }

  const category = listing.tags[0];
  const images = listing.images;
  const tiles = Array.from({ length: 5 }, (_, i) => images[i]);
  const extra = images.length > 5 ? images.length - 5 : 0;
  const lockFav = () => openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody });
  const lockShare = () => openRedirect({ title: dict.bridge.shareTitle, body: dict.bridge.shareBody });
  const reserve = () => openRedirect({ title: dict.bridge.reserveTitle, body: dict.bridge.reserveBody });
  const contact = () => openRedirect({ title: dict.bridge.contactTitle, body: dict.bridge.contactBody });
  const deposit = formatPrice(MOCK_BOOKING.depositCents, locale);

  return shell(
    <>
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: dict.feed.crumbCategories, href: "/kategorijos" }, { label: listing.title }]} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{listing.title}</h1>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--nk-font-body)", fontSize: 19, color: "var(--nk-text-2)" }}>
            <Icon name="MapPin" size={19} color="var(--nk-text-muted)" stroke={2} /> {[listing.city, category].filter(Boolean).join(" · ")}
          </span>
        </div>
        {listing.owner.verified && (
          <Pill tone="green" icon="BadgeCheck">{t.verifiedOwnerPill}</Pill>
        )}
      </div>

      {/* bento gallery */}
      <div className="nk-bento">
        <GalleryTile src={tiles[0]} big>
          <div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 12 }}>
            <button className="nk-fav" style={{ position: "static" }} onClick={lockFav} aria-label={dict.common.favorite}>
              <Icon name="Heart" size={20} color="var(--nk-text)" fill="none" stroke={2} />
            </button>
            <button className="nk-fav" style={{ position: "static" }} onClick={lockShare} aria-label={t.share}>
              <Icon name="MoreHorizontal" size={20} color="var(--nk-text)" />
            </button>
          </div>
        </GalleryTile>
        <GalleryTile src={tiles[1]} />
        <GalleryTile src={tiles[2]} />
        <GalleryTile src={tiles[3]} />
        <GalleryTile src={tiles[4]}>
          {extra > 0 && (
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(27,27,27,.55)", borderRadius: 14, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              <Icon name="LayoutGrid" size={20} color="#fff" stroke={2} /> {t.galleryMore(extra)}
            </span>
          )}
        </GalleryTile>
      </div>

      <div className="nk-detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 52, minWidth: 0 }}>
          {/* description */}
          <section>
            <h2 className="nk-detail-h">{t.descHeading}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 19, lineHeight: "32px", color: "var(--nk-text-2)", maxHeight: descOpen ? "none" : 96, overflow: "hidden", maskImage: descOpen ? "none" : "linear-gradient(180deg,#000 60%,transparent)", WebkitMaskImage: descOpen ? "none" : "linear-gradient(180deg,#000 60%,transparent)" }}>{listing.description}</p>
              {listing.description.length > 180 && (
                <button onClick={() => setDescOpen((v) => !v)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, color: "var(--nk-purple)" }}>
                  {descOpen ? t.descLess : t.descMore} <Icon name="ChevronDown" size={17} stroke={2.4} color="var(--nk-purple)" style={{ transform: descOpen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
                </button>
              )}
            </div>
          </section>

          {/* specs */}
          {listing.attributes.length > 0 && (
            <section>
              <h2 className="nk-detail-h">{t.specsHeading}</h2>
              <div className="nk-spec-grid">
                {listing.attributes.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", borderBottom: "1px solid var(--nk-border-faint)" }}>
                    <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 18, color: "var(--nk-text-muted)" }}>{a.label}</span>
                    <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-text)", textAlign: "right" }}>{a.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* owner */}
          <section>
            <h2 className="nk-detail-h">{t.ownerHeading}</h2>
            <div style={{ background: "var(--nk-surface)", borderRadius: 18, padding: 26, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <span className="nk-imgph" data-img={listing.owner.avatar ? "" : undefined} style={{ width: 76, height: 76, borderRadius: 38, flex: "none", border: "2px solid color-mix(in srgb, var(--nk-green) 50%, transparent)", backgroundImage: listing.owner.avatar ? `url("${listing.owner.avatar}")` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                {!listing.owner.avatar && <Icon name="User" size={32} stroke={1.6} color="#5b6163" />}
              </span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, color: "var(--nk-text)" }}>
                  {listing.owner.name} {listing.owner.verified && <Icon name="BadgeCheck" size={21} color="var(--nk-green)" stroke={2} />}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--nk-font-body)", fontSize: 17, color: "var(--nk-text-muted)", flexWrap: "wrap" }}>
                  {listing.owner.completedRentals > 0
                    ? <span>{t.ownerRentals(listing.owner.completedRentals)}</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--nk-yellow)" }}><Icon name="Sparkles" size={16} color="var(--nk-yellow)" stroke={2} /> {t.ownerNewMember}</span>}
                  {listing.owner.rating && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="Star" size={15} color="var(--nk-yellow)" fill="var(--nk-yellow)" /> {listing.owner.rating}</span>}
                </span>
              </div>
              <button className="nk-btn nk-btn--ghost" onClick={contact} style={{ borderColor: "var(--nk-border)" }}>
                <Icon name="MessageCircle" size={18} color="var(--nk-text)" stroke={2} /> {t.contact}
              </button>
            </div>
          </section>

          {/* handover */}
          <section>
            <h2 className="nk-detail-h">{t.handoverHeading}</h2>
            <div className="nk-tworow">
              <div><InfoRow icon="MapPin" label={t.pickupLabel} value={listing.city || "—"} badge={t.pickupFree} badgeTone="green" last /></div>
              <div><InfoRow icon="Car" label={t.deliveryLabel} value={t.deliveryByArrangement} last /></div>
            </div>
          </section>

          {/* terms */}
          <section>
            <h2 className="nk-detail-h">{t.termsHeading}</h2>
            <div className="nk-tworow">
              <div>
                <InfoRow icon="Tag" label={t.priceLabel} value={`${listing.price} ${t.perDay}`} />
                <InfoRow icon="ShieldCheck" label={t.depositLabel} value={deposit} last />
              </div>
              <div>
                <InfoRow icon="RefreshCcw" label={t.refundLabel} value={t.refundValue} />
                <InfoRow icon="Calendar" label={t.durationLabel} value={t.durationValue} last />
              </div>
            </div>
          </section>

          {/* reviews */}
          <section>
            <h2 className="nk-detail-h">{t.reviewsHeading}</h2>
            <div style={{ background: "var(--nk-surface)", borderRadius: 18, padding: "30px 28px", display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ width: 56, height: 56, borderRadius: 28, flex: "none", background: "var(--nk-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="MessageCircle" size={26} color="var(--nk-accent-text)" stroke={2} />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 20, color: "var(--nk-text)" }}>{t.reviewsEmptyTitle}</span>
                <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 17, color: "var(--nk-text-2)" }}>{t.reviewsEmptyBody}</span>
              </div>
            </div>
          </section>
        </div>

        {/* booking panel (desktop) */}
        <aside className="nk-reserve">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 38, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{listing.price}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 19, color: "var(--nk-text-2)", whiteSpace: "nowrap" }}>{t.perDay}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--nk-font-body)", fontSize: 17, color: "var(--nk-text-2)" }}>
              <span>{t.depositReturnable}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{deposit}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--nk-font-body)", fontSize: 17, color: "var(--nk-text-2)" }}>
              <span>{t.durationLabel}</span><span style={{ color: "var(--nk-text)", whiteSpace: "nowrap" }}>{t.durationValue}</span>
            </div>
          </div>
          <button className="nk-btn nk-btn--primary" onClick={reserve} style={{ width: "100%", padding: 18, fontSize: 19 }}>{t.reserve}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", textAlign: "center" }}>
            <Icon name="ShieldCheck" size={18} color="var(--nk-green)" stroke={2} />
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)" }}>{t.escrowNote}</span>
          </div>
        </aside>
      </div>

      {/* mobile reserve bar */}
      <div className="nk-mbar">
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, color: "#fff" }}>{listing.price} <span style={{ fontFamily: "var(--nk-font-body)", fontWeight: 400, fontSize: 17 }}>{t.perDay}</span></span>
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "rgba(255,255,255,.85)" }}>{deposit} {t.depositLabel.toLowerCase()}</span>
        </span>
        <button onClick={reserve} style={{ background: "var(--nk-yellow)", color: "var(--nk-bg-deep)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 18, borderRadius: 16, padding: "16px 28px" }}>{t.reserveMobile}</button>
      </div>
    </>,
  );
}
