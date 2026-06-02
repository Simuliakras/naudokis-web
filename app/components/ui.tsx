"use client";
// Naudokis UI kit — primitives.
import React, { useMemo } from "react";

/* ---------------- Icon ----------------
   Self-contained icon set (Lucide-style geometry). `s` = stroke outline children,
   `f` = filled glyph path. Keeps rendering fully reliable & offline. */
type IconDef = {
  s?: React.ReactNode;
  f?: string;
  fOnly?: boolean;
};

const NK_ICONS: Record<string, IconDef> = {
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
  Play:        { f: "M6 3v18l15-9z" },
  Apple:       { f: "M16.36 12.46c.02 2.45 2.15 3.27 2.18 3.28-.02.06-.34 1.16-1.12 2.3-.67.98-1.37 1.96-2.47 1.98-1.08.02-1.43-.64-2.66-.64s-1.62.62-2.64.66c-1.06.04-1.87-1.06-2.55-2.04-1.39-2-2.45-5.66-1.03-8.13.71-1.23 1.97-2 3.34-2.02 1.04-.02 2.02.7 2.66.7.63 0 1.83-.86 3.08-.74.53.02 2 .21 2.95 1.6-.08.05-1.76 1.03-1.74 3.07M14.4 5.8c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.39-1.14" },
  Facebook:    { f: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94" },
  Instagram:   { s: <><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></> },
  Linkedin:    { f: "M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5M3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.32-1.96 2.69V21H10z" },
  SearchX:     { s: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 8.5 5 5"/><path d="m13.5 8.5-5 5"/></> },
  Inbox:       { s: <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/></> },
  LayoutGrid:  { s: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></> },
};

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
  const def = NK_ICONS[name];
  if (!def) return <svg width={size} height={size} viewBox="0 0 24 24" style={style} />;
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

/* ---------------- Logo ---------------- */
export function Logo({ height = 30 }: { height?: number }) {
  return (
    <a className="nk-logo" href="#top" onClick={(e) => e.preventDefault()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" style={{ height, width: "auto" }} />
    </a>
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
export function Dots({ n = 4, active = 0 }: { n?: number; active?: number }) {
  return (
    <div className="nk-dots">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={"nk-dot" + (i === active ? " nk-dot--on" : "")} />
      ))}
    </div>
  );
}

/* ---------------- App-store badges ---------------- */
export function StoreBadge({
  store, height = 52, footer = false,
}: {
  store: "google" | "apple";
  height?: number;
  footer?: boolean;
}) {
  const isGoogle = store === "google";
  const suffix = footer ? "-footer" : "";
  return (
    <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-flex" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={isGoogle ? `/naudokis/btn-google-play${suffix}.png` : `/naudokis/btn-app-store${suffix}.png`}
        alt={isGoogle ? "Get it on Google Play" : "Download on the App Store"}
        style={{ height, width: "auto" }} />
    </a>
  );
}

export function AppBadges({ gap = 20, height = 52, footer = false }: { gap?: number; height?: number; footer?: boolean }) {
  return (
    <div style={{ display: "flex", gap }}>
      <StoreBadge store="google" height={height} footer={footer} />
      <StoreBadge store="apple" height={height} footer={footer} />
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
