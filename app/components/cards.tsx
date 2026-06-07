"use client";
// Naudokis UI kit — card components.
import Link from "next/link";
import { Icon, IconName, IllusName, Illustration, Dots, openRedirect } from "./ui";
import { useI18n } from "./I18nProvider";

/* ---------------- Offer / listing card ----------------
   Final design: price hierarchy + hairline divider, locked favorite (opens the
   app modal), and a stretched <Link> covering the card for real navigation. */
export function OfferCard({
  title = "Dodge RAM 2016", city, price, unit, rating, count, img, href,
}: {
  title?: string;
  city?: string;
  price?: string;
  unit?: string;
  rating?: string;
  count?: string;
  img?: string;
  href?: string;
}) {
  const { dict } = useI18n();
  const c = dict.common;
  const lockFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody });
  };
  return (
    <article className="nk-offer" style={{ position: "relative", background: "var(--nk-surface)", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", cursor: href ? "pointer" : "default" }}>
      {href && <Link href={href} className="nk-stretch" aria-label={title} />}
      <div className="nk-offer__media nk-imgph" data-img={img ? "" : undefined}
        style={{ height: 330, borderRadius: "24px 24px 0 0", backgroundImage: img ? `url("${img}")` : undefined }}>
        {img && <div className="nk-zoom" style={{ position: "absolute", inset: 0, backgroundImage: `url("${img}")`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        <button className="nk-fav" onClick={lockFav} aria-label={c.favorite}>
          <Icon name="Heart" size={20} color="var(--nk-text)" fill="none" stroke={2} />
        </button>
        {!img && <Icon name="Image" size={64} stroke={1.5} className="nk-imgicon" />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 2, pointerEvents: "none" }}>
          <span style={{ background: "rgba(40,44,45,.6)", borderRadius: 23, padding: "8px 14px", backdropFilter: "blur(4px)" }}>
            <Dots n={4} active={0} />
          </span>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, lineHeight: "30px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--nk-text)" }}>{title}</h3>
        {/* meta row: rating + count on the left, location pin + city on the right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", minHeight: 24 }}>
          {rating ? (
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <b style={{ fontFamily: "var(--nk-font-body)", fontWeight: 700, fontSize: 18, color: "var(--nk-text-2)" }}>{rating}</b>
                <Icon name="Star" size={18} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
              </span>
              {count && <span className="nk-meta" style={{ color: "var(--nk-text-muted)" }}>({count})</span>}
            </span>
          ) : <span />}
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--nk-font-body)", fontWeight: 500, fontSize: 18, color: "var(--nk-text-2)" }}>
            <Icon name="MapPin" size={18} color="var(--nk-text)" fill="var(--nk-text)" stroke={2} /> {city ?? c.sampleCity}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--nk-border)" }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{price ?? c.samplePrice}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", whiteSpace: "nowrap" }}>{unit ?? c.perDay}</span>
          </span>
          <span className="nk-round nk-round--solid" aria-hidden="true">
            <Icon name="ArrowRight" size={20} stroke={2} color="var(--nk-text)" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Category tile (all-categories page) ---------------- */
export function CategoryTile({
  title, count, href,
}: {
  title: string;
  count: string;
  href: string;
}) {
  return (
    <div className="nk-cat">
      <Link href={href} className="nk-stretch" aria-label={title} />
      <div className="nk-cat__img">
        <Icon name="Image" size={52} stroke={1.5} className="nk-imgicon" />
      </div>
      <div className="nk-cat__overlay" />
      <div className="nk-cat__content">
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "28px", color: "var(--nk-text)" }}>{title}</span>
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-2)" }}>{count}</span>
        </span>
        <span className="nk-cat__arrow nk-round nk-round--outline" style={{ flex: "none" }} aria-hidden="true">
          <Icon name="ArrowRight" size={20} stroke={2} color="var(--nk-text)" />
        </span>
      </div>
    </div>
  );
}

/* ---------------- Category card ---------------- */
export function CategoryCard({
  title, href,
}: {
  title: string;
  href: string;
}) {
  return (
    <div className="nk-cat">
      <Link href={href} className="nk-stretch" aria-label={title} />
      <div className="nk-cat__img">
        <Icon name="Image" size={52} stroke={1.5} className="nk-imgicon" />
      </div>
      <div className="nk-cat__overlay" />
      <div className="nk-cat__content">
        <h3 className="nk-h-row" style={{ margin: 0 }}>{title}</h3>
        <span className="nk-cat__arrow nk-round nk-round--outline" style={{ flex: "none" }} aria-hidden="true">
          <Icon name="ArrowRight" size={20} stroke={2} color="var(--nk-text)" />
        </span>
      </div>
    </div>
  );
}

/* ---------------- Feed interruption banner (app-redirect CTA) ---------------- */
export function InterruptionBanner() {
  const { dict } = useI18n();
  const t = dict.feed;
  return (
    <div className="nk-interrupt" style={{ gridColumn: "1 / -1" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/section-pattern.png" alt="" aria-hidden="true" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
      <span style={{ position: "relative", width: 64, height: 64, borderRadius: 18, flex: "none", background: "var(--nk-purple-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/naudokis/logo-mark.svg" alt="" style={{ width: 40, height: 40 }} />
      </span>
      <div style={{ position: "relative", flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", color: "var(--nk-text)" }}>{t.interruptTitle}</h3>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "26px", color: "var(--nk-text-2)", maxWidth: 520 }}>{t.interruptBody}</p>
      </div>
      <button className="nk-btn nk-btn--primary" style={{ position: "relative", padding: "16px 28px" }}
        onClick={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })}>
        {t.interruptCta}
      </button>
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
      flex: 1, borderRadius: 24, background: "var(--nk-glass-strong)", backdropFilter: "var(--nk-blur)", border: "1px solid var(--nk-hairline)",
      padding: "var(--nk-block-pad)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-stack-lg)", textAlign: "center",
    }}>
      <span style={{ width: 72, height: 72, borderRadius: 36, background: "var(--nk-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  name, role, quote, avatarTint,
}: {
  name: string;
  role?: string;
  quote: string;
  avatarTint: string;
}) {
  return (
    <div style={{ flex: 1, background: "var(--nk-surface)", borderRadius: 16, padding: "var(--nk-block-pad)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <span className="nk-imgph" style={{ width: 60, height: 60, borderRadius: "50%", background: avatarTint }}>
          <Icon name="User" size={26} stroke={1.6} color="#5b6163" />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="nk-h-row">{name}</span>
          {role && <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)" }}>{role}</span>}
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
      borderRadius: open ? 24 : 20, background: "var(--nk-surface)", transition: "border-radius .2s ease, border-color .2s ease, background .2s ease",
      overflow: "hidden",
    }}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, padding: "20px 20px 20px 40px", textAlign: "left" }}>
        <span className="nk-h-row">{q}</span>
        <span style={{ width: 44, height: 44, borderRadius: 22, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}>
          <Icon name="ChevronDown" size={22} color={open ? "var(--nk-purple)" : "var(--nk-text)"} stroke={2.2} />
        </span>
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, padding: "0 40px 24px 40px", fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)" }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skeleton listing card ---------------- */
export function OfferCardSkeleton() {
  return (
    <article aria-hidden="true" style={{ background: "var(--nk-surface)", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="nk-skel" style={{ height: 330, borderRadius: "24px 24px 0 0" }}>
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
    <div aria-hidden="true" className="nk-skel" style={{ height: 300, borderRadius: "var(--nk-r-card)", position: "relative" }}>
      <div className="nk-skel" style={{ position: "absolute", top: 16, left: 20, width: "55%", height: 26, background: "rgba(27,27,27,.3)" }} />
      <div className="nk-skel" style={{ position: "absolute", right: 20, bottom: 20, width: 44, height: 44, borderRadius: 22, background: "rgba(27,27,27,.3)" }} />
    </div>
  );
}

/* ---------------- Empty state ----------------
   Screen-level empties show the floating brand illustration (pass `illustration`);
   if only an `icon` is given, the compact badge is used instead. The primary
   action can be styled solid (`actionPrimary`, e.g. "Bandyti dar kartą") and an
   optional outline `secondaryLabel` sits beside it (e.g. the empty-category L4
   "Išnuomoti daiktą" + "Visos kategorijos" pairing). */
export function EmptyState({
  illustration, icon = "SearchX", title, subtitle,
  actionLabel, onAction, actionPrimary = false, actionIcon,
  secondaryLabel, onSecondaryAction,
}: {
  illustration?: IllusName;
  icon?: IconName;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionPrimary?: boolean;
  actionIcon?: IconName;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}) {
  return (
    <div className="nk-empty">
      {illustration
        ? <Illustration name={illustration} />
        : <span className="nk-empty__icon"><Icon name={icon} size={40} stroke={1.8} color="var(--nk-text-muted)" /></span>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 460 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, lineHeight: "30px", color: "var(--nk-text)" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "28px", color: "var(--nk-text-2)" }}>{subtitle}</p>
      </div>
      {(actionLabel || secondaryLabel) && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {actionLabel && (
            <button className={"nk-btn " + (actionPrimary ? "nk-btn--primary" : "nk-btn--outline")} onClick={onAction}>
              {actionIcon && <Icon name={actionIcon} size={18} stroke={2.2} color="var(--nk-text)" />}
              {actionLabel}
            </button>
          )}
          {secondaryLabel && <button className="nk-btn nk-btn--outline" onClick={onSecondaryAction}>{secondaryLabel}</button>}
        </div>
      )}
    </div>
  );
}

/* ---------------- Section-level empty ----------------
   Compact horizontal surface card for an empty BAND inside a longer page (home
   Categories/Offers, listing reviews). No big dashed box / floating illustration
   — a small tinted icon disk carries it. Mirrors the app's EmptyState
   variant="section". */
const SECTION_EMPTY_TONES: Record<"purple" | "yellow" | "green", { bg: string; fg: string }> = {
  purple: { bg: "var(--nk-purple-tag)", fg: "var(--nk-purple-hover)" },
  yellow: { bg: "var(--nk-yellow-tint)", fg: "var(--nk-yellow)" },
  green: { bg: "var(--nk-green-tint)", fg: "var(--nk-green)" },
};

export function SectionEmpty({
  icon = "Inbox", title, subtitle, actionLabel, onAction, tone = "purple",
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "purple" | "yellow" | "green";
}) {
  const c = SECTION_EMPTY_TONES[tone];
  return (
    <div style={{ background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: 24, padding: "26px 28px", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <span style={{ width: 60, height: 60, borderRadius: 30, flex: "none", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={27} color={c.fg} stroke={2} />
      </span>
      <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, lineHeight: "26px", color: "var(--nk-text)" }}>{title}</span>
        {subtitle && <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "25px", color: "var(--nk-text-2)" }}>{subtitle}</span>}
      </div>
      {actionLabel && <button className="nk-btn nk-btn--outline" onClick={onAction} style={{ flex: "none" }}>{actionLabel}</button>}
    </div>
  );
}
