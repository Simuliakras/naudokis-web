"use client";
// Naudokis UI kit — primitives.
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18nOptional } from "./I18nProvider";
import { localeHome } from "@/app/lib/i18n/config";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
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
        priority={priority} style={{ height, width: "auto" }} />
    </Link>
  );
}

/* ---------------- Buttons ---------------- */
export function Button({
  variant = "primary", children, icon, onClick, style, type = "button",
}: {
  variant?: "primary" | "outline";
  children: React.ReactNode;
  icon?: IconName;
  onClick?: () => void;
  style?: React.CSSProperties;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={"nk-btn nk-btn--" + variant} onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={18} stroke={2.2} />}
      {children}
    </button>
  );
}

export function GhostButton({
  children, icon, onClick, style,
}: {
  children: React.ReactNode;
  icon?: IconName;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button type="button" className="nk-btn nk-btn--ghost" onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={17} stroke={2} />}
      {children}
    </button>
  );
}

export function RoundArrow({
  variant = "solid", dir = "right", size = 44, onClick,
}: {
  variant?: "solid" | "outline";
  dir?: "right" | "left" | "down";
  size?: number;
  onClick?: () => void;
}) {
  const icon: IconName = dir === "right" ? "ArrowRight" : dir === "down" ? "ChevronDown" : "ArrowLeft";
  return (
    <button type="button" className={"nk-round nk-round--" + variant} onClick={onClick} style={{ width: size, height: size }}>
      <Icon name={icon} size={20} stroke={2} color="var(--nk-text)" />
    </button>
  );
}

/* ---------------- Chips / tags ---------------- */
export function LocationChip({ city = "Vilnius" }: { city?: string }) {
  return (
    <span className="nk-chip">
      <Icon name="MapPin" size={16} stroke={2.2} color="var(--nk-text)" fill="var(--nk-text)" />
      {city}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="nk-tag">{children}</span>;
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

/* ---------------- Rating ---------------- */
export function Rating({ value = "4,8", count = "52 atsiliepimai" }: { value?: string; count?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <b style={{ fontFamily: "var(--nk-font-body)", fontWeight: 700, fontSize: 18, color: "var(--nk-text-2)" }}>{value}</b>
        <Icon name="Star" size={18} color="var(--nk-yellow)" fill="var(--nk-yellow)" />
      </span>
      <span className="nk-meta" style={{ color: "var(--nk-text-muted)" }}>({count})</span>
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
   both badges point at the attribution (Branch) link, which auto-routes per OS. */
export function StoreBadge({
  store, height = 52, footer = false, interactive = true, href,
}: {
  store: "google" | "apple";
  height?: number;
  footer?: boolean;
  interactive?: boolean;
  href?: string;
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
      target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  );
}

export function AppBadges({ gap = 20, height = 52, footer = false, interactive = true, href }: {
  gap?: number; height?: number; footer?: boolean; interactive?: boolean; href?: string;
}) {
  return (
    <div className="nk-appbadges" style={{ gap }}>
      <StoreBadge store="google" height={height} footer={footer} interactive={interactive} href={href} />
      <StoreBadge store="apple" height={height} footer={footer} interactive={interactive} href={href} />
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
export type IllusName = "search" | "listings" | "filter" | "error" | "offline";

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
};

export function Illustration({
  name = "search", size = 148, className = "", style,
}: {
  name?: IllusName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg className={"nk-empty__ill " + className} width={size} height={size} viewBox="0 0 200 200"
      aria-hidden="true" focusable="false" style={style}>
      {NK_ILLUS[name] ?? NK_ILLUS.search}
    </svg>
  );
}

/* ============================================================
   Locked-mode trigger — any component can call openRedirect(...)
   to open the shared <AppRedirect/> modal (mounted via <Chrome/>).
   ============================================================ */
export type RedirectPayload = { title: string; body: string };
export const NK_REDIRECT_EVENT = "nk:redirect";

export function openRedirect(payload: RedirectPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<RedirectPayload>(NK_REDIRECT_EVENT, { detail: payload }));
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
  const all: Crumb[] = [{ label: homeLabel, href: "/" }, ...items];
  return (
    <nav aria-label={label} className="nk-crumbs" style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 22 }}>
      {all.map((c, i) => {
        const last = i === all.length - 1;
        const home = i === 0;
        if (last) {
          return (
            <span key={i} aria-current="page" style={{ padding: "6px 10px", borderRadius: 9, fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)", background: "var(--nk-surface)" }}>{c.label}</span>
          );
        }
        return (
          <React.Fragment key={i}>
            <Link href={c.href ?? "/"} className="nk-crumb" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9, fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", textDecoration: "none" }}>
              {home && <Icon name="Home" size={16} stroke={2} color="currentColor" />} {c.label}
            </Link>
            <Icon name="ChevronRight" size={14} stroke={2.4} color="var(--nk-text-muted)" />
          </React.Fragment>
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
  const panelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
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
    <span ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button type="button" className={"nk-pillctl" + (active ? " is-active" : "")} onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox" aria-expanded={open} style={{
        display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 999, padding: "11px 16px", minHeight: "var(--nk-tap)", cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5,
      }}>
        {icon && <Icon name={icon} size={16} stroke={2} color={active ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} />}
        <span className="nk-pillctl__label">{active && selected ? selected.label : label}</span>
        <Icon name="ChevronDown" size={15} stroke={2.4} color={active ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </button>
      {open && (
        <span ref={panelRef} role="listbox" aria-label={label} onKeyDown={listboxKeyNav} style={{ position: "absolute", ...panelPos, [align]: 0, minWidth: 230, maxWidth: "calc(100vw - 2*var(--nk-gutter))", background: "var(--nk-surface)", border: "1px solid var(--nk-border)", borderRadius: 16, padding: 7, display: "flex", flexDirection: "column", gap: 2, boxShadow: "var(--nk-shadow-3)", zIndex: 50 }}>
          {heading && <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nk-text-muted)", padding: "8px 12px 6px" }}>{heading}</span>}
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <button key={o.value} type="button" role="option" aria-selected={sel} onClick={() => { onChange(o.value); setOpen(false); }}
                className={"nk-selopt" + (sel ? " is-selected" : "")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "11px 13px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                  fontFamily: "var(--nk-font-body)", fontSize: 16 }}>
                {o.label}{sel && <Icon name="BadgeCheck" size={17} color="var(--nk-accent-text)" stroke={2} />}
              </button>
            );
          })}
        </span>
      )}
    </span>
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
      display: "inline-flex", alignItems: "center", gap: 12, borderRadius: 999, padding: "11px 16px", minHeight: "var(--nk-tap)", cursor: "pointer",
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
