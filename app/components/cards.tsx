"use client";
// Naudokis UI kit — card components.
import { useState } from "react";
import { Icon, IconName, LocationChip, Rating, Dots, RoundArrow } from "./ui";
import { useI18n } from "./I18nProvider";

/* ---------------- Offer / listing card ---------------- */
export function OfferCard({
  title = "Dodge RAM 2016", city, price, unit, rating, count, img, onOpen,
}: {
  title?: string;
  city?: string;
  price?: string;
  unit?: string;
  rating?: string;
  count?: string;
  img?: string;
  onOpen?: () => void;
}) {
  const { dict } = useI18n();
  const c = dict.common;
  const [fav, setFav] = useState(false);
  return (
    <article className="nk-offer" style={{ background: "var(--nk-surface)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="nk-offer__media nk-imgph" data-img={img ? "" : undefined}
        style={{ height: 330, borderRadius: "8px 8px 0 0", backgroundImage: img ? `url("${img}")` : undefined }}>
        {img && <div className="nk-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `url("${img}")`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 2 }}><LocationChip city={city ?? c.sampleCity} /></div>
        <button className={"nk-fav" + (fav ? " nk-on" : "")} onClick={() => setFav((v) => !v)} aria-label={c.favorite} aria-pressed={fav}>
          <Icon name="Heart" size={20} color={fav ? "var(--nk-yellow)" : "var(--nk-text)"} fill={fav ? "var(--nk-yellow)" : "none"} stroke={2} />
        </button>
        {!img && <Icon name="Image" size={64} stroke={1.5} className="nk-imgicon" />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 2 }}>
          <span style={{ background: "rgba(40,44,45,.6)", borderRadius: 23, padding: "8px 14px", backdropFilter: "blur(4px)" }}>
            <Dots n={4} active={0} />
          </span>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 className="nk-h-card" style={{ margin: 0 }}>{title}</h3>
        {rating && <Rating value={rating} count={count} />}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 8 }}>
          <span className="nk-price">{price ?? c.samplePrice}&nbsp; {unit ?? c.perDay}</span>
          <RoundArrow variant="solid" onClick={onOpen} />
        </div>
      </div>
    </article>
  );
}

/* ---------------- Category card ---------------- */
export function CategoryCard({
  title = "Transporto priemonės", tint = "#3a3450", onOpen,
}: {
  title?: string;
  tint?: string;
  onOpen?: () => void;
}) {
  return (
    <div className="nk-cat" onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen?.(); }}
      style={{ position: "relative", height: 348, borderRadius: 8, overflow: "hidden", textAlign: "left", cursor: "pointer", width: "100%" }}>
      <div className="nk-cat__img" style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${tint}, #232728)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="Image" size={56} stroke={1.5} className="nk-imgicon" />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(27,27,27,.45), rgba(27,27,27,.05) 40%, rgba(27,27,27,.55))" }} />
      <h3 className="nk-h-card" style={{ position: "absolute", left: 20, top: 16, margin: 0, maxWidth: 180 }}>{title}</h3>
      <span className="nk-cat__arrow nk-round nk-round--outline" style={{ position: "absolute", right: 20, bottom: 20 }}>
        <Icon name="ArrowRight" size={20} stroke={2} color="var(--nk-text)" />
      </span>
    </div>
  );
}

/* ---------------- Feature card (glass) ---------------- */
export function FeatureCard({
  icon = "ShieldCheck", title, body,
}: {
  icon?: IconName;
  title: string;
  body: string;
}) {
  return (
    <div className="nk-feature" style={{
      flex: 1, borderRadius: 8, background: "var(--nk-glass-strong)", backdropFilter: "var(--nk-blur)",
      padding: "56px 56px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 36, textAlign: "center",
    }}>
      <span style={{ width: 72, height: 72, borderRadius: 36, background: "var(--nk-surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={36} color="var(--nk-yellow)" stroke={2} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 className="nk-h-card" style={{ margin: 0 }}>{title}</h3>
        <p className="nk-body" style={{ margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

/* ---------------- Testimonial ---------------- */
export function Testimonial({
  name = "Eglė J.", quote, avatarTint = "#C1C1C1",
}: {
  name?: string;
  quote: string;
  avatarTint?: string;
}) {
  return (
    <div style={{ flex: 1, background: "var(--nk-surface)", borderRadius: 8, padding: "56px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <span className="nk-imgph" style={{ width: 60, height: 60, borderRadius: "50%", background: avatarTint }}>
          <Icon name="User" size={26} stroke={1.6} color="#5b6163" />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="nk-h-row">{name}</span>
          <span style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="Star" size={16} color="var(--nk-yellow)" fill="var(--nk-yellow)" />)}
          </span>
        </div>
      </div>
      <p className="nk-body" style={{ margin: 0 }}>{quote}</p>
    </div>
  );
}

/* ---------------- FAQ accordion row ---------------- */
export function FaqRow({
  q, a, open, onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="nk-faq" style={{
      border: "1px solid " + (open ? "var(--nk-purple)" : "var(--nk-border-soft)"),
      borderRadius: open ? 24 : 46, background: "var(--nk-surface)", transition: "border-radius .2s ease, border-color .2s ease, background .2s ease",
      overflow: "hidden",
    }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, padding: "20px 20px 20px 40px", textAlign: "left" }}>
        <span className="nk-h-row">{q}</span>
        <span style={{ width: 44, height: 44, borderRadius: 22, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}>
          <Icon name="ChevronDown" size={22} color="var(--nk-purple)" stroke={2.2} />
        </span>
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, padding: "0 64px 24px 40px", fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)" }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skeleton listing card ---------------- */
export function OfferCardSkeleton() {
  return (
    <article aria-hidden="true" style={{ background: "var(--nk-surface)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="nk-skel" style={{ height: 330, borderRadius: "8px 8px 0 0" }}>
        <div className="nk-skel" style={{ position: "absolute", top: 20, left: 20, width: 96, height: 33, borderRadius: 18, background: "rgba(27,27,27,.35)" }} />
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="nk-skel" style={{ width: "70%", height: 26 }} />
        <div className="nk-skel" style={{ width: "48%", height: 18 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div className="nk-skel" style={{ width: 130, height: 20 }} />
          <div className="nk-skel" style={{ width: 44, height: 44, borderRadius: 22 }} />
        </div>
      </div>
    </article>
  );
}

/* ---------------- Skeleton category card ---------------- */
export function CategoryCardSkeleton() {
  return (
    <div aria-hidden="true" className="nk-skel" style={{ height: 348, borderRadius: 8, position: "relative" }}>
      <div className="nk-skel" style={{ position: "absolute", top: 16, left: 20, width: "55%", height: 26, background: "rgba(27,27,27,.3)" }} />
      <div className="nk-skel" style={{ position: "absolute", right: 20, bottom: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(27,27,27,.3)" }} />
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon = "SearchX", title, subtitle, actionLabel, onAction,
}: {
  icon?: IconName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="nk-empty">
      <span className="nk-empty__icon"><Icon name={icon} size={40} stroke={1.8} color="var(--nk-text-muted)" /></span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, lineHeight: "30px", color: "var(--nk-text)" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "28px", color: "var(--nk-text-2)" }}>{subtitle}</p>
      </div>
      {actionLabel && <button className="nk-btn nk-btn--outline" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
