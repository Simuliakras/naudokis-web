"use client";
// Naudokis UI kit — primitives.
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18nOptional } from "./I18nProvider";
import { localeHome } from "@/app/lib/i18n/config";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
import { trackEvent } from "@/app/lib/analytics";
// Icon / Pattern / QR / IconName are defined in the server-renderable visual.tsx
// (single source of truth) and re-exported here so existing `from "./ui"` import
// sites keep working unchanged.
import { Icon, Pattern, QR, type IconName } from "./visual";
export { Icon, Pattern, QR };
export type { IconName };

/* ---------------- Logo ---------------- */
// A real link to the locale home (a logo is expected to navigate, not no-op).
export function Logo({ height = 36, priority = false }: { height?: number; priority?: boolean }) {
  const { locale } = useI18nOptional();
  return (
    <Link className="nk-logo" href={localeHome(locale)}>
      <Image src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={287} height={64}
        preload={priority} style={{ height, width: "auto" }} />
    </Link>
  );
}

/* ---------------- Eyebrow + section head ---------------- */
export function SectionHead({
  eyebrow, title, action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="nk-section__top nk-reveal">
      <div className="nk-head">
        {(eyebrow || action) && (
          <div className="nk-head__top">
            {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
            {action}
          </div>
        )}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

/* ---------------- Dots ---------------- */
// Decorative by default; pass `onSelect` to make each dot a focusable nav button.
export function Dots({
  n = 4, active = 0, onSelect, label,
}: {
  n?: number;
  active?: number;
  onSelect?: (i: number) => void;
  label?: (i: number) => string;
}) {
  if (onSelect) {
    return (
      <div className="nk-dots">
        {Array.from({ length: n }).map((_, i) => (
          <button key={i} type="button" onClick={() => onSelect(i)} aria-label={label?.(i)}
            aria-current={i === active} className={"nk-dot nk-dot--btn" + (i === active ? " nk-dot--on" : "")} />
        ))}
      </div>
    );
  }
  return (
    <div className="nk-dots">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={"nk-dot" + (i === active ? " nk-dot--on" : "")} />
      ))}
    </div>
  );
}

/* ---------------- App-store badges ----------------
   Each badge links straight to its store listing (apple → App Store, google →
   Play). `interactive={false}` renders a plain image for the rare context where
   a link would be redundant. `href` overrides the destination — e.g. on /invite
   both badges point at the attribution (OneLink) link, which auto-routes per OS. */
export function StoreBadge({
  store, height = 52, footer = false, interactive = true, href, placement,
}: {
  store: "google" | "apple";
  height?: number;
  footer?: boolean;
  interactive?: boolean;
  href?: string;
  placement?: string;
}) {
  const { dict } = useI18nOptional();
  const isGoogle = store === "google";
  const suffix = footer ? "-footer" : "";
  const width = footer ? 214 : 183;
  const naturalHeight = footer ? 66 : 56;
  const img = (
    <Image src={isGoogle ? `/naudokis/btn-google-play${suffix}.png` : `/naudokis/btn-app-store${suffix}.png`}
      alt={isGoogle ? dict.bridge.googlePlayAlt : dict.bridge.appStoreAlt}
      width={width} height={naturalHeight} style={{ height, width: "auto" }} />
  );
  if (!interactive) {
    return <span style={{ display: "inline-flex" }}>{img}</span>;
  }
  return (
    <a className="nk-badgebtn" href={href ?? (isGoogle ? PLAY_STORE_URL : APP_STORE_URL)}
      target="_blank" rel="noopener noreferrer"
      onClick={() => trackEvent("App Store Click", { store, placement: placement ?? (footer ? "footer" : "page"), customHref: Boolean(href) })}>
      {img}
    </a>
  );
}

export function AppBadges({ gap = 20, height = 52, footer = false, interactive = true, href, placement }: {
  gap?: number; height?: number; footer?: boolean; interactive?: boolean; href?: string; placement?: string;
}) {
  return (
    <div className="nk-appbadges" style={{ gap }}>
      <StoreBadge store="google" height={height} footer={footer} interactive={interactive} href={href} placement={placement} />
      <StoreBadge store="apple" height={height} footer={footer} interactive={interactive} href={href} placement={placement} />
    </div>
  );
}

/* ---------------- Illustration (screen-level empty states) ----------------
   Ported from the mobile app's illustration system (200×200 canvas, purple
   #6665E0 backdrop, accent #F9F367 outline, floating dots + sparkles). Used by
   the full-screen EmptyState — section-level empties keep the compact Icon.
   Colors are literal brand hex by design: these are multi-tone raw-SVG
   presentation attributes, where --nk-* custom properties don't resolve (same
   constraint as NK_ICONS — see the Icon note above). #6665E0 == --nk-purple,
   #F9F367 == --nk-yellow. */
export type IllusName = "search" | "listings" | "filter" | "error" | "offline" | "notFound";

const NK_ILLUS: Record<IllusName, React.ReactNode> = {
  search: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <circle cx="88" cy="85" r="42" fill="#6665E0" opacity=".15"/>
      <circle cx="88" cy="85" r="35" fill="none" stroke="#F9F367" strokeWidth="4"/>
      <line x1="113" y1="110" x2="145" y2="142" stroke="#F9F367" strokeWidth="6" strokeLinecap="round"/>
      <rect x="135" y="130" width="18" height="22" rx="4" fill="#F9F367" opacity=".3" transform="rotate(45 144 141)"/>
      <path d="M78 78Q88 68 98 78" fill="none" stroke="#F9F367" strokeWidth="3" strokeLinecap="round" opacity=".6"/>
      <path d="M78 88Q88 98 98 88" fill="none" stroke="#F9F367" strokeWidth="3" strokeLinecap="round" opacity=".6"/>
      <circle cx="35" cy="55" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="170" cy="130" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="30" cy="140" r="3" fill="#6665E0" opacity=".3"/>
      <circle cx="175" cy="65" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M40 90L45 85M45 90L40 85" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M160 165L165 160M165 165L160 160" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
  listings: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <rect x="45" y="40" width="110" height="130" rx="12" fill="#6665E0" opacity=".15"/>
      <rect x="50" y="45" width="100" height="120" rx="10" fill="none" stroke="#F9F367" strokeWidth="4"/>
      <rect x="60" y="58" width="80" height="45" rx="6" fill="#F9F367" opacity=".2"/>
      <path d="M65 98L80 63M80 98L95 63M95 98L110 63M110 98L125 63M125 98L135 73" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".3"/>
      <rect x="60" y="115" width="70" height="8" rx="4" fill="#F9F367" opacity=".4"/>
      <rect x="60" y="130" width="50" height="8" rx="4" fill="#F9F367" opacity=".3"/>
      <rect x="60" y="145" width="60" height="8" rx="4" fill="#F9F367" opacity=".2"/>
      <path d="M155 35L165 45L155 55" fill="none" stroke="#F9F367" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="148" y="38" width="22" height="14" rx="3" fill="#F9F367" opacity=".3"/>
      <circle cx="35" cy="55" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="170" cy="130" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="30" cy="140" r="3" fill="#6665E0" opacity=".3"/>
      <circle cx="175" cy="65" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M40 90L45 85M45 90L40 85" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M160 165L165 160M165 165L160 160" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
  filter: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <circle cx="100" cy="100" r="58" fill="#6665E0" opacity=".13"/>
      <rect x="50" y="63" width="100" height="9" rx="4.5" fill="#F9F367" opacity=".22"/>
      <rect x="50" y="95" width="100" height="9" rx="4.5" fill="#F9F367" opacity=".3"/>
      <rect x="50" y="127" width="100" height="9" rx="4.5" fill="#F9F367" opacity=".22"/>
      <circle cx="120" cy="67.5" r="12" fill="#2B2F30" stroke="#F9F367" strokeWidth="4"/>
      <circle cx="120" cy="67.5" r="3.5" fill="#6665E0"/>
      <circle cx="76" cy="99.5" r="12" fill="#2B2F30" stroke="#F9F367" strokeWidth="4"/>
      <circle cx="76" cy="99.5" r="3.5" fill="#6665E0"/>
      <circle cx="132" cy="131.5" r="12" fill="#2B2F30" stroke="#F9F367" strokeWidth="4"/>
      <circle cx="132" cy="131.5" r="3.5" fill="#6665E0"/>
      <circle cx="35" cy="55" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="170" cy="130" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="30" cy="140" r="3" fill="#6665E0" opacity=".3"/>
      <circle cx="175" cy="65" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M40 90L45 85M45 90L40 85" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M160 165L165 160M165 165L160 160" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
  error: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <circle cx="100" cy="92" r="58" fill="#6665E0" opacity=".12"/>
      <path d="M60 50 L140 50 Q160 50 160 70 L160 115 Q160 135 140 135 L92 135 L70 158 L75 135 L60 135 Q40 135 40 115 L40 70 Q40 50 60 50 Z" fill="#6665E0" opacity=".15"/>
      <path d="M60 50 L140 50 Q160 50 160 70 L160 115 Q160 135 140 135 L92 135 L70 158 L75 135 L60 135 Q40 135 40 115 L40 70 Q40 50 60 50 Z" fill="none" stroke="#F9F367" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/>
      <rect x="95" y="70" width="10" height="28" rx="5" fill="#6665E0"/>
      <circle cx="100" cy="110" r="4.5" fill="#6665E0"/>
      <path d="M50 38 Q100 22 150 38" stroke="#F9F367" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 6" opacity=".45"/>
      <path d="M65 26 Q100 14 135 26" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 6" opacity=".3"/>
      <circle cx="32" cy="60" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="172" cy="55" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="28" cy="170" r="3" fill="#6665E0" opacity=".5"/>
      <circle cx="175" cy="172" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M30 110L35 105M35 110L30 105" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M165 100L170 95M170 100L165 95" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
  offline: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <circle cx="100" cy="104" r="58" fill="#6665E0" opacity=".12"/>
      <path d="M44 96 Q100 32 156 96" fill="none" stroke="#F9F367" strokeWidth="5" strokeLinecap="round"/>
      <path d="M62 114 Q100 68 138 114" fill="none" stroke="#F9F367" strokeWidth="5" strokeLinecap="round" opacity=".75"/>
      <path d="M80 132 Q100 108 120 132" fill="none" stroke="#F9F367" strokeWidth="5" strokeLinecap="round" opacity=".55"/>
      <circle cx="100" cy="150" r="7" fill="#F9F367"/>
      <line x1="52" y1="48" x2="150" y2="160" stroke="#2B2F30" strokeWidth="13" strokeLinecap="round"/>
      <line x1="52" y1="48" x2="150" y2="160" stroke="#F9F367" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="35" cy="55" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="170" cy="130" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="30" cy="140" r="3" fill="#6665E0" opacity=".3"/>
      <circle cx="175" cy="65" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M40 88L45 83M45 88L40 83" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M162 170L167 165M167 170L162 165" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
  // Lost-place motif (map pin over a dashed path) — a 404 is "this address leads
  // nowhere", not a failed search, so it gets its own anchor instead of reusing
  // the magnifier (whose refresh glyph wrongly hints "retry").
  notFound: (
    <>
      <circle cx="100" cy="100" r="85" fill="#6665E0" opacity=".08"/>
      <circle cx="100" cy="96" r="58" fill="#6665E0" opacity=".13"/>
      <path d="M30 150 Q70 120 100 142 Q130 164 170 138" fill="none" stroke="#F9F367" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 10" opacity=".55"/>
      <path d="M100 38c-19 0-34 15-34 34 0 25 34 60 34 60s34-35 34-60c0-19-15-34-34-34Z" fill="#6665E0" opacity=".18"/>
      <path d="M100 38c-19 0-34 15-34 34 0 25 34 60 34 60s34-35 34-60c0-19-15-34-34-34Z" fill="none" stroke="#F9F367" strokeWidth="4" strokeLinejoin="round"/>
      <circle cx="100" cy="72" r="12" fill="none" stroke="#F9F367" strokeWidth="4"/>
      <path d="M87 155 L113 155" stroke="#F9F367" strokeWidth="3" strokeLinecap="round" opacity=".4"/>
      <circle cx="35" cy="55" r="4" fill="#F9F367" opacity=".5"/>
      <circle cx="170" cy="130" r="5" fill="#F9F367" opacity=".4"/>
      <circle cx="30" cy="140" r="3" fill="#6665E0" opacity=".3"/>
      <circle cx="175" cy="65" r="4" fill="#F9F367" opacity=".5"/>
      <path d="M40 100L45 95M45 100L40 95" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M160 165L165 160M165 165L160 160" stroke="#F9F367" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    </>
  ),
};

export function Illustration({
  name = "search", size = 224, className = "", style, icon,
}: {
  name?: IllusName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  icon?: IconName; // context glyph overlaid on the "listings" card area (e.g. the empty category's own icon)
}) {
  const svg = (
    <svg className={"nk-empty__ill " + className} width={size} height={size} viewBox="0 0 200 200"
      aria-hidden="true" focusable="false" style={icon ? undefined : style}>
      {NK_ILLUS[name] ?? NK_ILLUS.search}
    </svg>
  );
  if (!icon) {
    return svg;
  }
  // Overlay centred on the listings illustration's photo rect (x60 y58 w80 h45 in
  // the 200-unit canvas) so the ~10 programmatic empty pages feel authored, not
  // templated. Literal brand hex: raw-SVG constraint, same as NK_ILLUS.
  return (
    <span aria-hidden="true" style={{ position: "relative", display: "inline-flex", ...style }}>
      {svg}
      <span style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)", color: "#F9F367", display: "inline-flex" }}>
        <Icon name={icon} size={Math.round(size * 0.24)} stroke={1.8} color="#F9F367" />
      </span>
    </span>
  );
}

/* ============================================================
   Locked-mode trigger — any component can call openRedirect(...)
   to open the shared <AppRedirect/> modal (mounted via <Chrome/>).
   ============================================================ */
// Optional listing context keeps the user's intent visible across the handoff
// (compact item row in the modal). Real wire data only — title/thumb/price come
// from the listing view models, never fabricated.
export type RedirectListingContext = { title: string; thumb?: string; priceLabel?: string };
export type RedirectPayload = { title: string; body: string; listing?: RedirectListingContext };
export const NK_REDIRECT_EVENT = "nk:redirect";

export function openRedirect(payload: RedirectPayload) {
  if (typeof window === "undefined") return;
  trackEvent("App Bridge Open", { title: payload.title });
  window.dispatchEvent(new CustomEvent<RedirectPayload>(NK_REDIRECT_EVENT, { detail: payload }));
}

/* ---------------- Shared overlay close button ----------------
   One dismiss affordance for every overlay layer (redirect modal, filter sheet,
   legal TOC drawer) so muscle memory transfers — 44px rounded square, surface
   fill, hairline border. Callers pass their own localized aria-label; extra
   classes only position it (e.g. the modal's absolute corner). */
export function CloseButton({ label, onClick, className, ref }: {
  label: string;
  onClick: () => void;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button ref={ref} type="button" className={"nk-closebtn" + (className ? " " + className : "")}
      onClick={onClick} aria-label={label}>
      <Icon name="X" size={20} color="var(--nk-text)" />
    </button>
  );
}

/* ---------------- Pill (active/selected accent) ---------------- */
export function Pill({
  children, tone = "accent", icon,
}: {
  children: React.ReactNode;
  tone?: "accent" | "yellow" | "green" | "purple";
  icon?: IconName;
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    accent: { bg: "var(--nk-accent-bg)", fg: "var(--nk-accent-text)" },
    purple: { bg: "var(--nk-accent-bg)", fg: "var(--nk-accent-text)" },
    yellow: { bg: "var(--nk-yellow-tint)", fg: "var(--nk-yellow)" },
    green: { bg: "var(--nk-green-tint)", fg: "var(--nk-green-text)" },
  };
  const c = tones[tone] ?? tones.accent;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg, color: c.fg, borderRadius: 999, padding: "7px 14px", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1, whiteSpace: "nowrap" }}>
      {icon && <Icon name={icon} size={15} color={c.fg} stroke={2} />}
      {children}
    </span>
  );
}

/* ---------------- Breadcrumb (home icon + active pill) ---------------- */
export type Crumb = { label: string; href?: string };
export function Breadcrumb({ items, homeLabel, label }: { items: Crumb[]; homeLabel: string; label: string }) {
  // Locale-prefixed home crumb (mirrors Logo) — a bare "/" would silently switch
  // an /en visitor back to the Lithuanian homepage.
  const { locale } = useI18nOptional();
  const all: Crumb[] = [{ label: homeLabel, href: localeHome(locale) }, ...items];
  return (
    <nav aria-label={label} className="nk-crumbs" style={{ display: "flex", alignItems: "center", gap: "6px 4px", flexWrap: "wrap", marginBottom: 22 }}>
      {all.map((c, i) => {
        const last = i === all.length - 1;
        const home = i === 0;
        if (last) {
          return (
            <span key={i} aria-current="page" style={{ padding: "6px 10px", borderRadius: 9, fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)", background: "var(--nk-surface)" }}>{c.label}</span>
          );
        }
        // Crumb + its separator wrap as one unit — a chevron must never orphan at
        // a line end when the trail wraps on small phones.
        return (
          <span key={i} className="nk-crumbs__seg" style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <Link href={c.href ?? localeHome(locale)} className="nk-crumb" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", textDecoration: "none" }}>
              {home && <Icon name="Home" size={16} stroke={2} color="currentColor" />} {c.label}
            </Link>
            <Icon name="ChevronRight" size={14} stroke={2.4} color="var(--nk-text-muted)" className="nk-crumbs__sep" />
          </span>
        );
      })}
    </nav>
  );
}

/* ---------------- InputClear (clear-× inside a padded search field) ---------------- */
export function InputClear({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="nk-input-clear" onClick={onClick} aria-label={label}>
      <Icon name="X" size={17} color="var(--nk-text-muted)" />
    </button>
  );
}

/* ---------------- Listbox keyboard navigation ----------------
   Shared roving-focus handler for the custom listbox popovers (FilterSelect,
   CityPicker, LocaleSwitcher): Arrow/Home/End move focus between the panel's
   role="option" elements. Attach as onKeyDown on the listbox panel. */
export function listboxKeyNav(e: React.KeyboardEvent) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
    return;
  }
  const options = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="option"]'));
  if (options.length === 0) {
    return;
  }
  e.preventDefault();
  const i = options.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === "Home" ? 0
    : e.key === "End" ? options.length - 1
    : e.key === "ArrowDown" ? (i + 1) % options.length
    : i < 0 ? options.length - 1 : (i - 1 + options.length) % options.length;
  options[next].focus();
}

/* Open a closed listbox with ArrowDown — attach as onKeyDown on the trigger. */
export function listboxTriggerKeyNav(open: boolean, setOpen: (open: boolean) => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };
}

/* Focus the selected option (else the first) when a listbox panel opens —
   call from an effect that runs on `open`. */
export function focusListboxSelection(panel: HTMLElement | null) {
  (panel?.querySelector<HTMLElement>('[aria-selected="true"]')
    ?? panel?.querySelector<HTMLElement>('[role="option"]'))?.focus();
}

/* Close a listbox and restore keyboard focus to its trigger. Focus moved INTO the
   panel on open, so unmounting it on Escape/select would otherwise drop focus to
   <body> and restart Tab from the top of the document. Restores only when focus
   is actually inside `container` (never steals focus from elsewhere). */
export function closeListbox(
  setOpen: (open: boolean) => void,
  trigger: React.RefObject<HTMLButtonElement | null>,
  container: React.RefObject<HTMLElement | null>,
) {
  setOpen(false);
  if (container.current && document.activeElement && container.current.contains(document.activeElement)) {
    trigger.current?.focus();
  }
}

/* Generic roving-focus step (APG radio-group / toolbar pattern): Arrow/Home/End
   move focus across `selector` matches inside e.currentTarget. Returns the newly
   focused element so radio groups can also move SELECTION on arrows, or null when
   the key wasn't handled. */
export function rovingKeyNav(e: React.KeyboardEvent, selector: string): HTMLElement | null {
  if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
    return null;
  }
  const options = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(selector));
  if (options.length === 0) {
    return null;
  }
  e.preventDefault();
  const i = options.indexOf(document.activeElement as HTMLElement);
  const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
  const next =
    e.key === "Home" ? 0
    : e.key === "End" ? options.length - 1
    : forward ? (i + 1) % options.length
    : i < 0 ? options.length - 1 : (i - 1 + options.length) % options.length;
  options[next].focus();
  return options[next];
}

/* ---------------- FilterSelect (custom popover dropdown) ----------------
   Dark pill trigger + option list. Replaces native <select> on the feed.
   `direction="up"` opens above the trigger (used by the hero city picker). */
export type SelectOption = { value: string; label: string };
export function FilterSelect({
  icon, label, value, defaultValue = "", options, onChange,
  align = "left", direction = "down", heading,
}: {
  icon?: IconName;
  label: string;
  value: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  align?: "left" | "right";
  direction?: "down" | "up";
  heading?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // Escape closes AND restores focus to the trigger (focus lives inside the
    // panel while open); an outside click just closes — the user is elsewhere.
    const onDoc = (e: MouseEvent) => { if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeListbox(setOpen, triggerRef, ref); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);
  // Move focus into the open list (onto the selected option) for keyboard users.
  useEffect(() => {
    if (open) {
      focusListboxSelection(panelRef.current);
    }
  }, [open]);
  const active = value !== defaultValue;
  const selected = options.find((o) => o.value === value);
  const panelPos: React.CSSProperties = direction === "up"
    ? { bottom: "calc(100% + 10px)" }
    : { top: "calc(100% + 10px)" };
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}
      onBlur={(e) => {
        // Tabbing out of an open panel closes it (WAI-ARIA listbox pattern).
        if (open && e.relatedTarget instanceof Node && ref.current && !ref.current.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}>
      <button ref={triggerRef} type="button" className={"nk-pillctl" + (active ? " is-active" : "")} onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox" aria-expanded={open}
        aria-label={active && selected ? `${label}: ${selected.label}` : label} style={{
        display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 999, padding: "11px 16px", minHeight: "var(--nk-control-h)", cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5,
      }}>
        {icon && <Icon name={icon} size={16} stroke={2} color={active ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} />}
        <span className="nk-pillctl__label">{active && selected ? selected.label : label}</span>
        <Icon name="ChevronDown" size={15} stroke={2.4} color={active ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </button>
      {open && (
        <span ref={panelRef} role="listbox" aria-label={label} onKeyDown={listboxKeyNav}
          style={{ position: "absolute", ...panelPos, [align]: 0, minWidth: 230, maxWidth: "calc(100vw - 2*var(--nk-gutter))",
            maxHeight: "min(60vh, 480px)", overflowY: "auto", overscrollBehavior: "contain",
            background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: 16, padding: 7, display: "flex", flexDirection: "column", gap: 2, boxShadow: "var(--nk-shadow-3)", zIndex: 50 }}>
          {heading && <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nk-text-muted)", padding: "8px 12px 6px" }}>{heading}</span>}
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <button key={o.value} type="button" role="option" aria-selected={sel}
                onClick={() => { onChange(o.value); closeListbox(setOpen, triggerRef, ref); }}
                className={"nk-selopt" + (sel ? " is-selected" : "")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "11px 13px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  fontFamily: "var(--nk-font-body)", fontSize: 16, flex: "none" }}>
                {o.label}{sel && <Icon name="BadgeCheck" size={17} color="var(--nk-accent-text)" stroke={2} />}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}

/* ---------------- Search suggestions (focus-opened panel) ----------------
   Guided-path suggestions built from REAL data only — the backend categories and
   the picker cities (no fabricated "popular searches"). On a launch-size
   inventory a blind free-text search usually returns nothing; a category/city
   route always lands on a real result set. The caller owns open/close state and
   positions the panel (render inside a position:relative field wrapper). */
export function SearchSuggest({ categories, cities, headings, label, onCategory, onCity }: {
  categories: { id: string; title: string }[];
  cities: readonly string[];
  headings: { categories: string; cities: string };
  label: string;
  onCategory: (id: string) => void;
  onCity: (city: string) => void;
}) {
  return (
    // mousedown preventDefault keeps focus in the input so the field's blur
    // handler never closes the panel before the option's click lands
    <div role="listbox" aria-label={label} className="nk-suggest" onKeyDown={listboxKeyNav}
      onMouseDown={(e) => e.preventDefault()}>
      <span className="nk-suggest__h">{headings.categories}</span>
      <div className="nk-suggest__row">
        {categories.map((c) => (
          <button key={c.id} type="button" role="option" aria-selected={false} className="nk-suggest__opt"
            onClick={() => onCategory(c.id)}>{c.title}</button>
        ))}
      </div>
      <span className="nk-suggest__h">{headings.cities}</span>
      <div className="nk-suggest__row">
        {cities.map((city) => (
          <button key={city} type="button" role="option" aria-selected={false} className="nk-suggest__opt"
            onClick={() => onCity(city)}>{city}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Toggle (pill, for "Su pristatymu") ---------------- */
export function Toggle({
  icon, children, on, onChange,
}: {
  icon?: IconName;
  children: React.ReactNode;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button type="button" className={"nk-pillctl nk-toggle" + (on ? " is-active" : "")} onClick={() => onChange(!on)} aria-pressed={on} style={{
      display: "inline-flex", alignItems: "center", gap: 12, borderRadius: 999, padding: "11px 16px", minHeight: "var(--nk-control-h)", cursor: "pointer",
      fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, whiteSpace: "nowrap",
    }}>
      <span className="nk-toggle__lead" style={{ display: "inline-flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        {icon && <Icon name={icon} size={16} stroke={2} color={on ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} />} {children}
      </span>
      {/* real on/off switch — gives the control a visible state and a trailing
          element so the ≤560 full-width `justify-content:space-between` reads right */}
      <span className="nk-switch" aria-hidden="true"><span className="nk-switch__knob" /></span>
    </button>
  );
}
