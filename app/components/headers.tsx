// Naudokis UI kit — shared section / page headers + section-spacing scaffolding.
//
// Server-safe on purpose (NO "use client"): every export here is pure
// presentational and takes only strings / ReactNode, so these render inside both
// the server home tree (sections-home, FeatureBand) and the "use client" screen
// orchestrators (FeedScreen, sections, …). Keep hooks/handlers out of this file
// so the home page stays server-rendered — anything interactive belongs in
// sections.tsx. Consumers import from here directly; ui.tsx re-exports SectionHead
// for back-compat with older import sites.
import React from "react";
import Link from "next/link";
import { Icon, type IconName } from "./visual";

/* ---------------- Section spacing wrapper ----------------
   One place to spend the fluid rhythm tokens instead of inlining paddingBlock on
   every <section>. `top`/`bottom` name a rhythm step; pairing them preserves the
   deliberate tight seams (e.g. Categories bottom→head pairs with Offers top→head). */
const RHYTHM = {
  section: "var(--nk-section-y)",
  "section-lg": "var(--nk-section-y-lg)",
  head: "var(--nk-section-head)",
  page: "var(--nk-page-top)",
  none: "0px",
} as const;
export type Rhythm = keyof typeof RHYTHM;

export function Section({
  top = "section", bottom = "section", contained = false,
  as: As = "section", id, className, style, children,
}: {
  top?: Rhythm;
  bottom?: Rhythm;
  contained?: boolean;   // wrap in .nk-container gutters
  as?: "section" | "div";
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const cls = [contained ? "nk-container" : null, className].filter(Boolean).join(" ") || undefined;
  return (
    <As id={id} className={cls} style={{ paddingBlock: `${RHYTHM[top]} ${RHYTHM[bottom]}`, ...style }}>
      {children}
    </As>
  );
}

/* ---------------- Section head ----------------
   The sitewide eyebrow + H2 anatomy for in-page sections. `subtitle` renders a
   lede under the title (replaces the Faq negative-margin hack + the home
   HowItWorks lead); `action` (Categories/Offers/HowItWorks view-all) rides in its
   own column, vertically centred against the eyebrow+title+lede block. */
export function SectionHead({
  eyebrow, title, subtitle, action, center = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={"nk-section__top nk-reveal" + (center ? " nk-section__top--center" : "")}>
      <div className={"nk-head" + (center ? " nk-head--center" : "")}>
        {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p className="nk-head__sub">{subtitle}</p>}
      </div>
      {action && <div className="nk-head__action">{action}</div>}
    </div>
  );
}

/* ---------------- Page head ----------------
   The eyebrow + H1 + subtitle cluster at the top of a full screen. One canonical
   H1 per `size` so sibling screens (feed vs categories) stop diverging:
   - "page" — self-contained head block for feed / categories / status (.nk-h-page)
   - "band" — hero-band pages (how-it-works / invite); emits the cluster as siblings
     (no wrapper) so the band's own centered flex+gap and .nk-hero-band h1/__lead
     rules style it. `children` appends extra nodes (badges, benefits) after the lede. */
export function PageHead({
  eyebrow, title, subtitle, size = "page", as: As = "h1",
  maxWidth, subtitleMaxWidth, marginBottom = "var(--nk-gap-lg)",
  className, children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  size?: "page" | "band";
  as?: "h1" | "h2";
  maxWidth?: number | string;
  subtitleMaxWidth?: number | string;
  marginBottom?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  // eyebrow + title ride in a .nk-headhug cluster so the eyebrow keeps the
  // sitewide 4px hug even where the surrounding stack runs a looser rhythm
  // (the hero band's --hero-gap, the pagehead's --nk-gap-sm).
  if (size === "band") {
    return (
      <>
        <div className="nk-headhug">
          {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
          <As>{title}</As>
        </div>
        {typeof subtitle === "string" ? <p className="nk-hero-band__lead">{subtitle}</p> : subtitle}
        {children}
      </>
    );
  }
  return (
    <div className={className ? `nk-pagehead ${className}` : "nk-pagehead"} style={{ maxWidth, marginBottom }}>
      <div className="nk-headhug">
        {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
        <As className="nk-h-page" style={{ margin: 0 }}>{title}</As>
      </div>
      {typeof subtitle === "string"
        ? <p className="nk-subtitle" style={subtitleMaxWidth ? { maxWidth: subtitleMaxWidth } : undefined}>{subtitle}</p>
        : subtitle}
      {children}
    </div>
  );
}

/* ---------------- Row head ----------------
   The shared 24px display H2 for in-page content rows (SEO note, similar rail,
   listing-detail sections). `sub` renders the detail page's lede; `color` lets
   the SEO note keep its softer text-2. */
export function RowHead({
  title, sub, color = "var(--nk-text)", marginBottom = 0,
}: {
  title: string;
  sub?: string;
  color?: string;
  marginBottom?: number | string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: sub ? "var(--nk-gap-2xs)" : 0, marginBottom }}>
      <h2 className="nk-h-row" style={{ margin: 0, color }}>{title}</h2>
      {sub && <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>{sub}</p>}
    </div>
  );
}

/* ---------------- Chip-link row ----------------
   Crawlable landing-link pills shared by the feed SEO note, the listing-detail
   similar rail and the categories popular row. Optional `label` renders the
   full-width uppercase micro-label ("Populiarios paieškos") on its own line.
   Variants: "chip" (default) — the .nk-fchip--link pills; "pill" — .nk-pillctl
   anchors with an optional leading accent icon (Kategorijos "Populiaru dabar"). */
export function ChipLinkRow({
  label, links, style, variant = "chip",
}: {
  label?: string;
  links: { label: string; href: string; icon?: IconName }[];
  style?: React.CSSProperties;
  variant?: "chip" | "pill";
}) {
  if (links.length === 0) {
    return null;
  }
  const pill = variant === "pill";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--nk-gap-sm)", ...style }}>
      {/* Muted, not the yellow eyebrow accent: this micro-label sits in the
          closing SEO block, where a brand accent would out-shout the section
          heading above it. */}
      {label && <span style={{ width: "100%", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--nk-text-muted)" }}>{label}</span>}
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={pill ? "nk-pillctl nk-pillrow__pill" : "nk-fchip nk-fchip--link"}>
          {pill && link.icon && <Icon name={link.icon} size={15} stroke={2} color="var(--nk-purple-hover)" />}
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}

/* ---------------- SEO note ----------------
   The closing "authored intro" block shared verbatim by the feed and categories
   screens (24px display H2 + 100ch small body). Both callers set maxWidth="100ch"
   on their PageHead, so the opening head and this closing block share one column —
   .nk-pagehead has no default max-width, so that has to be passed at each call
   site, not assumed here. `children` carries the feed's related-landing
   ChipLinkRow; categories passes none.

   `top` exists because the two callers arrive at this block differently:
   categories lands straight off the directory grid and wants the tight default,
   while the feed has an owner-CTA line directly above and needs a full section
   break — see the call site in FeedScreen. */
export function SeoNote({
  heading, body, top = "head", children,
}: {
  heading: string;
  body: string;
  top?: Rhythm;
  children?: React.ReactNode;
}) {
  return (
    <Section top={top} bottom="section">
      <div style={{ maxWidth: 1200, display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
        <RowHead title={heading} color="var(--nk-text-2)" />
        {/* 100ch reading measure — kept in step with the PageHead above it */}
        <p style={{ margin: 0, maxWidth: "100ch", fontFamily: "var(--nk-font-body)", fontSize: "var(--nk-fs-sm)", lineHeight: "26px", color: "var(--nk-text-muted)" }}>{body}</p>
        {children}
      </div>
    </Section>
  );
}
