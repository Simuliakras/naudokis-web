import Image from "next/image";
import Link from "next/link";
import type React from "react";
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, Baby, BadgeCheck, Calendar, Camera, Car,
  ChevronDown, ChevronRight, Coins, CreditCard, Download, Dumbbell, Expand, Flag, Globe,
  Handshake, Heart, HeartPulse,
  Home, Image as ImageIcon, ImageOff, Inbox, Info, Laptop, LayoutGrid, LoaderCircle, type LucideIcon, Mail,
  MapPin, Menu, MessageCircle, MoreHorizontal, PartyPopper, Phone, RefreshCcw, ScrollText, Search,
  SearchX, Share2, ShieldCheck, Shirt, SlidersHorizontal, Smartphone, Sparkles,
  Speaker, Star, Tag, Truck, User, Users, Wrench, X,
} from "lucide-react";
import { localeHome, type Locale } from "@/app/lib/i18n/config";
import { DynamicQR } from "./DynamicQR";

/* ---------------- Icon ----------------
   Canonical, server-renderable icon set shared by the server homepage sections
   and the client UI kit — ui.tsx re-exports Icon / Pattern / QR / IconName from
   here so there is a single source of truth.

   Generic glyphs come straight from lucide-react (Lucide is the design language).
   The handful Lucide can't supply stay as inline SVG: the Apple / Facebook /
   Instagram / LinkedIn brand marks (Lucide ships no trademarked logos — its
   `Apple` is a fruit), plus the solid Play triangle (Lucide's Play is an outline).
   `s` = stroke outline children, `f` = filled glyph path. */
type IconDef = {
  s?: React.ReactNode;
  f?: string;
};

type IconEntry =
  | { kind: "lucide"; C: LucideIcon }
  | { kind: "glyph"; def: IconDef };

const lucide = (C: LucideIcon): IconEntry => ({ kind: "lucide", C });
const glyph = (def: IconDef): IconEntry => ({ kind: "glyph", def });

const ICONS = {
  Search: lucide(Search), MapPin: lucide(MapPin), Star: lucide(Star),
  ArrowRight: lucide(ArrowRight), ArrowLeft: lucide(ArrowLeft), ArrowUp: lucide(ArrowUp), ChevronDown: lucide(ChevronDown),
  Heart: lucide(Heart), Image: lucide(ImageIcon), User: lucide(User), Users: lucide(Users),
  ShieldCheck: lucide(ShieldCheck), X: lucide(X), Menu: lucide(Menu), Phone: lucide(Phone),
  Mail: lucide(Mail), SearchX: lucide(SearchX), Inbox: lucide(Inbox), LayoutGrid: lucide(LayoutGrid),
  ArrowUpDown: lucide(ArrowUpDown), SlidersHorizontal: lucide(SlidersHorizontal), Home: lucide(Home),
  Car: lucide(Car), Tag: lucide(Tag), Calendar: lucide(Calendar), MessageCircle: lucide(MessageCircle),
  Info: lucide(Info), BadgeCheck: lucide(BadgeCheck), RefreshCcw: lucide(RefreshCcw), Share2: lucide(Share2),
  MoreHorizontal: lucide(MoreHorizontal), ChevronRight: lucide(ChevronRight), Sparkles: lucide(Sparkles),
  Download: lucide(Download), Camera: lucide(Camera), Handshake: lucide(Handshake), Coins: lucide(Coins),
  Smartphone: lucide(Smartphone), Wrench: lucide(Wrench),
  PartyPopper: lucide(PartyPopper), Shirt: lucide(Shirt), Baby: lucide(Baby), Speaker: lucide(Speaker),
  Laptop: lucide(Laptop), Dumbbell: lucide(Dumbbell), HeartPulse: lucide(HeartPulse),
  Truck: lucide(Truck), LoaderCircle: lucide(LoaderCircle), ImageOff: lucide(ImageOff),
  CreditCard: lucide(CreditCard), ScrollText: lucide(ScrollText), Globe: lucide(Globe),
  Flag: lucide(Flag), Expand: lucide(Expand),

  // Inline glyphs Lucide can't supply (brand marks + the solid Play triangle).
  Play:      glyph({ f: "M6 3v18l15-9z" }),
  Apple:     glyph({ f: "M16.36 12.46c.02 2.45 2.15 3.27 2.18 3.28-.02.06-.34 1.16-1.12 2.3-.67.98-1.37 1.96-2.47 1.98-1.08.02-1.43-.64-2.66-.64s-1.62.62-2.64.66c-1.06.04-1.87-1.06-2.55-2.04-1.39-2-2.45-5.66-1.03-8.13.71-1.23 1.97-2 3.34-2.02 1.04-.02 2.02.7 2.66.7.63 0 1.83-.86 3.08-.74.53.02 2 .21 2.95 1.6-.08.05-1.76 1.03-1.74 3.07M14.4 5.8c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.56-.85 2.48.9.07 1.82-.46 2.39-1.14" }),
  Facebook:  glyph({ f: "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94" }),
  Instagram: glyph({ s: <><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></> }),
  Linkedin:  glyph({ f: "M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5M3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.32-1.96 2.69V21H10z" }),
} satisfies Record<string, IconEntry>;

export type IconName = keyof typeof ICONS;

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
  // Star/Heart/MapPin etc. can be requested filled (fill !== 'none'). Colors flow
  // through `currentColor` (set via style.color) so callers can pass --nk-* tokens
  // — CSS custom properties don't resolve in raw SVG stroke/fill attributes, so we
  // never forward a token to Lucide's `color` prop.
  const wantFill = !!fill && fill !== "none";
  const cls = className ? "nk-ico " + className : "nk-ico";
  const tone: React.CSSProperties = { color: wantFill ? fill : color, ...style };

  const entry = ICONS[name];
  if (entry.kind === "lucide") {
    const LucideGlyph = entry.C;
    return (
      <LucideGlyph className={cls} size={size} strokeWidth={stroke}
        fill={wantFill ? "currentColor" : "none"} style={tone} />
    );
  }

  // Inline glyph: filled (`f`) path, or stroke (`s`) children for Instagram.
  const def = entry.def;
  if (def.f && (!def.s || wantFill)) {
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg"
        width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"
        style={tone}>
        <path d={def.f} />
      </svg>
    );
  }
  return (
    <svg className={cls} xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24" fill={wantFill ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={tone}>
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

// Real, scannable install QR. Without a `value` it serves the committed static
// matrix public/naudokis/install-qr.svg (built via scripts/generate-install-qr.mjs ·
// `yarn gen:qr`), encoding the smart-install URL https://www.naudokis.lt/go which
// sniffs the OS and routes to the right store. Pass a `value` (e.g. a per-code
// Branch link on /invite) to encode it at runtime via <DynamicQR/> instead.
// Decorative for AT (a QR can only be scanned visually) — the adjacent install
// CTA + store badges are the non-visual path.
export function QR({ size = 152, value }: { size?: number; value?: string }) {
  if (value) {
    return <DynamicQR value={value} size={size} />;
  }
  return (
    <span className="nk-qr-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/install-qr.svg" alt="" aria-hidden="true" width={size} height={size}
        style={{ display: "block", width: size, height: size }} />
    </span>
  );
}
