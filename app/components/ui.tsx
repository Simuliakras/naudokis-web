"use client";
// Naudokis UI kit — primitives.
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useI18nOptional } from "./I18nProvider";
import { localeHome } from "@/app/lib/i18n/config";

/* ---------------- Icon ----------------
   Self-contained icon set (Lucide-style geometry). `s` = stroke outline children,
   `f` = filled glyph path. Keeps rendering fully reliable & offline. */
type IconDef = {
  s?: React.ReactNode;
  f?: string;
  fOnly?: boolean;
};

const NK_ICONS = {
  Search:      { s: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></> },
  MapPin:      { f: "M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8m0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6", fOnly: true,
                 s: <><path d="M20 10c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></> },
  Star:        { s: <path d="M12 2.5l2.9 5.9 6.6.9-4.8 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.5 9.3l6.6-.9z"/> },
  ArrowRight:  { s: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></> },
  ArrowLeft:   { s: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></> },
  ChevronDown: { s: <path d="m6 9 6 6 6-6"/> },
  Heart:       { s: <path d="M19 5.6a5 5 0 0 0-7-.2l-.99.95-.99-.95a5 5 0 0 0-7 7.2l.99.95L12 21l7.99-7.45.99-.95a5 5 0 0 0 0-7z"/> },
  Image:       { s: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></> },
  User:        { s: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
  Users:       { s: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  ShieldCheck: { s: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></> },
  X:           { s: <path d="M18 6 6 18M6 6l12 12"/> },
  Menu:        { s: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></> },
  Phone:       { s: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/> },
  Mail:        { s: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 6.5 9.5 7 9.5-7"/></> },
  Play:        { f: "M6 3v18l15-9z" },
  Apple:       { f: "M16.36 12.46c.02 2.45 2.15 3.27 2.18 3.28-.02.06-.34 1.16-1.12 2.3-.67.98-1.37 1.96-2.47 1.98-1.08.02-1.43-.64-2.66-.64s-1.62.62-2.64.66c-1.06.04-1.87-1.06-2.55-2.04-1.39-2-2.45-5.66-1.03-8.13.71-1.23 1.97-2 3.34-2.02 1.04-.02 2.02.7 2.66.7.63 0 1.83-.86 3.08-.74.53.02 2 .21 2.95 1.6-.08.05-1.76 1.03-1.74 3.07M14.4 5.8c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.39-1.14" },
  Facebook:    { f: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94" },
  Instagram:   { s: <><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></> },
  Linkedin:    { f: "M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5M3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.32-1.96 2.69V21H10z" },
  SearchX:     { s: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 8.5 5 5"/><path d="m13.5 8.5-5 5"/></> },
  Inbox:       { s: <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/></> },
  LayoutGrid:  { s: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></> },
  ArrowUpDown: { s: <><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></> },
  SlidersHorizontal: { s: <><line x1="21" y1="8" x2="10" y2="8"/><line x1="6" y1="8" x2="3" y2="8"/><line x1="21" y1="16" x2="14" y2="16"/><line x1="10" y1="16" x2="3" y2="16"/><line x1="10" y1="5" x2="10" y2="11"/><line x1="14" y1="13" x2="14" y2="19"/></> },
  Home:        { s: <><path d="M3 10.2 12 3l9 7.2"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/></> },
  Car:         { s: <><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 17v-4h16v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/></> },
  Tag:         { s: <><path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0L2.6 12.6A2 2 0 0 1 2 11.2V4a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6z"/><circle cx="7.5" cy="7.5" r="1.3"/></> },
  Calendar:    { s: <><rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></> },
  MessageCircle:{ s: <path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1 1 21 11.5z"/> },
  Info:        { s: <><circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/></> },
  BadgeCheck:  { s: <><path d="m3.9 8.6.9-2.7 2.7-.9L9.4 2.6h5.2l1.9 2.4 2.7.9.9 2.7L21.4 11v2l-1.4 1.8.9 2.7-2.7.9-1.9 2.4H9.4l-1.9-2.4-2.7-.9.9-2.7L4.3 13v-2z"/><path d="m9 12 2 2 4-4"/></> },
  RefreshCcw:  { s: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></> },
  MoreHorizontal:{ s: <><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></> },
  ChevronRight:{ s: <path d="m9 6 6 6-6 6"/> },
  Sparkles:    { s: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/></> },
  Download:    { s: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></> },
  Camera:      { s: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 4.8a1 1 0 0 1 .8-.4h6.4a1 1 0 0 1 .8.4L17.5 7h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="12.5" r="3.4"/></> },
  Handshake:   { s: <><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2"/><path d="m13 15 2.2 2.2a1.4 1.4 0 0 0 2-2L14 11.8"/><path d="M3 11.5 7 7.6a2 2 0 0 1 2.3-.4l2.2 1.1a1.4 1.4 0 0 1 .3 2.3l-1.6 1.4a1.4 1.4 0 0 1-1.9 0L8 11"/><path d="m14 9 3.2-3.1a2 2 0 0 1 2.3-.3L21 6.4"/><path d="M3 11.5 5 13.5M19.5 5.5 21 6.4"/></> },
  Coins:       { s: <><circle cx="8" cy="8" r="6"/><path d="M18.1 6.5a6 6 0 0 1 0 11M8.7 6h.5a1.8 1.8 0 0 1 0 3.6h-1a1.8 1.8 0 0 0 0 3.6h.5M8 5.2v.8M8 13v.8"/></> },
  Snowflake:   { s: <><path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2M4 9.5l.5 3.3-2.6 1.9M20 9.5l-.5 3.3 2.6 1.9M4 14.5l-2.1-1.7M20 14.5l2.1-1.7"/></> },
  Smartphone:  { s: <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 17.8h2"/></> },
  Wrench:      { s: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/> },
  PartyPopper: { s: <><path d="M5.8 11.3 2 22l10.7-3.8z"/><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="M22 13.3a2.3 2.3 0 0 0-2.4-2.3 2.3 2.3 0 0 1-2.4-2.6 2.4 2.4 0 0 0-4-2.1"/><path d="M11 13c1.3-1.3 1.4-3.2.3-4.3-1.1-1.1-3-1-4.3.3z"/></> },
  Shirt:       { s: <path d="M20.4 6.5 17 4.2A2 2 0 0 0 15.9 4h-.4a3.5 3.5 0 0 1-7 0h-.4A2 2 0 0 0 7 4.2L3.6 6.5a1 1 0 0 0-.3 1.3l1.5 2.6a1 1 0 0 0 1.2.45L7.5 10v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-9l1.5.85a1 1 0 0 0 1.2-.45l1.5-2.6a1 1 0 0 0-.3-1.3z"/> },
  Baby:        { s: <><path d="M9 12h.01M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5S14.4 8 13 8c-.9 0-1.6-.5-1.6-1.2"/></> },
  Speaker:     { s: <><rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="14.5" r="3.6"/><path d="M12 7h.01"/></> },
  Laptop:      { s: <><path d="M4.5 5.5A1.5 1.5 0 0 1 6 4h12a1.5 1.5 0 0 1 1.5 1.5V16h-15z"/><path d="M2.5 19h19a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1z"/><path d="M2.5 19 4.5 16h15l2 3"/></> },
  Dumbbell:    { s: <><path d="m6.6 17.4 10.8-10.8"/><rect x="1.6" y="11.4" width="7" height="3.4" rx="1" transform="rotate(-45 5.1 13.1)"/><rect x="15.4" y="9.2" width="7" height="3.4" rx="1" transform="rotate(-45 18.9 10.9)"/><path d="m2.1 21.9 1.4-1.4M20.5 3.5l1.4-1.4"/></> },
  HeartPulse:  { s: <><path d="M19.5 13 12 21l-7.5-8A5.4 5.4 0 0 1 12 5.7 5.4 5.4 0 0 1 19.5 13z"/><path d="M3.5 12h4l1.5-2.5 2.5 5L13 11l1.2 1.7h6.3"/></> },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof NK_ICONS;

export function Icon({
  name, size = 24, stroke = 2, color = "currentColor", fill = "none", style, className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  // Widen from the per-entry literal types `satisfies` preserves on NK_ICONS.
  const def: IconDef = NK_ICONS[name];
  // Star/MapPin can be requested filled (fill !== 'none').
  // Colors flow through `currentColor` (set via style.color) so callers can pass --nk-* tokens —
  // CSS custom properties don't resolve in raw SVG stroke/fill attributes.
  const wantFill = fill && fill !== "none";
  // Filled glyphs (Play/Apple/Facebook/Linkedin define only `f`) fall through `!def.s`.
  if (def.f && (def.fOnly || !def.s || wantFill)) {
    return (
      <svg className={"nk-ico " + (className || "")} xmlns="http://www.w3.org/2000/svg"
        width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"
        style={{ color: wantFill ? fill : color, ...style }}>
        <path d={def.f} />
      </svg>
    );
  }
  return (
    <svg className={"nk-ico " + (className || "")} xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24" fill={wantFill ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ color: wantFill ? fill : color, ...style }}>
      {def.s}
    </svg>
  );
}

/* ---------------- Decorative background pattern ----------------
   Brand pattern served AVIF→WebP→PNG via <picture>. Always decorative
   (alt="", aria-hidden); lazy by default — pass `priority` for above-the-fold. */
type PatternName = "hero-pattern" | "section-pattern" | "footer-pattern";

export function Pattern({ name, className, style, priority = false }: {
  name: PatternName;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  const base = `/naudokis/${name}`;
  return (
    <picture>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img src={`${base}.png`} alt="" aria-hidden="true" className={className} style={style}
        loading={priority ? undefined : "lazy"} />
    </picture>
  );
}

/* ---------------- Logo ---------------- */
// A real link to the locale home (a logo is expected to navigate, not no-op).
export function Logo({ height = 36 }: { height?: number }) {
  const { locale } = useI18nOptional();
  return (
    <Link className="nk-logo" href={localeHome(locale)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" style={{ height, width: "auto" }} />
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
        {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
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
   Until the store listings go live the badge opens the install-bridge modal
   (a real button, not a dead link). Inside that modal `interactive={false}`
   renders a plain image — a badge that reopens the same dialog would loop. */
export function StoreBadge({
  store, height = 52, footer = false, interactive = true,
}: {
  store: "google" | "apple";
  height?: number;
  footer?: boolean;
  interactive?: boolean;
}) {
  const { dict } = useI18nOptional();
  const isGoogle = store === "google";
  const suffix = footer ? "-footer" : "";
  /* eslint-disable @next/next/no-img-element */
  const img = (
    <img src={isGoogle ? `/naudokis/btn-google-play${suffix}.png` : `/naudokis/btn-app-store${suffix}.png`}
      alt={isGoogle ? dict.bridge.googlePlayAlt : dict.bridge.appStoreAlt}
      style={{ height, width: "auto" }} />
  );
  /* eslint-enable @next/next/no-img-element */
  if (!interactive) {
    return <span style={{ display: "inline-flex" }}>{img}</span>;
  }
  return (
    <button type="button" className="nk-badgebtn"
      onClick={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })}>
      {img}
    </button>
  );
}

export function AppBadges({ gap = 20, height = 52, footer = false, interactive = true }: {
  gap?: number; height?: number; footer?: boolean; interactive?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap }}>
      <StoreBadge store="google" height={height} footer={footer} interactive={interactive} />
      <StoreBadge store="apple" height={height} footer={footer} interactive={interactive} />
    </div>
  );
}

/* ---------------- Faux QR ---------------- */
const QR_N = 21;

function QrFinder({ x, y, cell, light }: { x: number; y: number; cell: number; light: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={cell * 7} height={cell * 7} fill="#000" />
      <rect x={cell} y={cell} width={cell * 5} height={cell * 5} fill={light ? "#F9F9F9" : "#fff"} />
      <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} fill="#000" />
    </g>
  );
}

// deterministic pseudo-random modules (stable across renders)
function qrCells(cell: number): React.ReactNode[] {
  const cells: React.ReactNode[] = [];
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= QR_N - 7) || (r >= QR_N - 7 && c < 7);
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let r = 0; r < QR_N; r++) for (let c = 0; c < QR_N; c++) {
    if (isFinder(r, c)) continue;
    if (rnd() > 0.55) cells.push(<rect key={r + "_" + c} x={c * cell} y={r * cell} width={cell} height={cell} fill="#000" />);
  }
  return cells;
}

export function QR({ size = 152, light = false }: { size?: number; light?: boolean }) {
  const cell = size / QR_N;
  const cells = useMemo(() => qrCells(cell), [cell]);
  return (
    <span style={{ background: "#fff", borderRadius: 8, padding: 16, display: "inline-flex" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
        {cells}
        <QrFinder x={0} y={0} cell={cell} light={light} />
        <QrFinder x={cell * (QR_N - 7)} y={0} cell={cell} light={light} />
        <QrFinder x={0} y={cell * (QR_N - 7)} cell={cell} light={light} />
      </svg>
    </span>
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
    green: { bg: "var(--nk-green-tint)", fg: "var(--nk-green)" },
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
        <span>{active && selected ? selected.label : label}</span>
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
    <button type="button" className={"nk-pillctl" + (on ? " is-active" : "")} onClick={() => onChange(!on)} aria-pressed={on} style={{
      display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 999, padding: "11px 16px", cursor: "pointer",
      fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, whiteSpace: "nowrap",
    }}>
      {icon && <Icon name={icon} size={16} stroke={2} color={on ? "var(--nk-accent-text)" : "var(--nk-text-muted)"} />} {children}
    </button>
  );
}
