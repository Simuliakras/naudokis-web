import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { localeHome, type Locale } from "@/app/lib/i18n/config";

/* ---------------- Icon ----------------
   Canonical, server-renderable icon set (Lucide-style geometry) shared by both
   the server homepage sections and the client UI kit — ui.tsx re-exports Icon /
   Pattern / QR / IconName from here so there is a single source of truth.
   `s` = stroke outline children, `f` = filled glyph path. */
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
  // Star/MapPin can be requested filled (fill !== 'none'). Colors flow through
  // `currentColor` (set via style.color) so callers can pass --nk-* tokens —
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

export function LogoMark({ locale, height = 36 }: { locale: Locale; height?: number }) {
  return (
    <Link className="nk-logo" href={localeHome(locale)}>
      <Image src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={287} height={64}
        style={{ height, width: "auto" }} />
    </Link>
  );
}

// Real, scannable install QR. The matrix is generated at build time into the
// committed static asset public/naudokis/install-qr.svg (see scripts/
// generate-install-qr.mjs · `yarn gen:qr`), encoding the smart-install URL
// https://www.naudokis.lt/go which sniffs the OS and routes to the right store.
// Decorative for AT (a QR can only be scanned visually) — the adjacent install
// CTA + store badges are the non-visual path.
export function QR({ size = 152 }: { size?: number }) {
  return (
    <span style={{ background: "#fff", borderRadius: 8, padding: 16, display: "inline-flex" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/install-qr.svg" alt="" aria-hidden="true" width={size} height={size}
        style={{ display: "block", width: size, height: size }} />
    </span>
  );
}

