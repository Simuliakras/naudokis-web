"use client";
// Naudokis UI kit — card components.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon, IconName, IllusName, Illustration, Dots, Pill, openRedirect, Pattern } from "./ui";
import { useI18n } from "./I18nProvider";

/* ---------------- Offer / listing card ----------------
   Final design: price hierarchy + hairline divider, locked favorite (opens the
   app modal), and a stretched <Link> covering the card for real navigation. */
export function OfferCard({
  title = "Dodge RAM 2016", city, price, unit, rating, count, img, href, category, categoryIcon = "Tag",
}: {
  title?: string;
  city?: string;
  price?: string;
  unit?: string;
  rating?: string;
  count?: string;
  img?: string;
  href?: string;
  category?: string; // top-level category id — tints the empty-photo placeholder
  categoryIcon?: IconName; // glyph for the empty-photo placeholder (from Category.icon)
}) {
  const { dict } = useI18n();
  const c = dict.common;
  const lockFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openRedirect({ title: dict.bridge.favoriteTitle, body: dict.bridge.favoriteBody });
  };
  return (
    <article className="nk-offer" style={{ position: "relative", background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", overflow: "hidden", display: "flex", flexDirection: "column", cursor: href ? "pointer" : "default" }}>
      {href && <Link href={href} className="nk-stretch" aria-label={title} />}
      <div className={"nk-offer__media nk-imgph" + (img ? "" : " nk-offer__media--empty")}
        data-cat={img ? undefined : category} style={{ aspectRatio: "5 / 4", borderRadius: "24px 24px 0 0" }}>
        {img && (
          <Image src={img} alt={title} fill className="nk-zoom"
            sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px"
            style={{ objectFit: "cover" }} />
        )}
        <button className="nk-fav" onClick={lockFav} title={dict.bridge.opensAppHint}
          aria-label={`${c.favorite} (${dict.bridge.opensAppHint})`}>
          <Icon name="Heart" size={22} color="var(--nk-text)" fill="none" stroke={2} />
        </button>
        {!img && <Icon name={categoryIcon} size={56} stroke={1.5} className="nk-imgicon" />}
        {/* carousel dots imply pageable photos — only show them over a real image,
            never over the empty-photo placeholder (reads as unfinished otherwise) */}
        {img && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", zIndex: 2, pointerEvents: "none" }}>
            <span style={{ background: "rgba(40,44,45,.6)", borderRadius: 23, padding: "8px 14px", backdropFilter: "blur(4px)" }}>
              <Dots n={4} active={0} />
            </span>
          </div>
        )}
      </div>
      <div className="nk-offer__body" style={{ flex: 1, padding: "var(--nk-card-pad) var(--nk-card-pad) calc(var(--nk-card-pad) * 0.6)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)" }}>
        <h3 title={title} style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, lineHeight: "26px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--nk-text)" }}>{title}</h3>
        {/* meta row: rating + count on the left, location pin + city on the right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--nk-gap-sm)", flexWrap: "wrap" }}>
          {rating ? (
            <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-sm)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-2xs)" }}>
                <b style={{ fontFamily: "var(--nk-font-body)", fontWeight: 700, fontSize: 16, color: "var(--nk-text-2)" }}>{rating}</b>
                <Icon name="Star" size={16} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
              </span>
              {count && <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>({count})</span>}
            </span>
          ) : (
            // No reviews yet — surface that as a "New" trust signal instead of a gap.
            <Pill tone="yellow" icon="Sparkles">{c.newListing}</Pill>
          )}
          <span style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-2xs)", fontFamily: "var(--nk-font-body)", fontWeight: 500, fontSize: 16, color: "var(--nk-text-2)" }}>
            <Icon name="MapPin" size={16} color="var(--nk-text)" fill="var(--nk-text)" stroke={2} /> {city ?? c.sampleCity}
          </span>
        </div>
        <div className="nk-offer__pricebar" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: "var(--nk-gap-md)", borderTop: "1px solid var(--nk-border)" }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: "var(--nk-gap-xs)" }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, color: "var(--nk-text)", whiteSpace: "nowrap" }}>{price ?? c.samplePrice}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)", whiteSpace: "nowrap" }}>{unit ?? c.perDay}</span>
          </span>
          <span className="nk-round nk-round--solid" aria-hidden="true">
            <Icon name="ArrowRight" size={20} stroke={2} color="var(--nk-text)" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Category card (all-categories grid + home section) ---------------- */
export function CategoryCard({
  title, count, href, id, icon,
}: {
  title: string;
  count?: string;
  href: string;
  id: string; // top-level category id — selects the accent hue
  icon: IconName; // glyph resolved from the wire's icon_name (Category.icon)
}) {
  return (
    <div className="nk-cat" data-cat={id}>
      <Link href={href} className="nk-stretch" aria-label={title} />
      <div className="nk-cat__img" />
      <div className="nk-cat__overlay" />
      <span className="nk-cat__disk"><Icon name={icon} size={40} stroke={1.8} /></span>
      <div className="nk-cat__content">
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--nk-gap-sm)" }}>
          <h3 className="nk-h-row" style={{ margin: 0, fontSize: 22, lineHeight: "26px" }}>{title}</h3>
          {count && <span className="nk-cat__count">{count}</span>}
        </span>
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
    <div className="nk-interrupt nk-grain" style={{ gridColumn: "1 / -1" }}>
      <Pattern name="section-pattern" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/icon.png" alt="" loading="lazy" style={{ position: "relative", width: 88, height: 88, borderRadius: 21, flex: "none" }} />
      <div style={{ position: "relative", flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)" }}>
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
  icon = "ShieldCheck", title, body, className,
}: {
  icon?: IconName;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={className ? `nk-feature ${className}` : "nk-feature"} style={{
      flex: 1, borderRadius: "var(--nk-r-card)", background: "var(--nk-glass-strong)", backdropFilter: "var(--nk-blur)", WebkitBackdropFilter: "var(--nk-blur)", border: "1px solid var(--nk-glass-card-border)",
      padding: "var(--nk-block-pad)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-stack-lg)", textAlign: "center",
    }}>
      <span style={{ width: "var(--nk-size-icon-lg)", height: "var(--nk-size-icon-lg)", borderRadius: "50%", background: "var(--nk-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={36} color="var(--nk-yellow)" stroke={2} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
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
    <div className="nk-quote" style={{ flex: 1, borderRadius: "var(--nk-r-md)", padding: "var(--nk-block-pad)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-md)", marginBottom: "var(--nk-stack-lg)" }}>
        <span className="nk-imgph" style={{ width: "var(--nk-size-icon-md)", height: "var(--nk-size-icon-md)", borderRadius: "50%", background: avatarTint }}>
          <Icon name="User" size={26} stroke={1.6} color="var(--nk-avatar-icon)" />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)" }}>
          <span className="nk-h-row">{name}</span>
          {role && <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)" }}>{role}</span>}
          <span style={{ display: "flex", gap: "var(--nk-gap-2xs)" }}>
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
      borderRadius: open ? "var(--nk-r-card)" : "var(--nk-r-lg)", background: "var(--nk-surface)", transition: "border-radius .2s ease, border-color .2s ease, background .2s ease",
      overflow: "hidden",
    }}>
      {/* Semantic heading wraps the disclosure button (standard accordion pattern). */}
      <h3 style={{ margin: 0 }}>
        <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--nk-gap-md)", padding: "18px clamp(20px,5vw,40px) 18px clamp(22px,6vw,40px)", textAlign: "left", font: "inherit" }}>
          <span className="nk-h-row" style={{ paddingTop: 5 }}>{q}</span>
          <span style={{ width: 44, height: 44, borderRadius: 22, flex: "none", marginRight: -8, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .2s ease", transform: open ? "rotate(180deg)" : "none" }}>
            <Icon name="ChevronDown" size={22} color={open ? "var(--nk-purple-hover)" : "var(--nk-text)"} stroke={2.2} />
          </span>
        </button>
      </h3>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, padding: "0 clamp(22px,6vw,40px) 24px", fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)" }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Skeleton listing card ----------------
   `ghost` swaps the shimmer for a static fill — used as a placeholder tile
   behind a SectionEmptyGrid panel (signals "coming soon", not "loading"). */
export function OfferCardSkeleton({ ghost = false }: { ghost?: boolean } = {}) {
  const cls = ghost ? "nk-ghost" : "nk-skel";
  return (
    <article aria-hidden="true" style={{ background: "var(--nk-surface)", borderRadius: "var(--nk-r-card)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className={cls} style={{ aspectRatio: "5 / 4", borderRadius: "24px 24px 0 0" }} />
      <div style={{ padding: "var(--nk-card-pad)", display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)" }}>
        <div className={cls} style={{ width: "70%", height: 26 }} />
        <div className={cls} style={{ width: "48%", height: 18 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div className={cls} style={{ width: 130, height: 20 }} />
          <div className={cls} style={{ width: 44, height: 44, borderRadius: 22 }} />
        </div>
      </div>
    </article>
  );
}

/* ---------------- Skeleton category card ---------------- */
export function CategoryCardSkeleton({ ghost = false }: { ghost?: boolean } = {}) {
  const cls = ghost ? "nk-ghost" : "nk-skel";
  return (
    <div aria-hidden="true" className={cls} style={{ height: 248, borderRadius: "var(--nk-r-card)", position: "relative" }}>
      <div className={cls} style={{ position: "absolute", top: 22, left: 22, width: 64, height: 64, borderRadius: "50%", background: "rgba(27,27,27,.3)" }} />
      <div className={cls} style={{ position: "absolute", left: 22, bottom: 48, width: "55%", height: 22, background: "rgba(27,27,27,.3)" }} />
      <div className={cls} style={{ position: "absolute", left: 22, bottom: 22, width: 92, height: 18, borderRadius: 12, background: "rgba(27,27,27,.3)" }} />
      <div className={cls} style={{ position: "absolute", right: 22, bottom: 22, width: 44, height: 44, borderRadius: 22, background: "rgba(27,27,27,.3)" }} />
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
  secondaryLabel, onSecondaryAction, tone = "default",
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
  tone?: "default" | "danger"; // danger tints the icon disk for error states
}) {
  const danger = tone === "danger";
  // On an error state (danger + a retry action), move focus to the retry button ONCE
  // so keyboard/SR users land on the recovery affordance. Guarded by a ref because
  // call sites pass an inline onAction (new identity each render) — without it the
  // effect would re-fire and re-steal focus on every parent re-render.
  const actionRef = useRef<HTMLButtonElement>(null);
  const focusedOnce = useRef(false);
  useEffect(() => {
    if (danger && onAction && !focusedOnce.current) {
      focusedOnce.current = true;
      actionRef.current?.focus();
    }
  }, [danger, onAction]);
  return (
    <div className="nk-empty" role={danger ? "alert" : undefined}>
      {illustration
        ? <Illustration name={illustration} />
        : <span className="nk-empty__icon" style={danger ? { background: "var(--nk-danger-tint)" } : undefined}>
            <Icon name={icon} size={40} stroke={1.8} color={danger ? "var(--nk-danger)" : "var(--nk-text-muted)"} />
          </span>}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", maxWidth: 460 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, lineHeight: "30px", color: "var(--nk-text)" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "28px", color: "var(--nk-text-2)" }}>{subtitle}</p>
      </div>
      {(actionLabel || secondaryLabel) && (
        <div style={{ display: "flex", gap: "var(--nk-gap-sm)", flexWrap: "wrap", justifyContent: "center" }}>
          {actionLabel && (
            <button ref={actionRef} className={"nk-btn " + (actionPrimary ? "nk-btn--primary" : "nk-btn--outline")} onClick={onAction}>
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
const SECTION_EMPTY_TONES: Record<"purple" | "yellow" | "green" | "danger", { bg: string; fg: string }> = {
  purple: { bg: "var(--nk-purple-tag)", fg: "var(--nk-purple-hover)" },
  yellow: { bg: "var(--nk-yellow-tint)", fg: "var(--nk-yellow)" },
  green: { bg: "var(--nk-green-tint)", fg: "var(--nk-green)" },
  danger: { bg: "var(--nk-danger-tint)", fg: "var(--nk-danger)" },
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
    <div style={{ background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: "var(--nk-r-card)", padding: "var(--nk-card-pad)", display: "flex", alignItems: "center", gap: "var(--nk-gap-xl)", flexWrap: "wrap" }}>
      <span style={{ width: 60, height: 60, borderRadius: 30, flex: "none", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={27} color={c.fg} stroke={2} />
      </span>
      <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)" }}>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, lineHeight: "26px", color: "var(--nk-text)" }}>{title}</span>
        {subtitle && <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "25px", color: "var(--nk-text-2)" }}>{subtitle}</span>}
      </div>
      {actionLabel && <button className="nk-btn nk-btn--outline" onClick={onAction} style={{ flex: "none" }}>{actionLabel}</button>}
    </div>
  );
}

/* ---------------- Section-level empty (ghost preview grid) ----------------
   For a no-data homepage BAND (Categories / Offers). Keeps the section's
   footprint by filling its real grid shape with dimmed, static ghost tiles
   (no shimmer — they read as "coming soon", not "loading"), then floats a
   glass message panel with dual CTAs over them. `tone="danger"` reuses it for
   the error state. */
export function SectionEmptyGrid({
  variant, icon, title, subtitle,
  primaryLabel, onPrimary, secondaryLabel, onSecondary, tone = "purple",
}: {
  variant: "categories" | "offers";
  icon?: IconName;
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: "purple" | "yellow" | "green" | "danger";
}) {
  const c = SECTION_EMPTY_TONES[tone];
  const cats = variant === "categories";
  const fallbackIcon: IconName = cats ? "LayoutGrid" : "Tag";
  const ghostCount = 4;
  return (
    <div className="nk-emptygrid">
      <div className={"nk-emptygrid__ghost " + (cats ? "nk-grid-cats" : "nk-grid-4")} aria-hidden="true">
        {Array.from({ length: ghostCount }).map((_, i) =>
          cats ? <CategoryCardSkeleton key={i} ghost /> : <OfferCardSkeleton key={i} ghost />)}
      </div>
      <div className="nk-emptygrid__panel" role="status">
        <span className="nk-emptygrid__icon" style={{ background: c.bg }}>
          <Icon name={icon ?? fallbackIcon} size={28} color={c.fg} stroke={2} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-2xs)" }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 23, lineHeight: "28px", color: "var(--nk-text)" }}>{title}</span>
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "24px", color: "var(--nk-text-2)" }}>{subtitle}</span>
        </div>
        <div style={{ display: "flex", gap: "var(--nk-gap-sm)", flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          <button className="nk-btn nk-btn--primary" onClick={onPrimary}>{primaryLabel}</button>
          {secondaryLabel && <button className="nk-btn nk-btn--outline" onClick={onSecondary}>{secondaryLabel}</button>}
        </div>
      </div>
    </div>
  );
}
