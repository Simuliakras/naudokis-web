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
type Rhythm = keyof typeof RHYTHM;

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
   HowItWorks lead); `action` sits on the eyebrow row (Categories/Offers view-all). */
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
        {(eyebrow || action) && (
          <div className="nk-head__top">
            {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
            {action}
          </div>
        )}
        <h2>{title}</h2>
        {subtitle && <p className="nk-head__sub">{subtitle}</p>}
      </div>
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
  if (size === "band") {
    return (
      <>
        {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
        <As>{title}</As>
        {typeof subtitle === "string" ? <p className="nk-hero-band__lead">{subtitle}</p> : subtitle}
        {children}
      </>
    );
  }
  return (
    <div className={className ? `nk-pagehead ${className}` : "nk-pagehead"} style={{ maxWidth, marginBottom }}>
      {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
      <As className="nk-h-page" style={{ margin: 0 }}>{title}</As>
      {typeof subtitle === "string"
        ? <p className="nk-subtitle" style={subtitleMaxWidth ? { maxWidth: subtitleMaxWidth } : undefined}>{subtitle}</p>
        : subtitle}
      {children}
    </div>
  );
}

/* ---------------- SEO note ----------------
   The closing "authored intro" block shared verbatim by the feed and categories
   screens (24px display H2 + 65ch small body). `children` carries the feed's
   RelatedLandingLinks; categories passes none. */
export function SeoNote({
  heading, body, children,
}: {
  heading: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <Section top="head" bottom="section">
      <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "var(--nk-fs-row)", lineHeight: "30px", color: "var(--nk-text-2)" }}>{heading}</h2>
        {/* 65ch reading measure (matches .nk-prose / the header intro) */}
        <p style={{ margin: 0, maxWidth: "65ch", fontFamily: "var(--nk-font-body)", fontSize: "var(--nk-fs-sm)", lineHeight: "26px", color: "var(--nk-text-muted)" }}>{body}</p>
        {children}
      </div>
    </Section>
  );
}
