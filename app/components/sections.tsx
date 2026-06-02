"use client";
// Naudokis UI kit — page sections.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Icon, Logo, Button, AppBadges, SectionHead, Dots, QR,
} from "./ui";
import {
  OfferCard, CategoryCard, FeatureCard, Testimonial, FaqRow, OfferCardSkeleton, CategoryCardSkeleton, EmptyState,
} from "./cards";
import { useCategories } from "@/app/lib/categories";
import { useListings } from "@/app/lib/listings";
import { LT_CITIES } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";
import { locales, defaultLocale, type Locale } from "@/app/lib/i18n/config";

/* ---------------- Nav ---------------- */
export function Nav({ onSearch }: { onSearch: () => void }) {
  const { dict } = useI18n();
  return (
    <header className="nk-nav-bar" style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--nk-glass-nav)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--nk-border-faint)" }}>
      <div className="nk-container" style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button className="nk-btn nk-btn--ghost" onClick={onSearch} style={{ borderColor: "var(--nk-border)" }}>
            <Icon name="Search" size={17} stroke={2.2} color="var(--nk-text)" /> {dict.nav.search}
          </button>
          <Link className="nk-nav nk-link" href="/kategorijos">{dict.nav.category}</Link>
          <a className="nk-nav nk-link" href="#kontaktai">{dict.nav.contacts}</a>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const { locale } = useI18n();
  const pathname = usePathname();
  // Strip a leading locale prefix to get the bare path, then re-prefix for the
  // target locale (default locale is unprefixed). Keeps you on the same page.
  const bare = pathname.replace(/^\/(lt|en)(?=\/|$)/, "") || "/";
  const href = (l: Locale) => (l === defaultLocale ? bare : `/${l}${bare === "/" ? "" : bare}`);
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 20, height: 14, borderRadius: 2, overflow: "hidden", display: "inline-flex", flexDirection: "column" }}>
        <i style={{ flex: 1, background: "#FDB913" }} /><i style={{ flex: 1, background: "#006A44" }} /><i style={{ flex: 1, background: "#C1272D" }} />
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {locales.map((l, i) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span className="nk-nav" style={{ color: "var(--nk-text-muted)" }}>/</span>}
            <Link href={href(l)} className="nk-nav nk-link" aria-current={l === locale ? "true" : undefined}
              style={{ color: l === locale ? "var(--nk-text)" : "var(--nk-text-2)", fontWeight: l === locale ? 700 : undefined }}>
              {l.toUpperCase()}
            </Link>
          </span>
        ))}
      </span>
    </span>
  );
}

/* ---------------- Hero ---------------- */
export function Hero() {
  const { dict } = useI18n();
  return (
    <section id="top" style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/hero-pattern.png" alt="" aria-hidden="true"
        style={{ position: "absolute", right: -80, top: -120, width: 1000, opacity: 0.30, pointerEvents: "none" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "40px 90px" }}>
        <div className="nk-hero-panel" style={{ position: "relative", borderRadius: 20, background: "var(--nk-glass)", backdropFilter: "blur(40px)",
          display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, padding: 60, minHeight: 700 }}>
          {/* left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36, justifyContent: "center", maxWidth: 680 }}>
            <span style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 14, background: "var(--nk-green)", borderRadius: 27, padding: "6px 18px 6px 6px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, background: "var(--nk-bg)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="Users" size={18} color="var(--nk-text)" stroke={1.8} />
              </span>
              <b style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 18, color: "var(--nk-bg)", whiteSpace: "nowrap" }}>{dict.hero.badge}</b>
            </span>
            <AppBadges />
            <h1 className="nk-h-hero" style={{ margin: 0 }}>{dict.hero.title}</h1>
            <p className="nk-body" style={{ margin: 0, maxWidth: 540 }}>{dict.hero.body}</p>
            <SearchBar />
          </div>
          {/* right column — real app device + QR */}
          <div className="nk-hero-media" style={{ position: "relative", minHeight: 560 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/naudokis/hero-phone.png" alt={dict.hero.phoneAlt} style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-46%)", height: "118%", width: "auto", maxWidth: "none", filter: "drop-shadow(10px 18px 42px rgba(22,22,22,.55))" }} />
            <div style={{ position: "absolute", right: 0, bottom: 8 }}><QR size={132} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchBar() {
  const { dict } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [openCity, setOpenCity] = useState(false);
  const cityRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (cityRef.current && e.target instanceof Node && !cityRef.current.contains(e.target)) setOpenCity(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (city) p.set("city", city);
    const qs = p.toString();
    router.push(`/skelbimai${qs ? `?${qs}` : ""}`);
  };
  const cityOptions: [string, string][] = [["", dict.cityPicker.all], ...LT_CITIES.map((c) => [c, c] as [string, string])];
  return (
    <form className="nk-search" onSubmit={go} style={{
      display: "flex", alignItems: "center", gap: 8, background: "#F9F9F9", border: "1px solid var(--nk-border-soft)",
      borderRadius: 34, boxShadow: "var(--nk-shadow-input)", padding: "8px 8px 8px 24px", maxWidth: 662,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <Icon name="Search" size={20} color="var(--nk-bg)" stroke={2} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.search.placeholder}
          style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 18, color: "var(--nk-bg)", width: 150 }} />
      </span>
      <span style={{ width: 1, height: 36, background: "var(--nk-border-soft)" }} />
      <span ref={cityRef} style={{ position: "relative" }}>
        <button type="button" onClick={() => setOpenCity((v) => !v)} aria-haspopup="listbox" aria-expanded={openCity}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 22, cursor: "pointer", background: openCity ? "#ECECEC" : "transparent", transition: "background .15s ease" }}>
          <Icon name="MapPin" size={20} color="var(--nk-bg)" stroke={2} />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 18, color: city ? "var(--nk-bg)" : "var(--nk-text-slate)", whiteSpace: "nowrap" }}>{city || dict.search.where}</span>
          <Icon name="ChevronDown" size={16} stroke={2.2} color="var(--nk-light-meta)" style={{ transform: openCity ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
        </button>
        {openCity && (
          <span role="listbox" style={{ position: "absolute", bottom: "calc(100% + 12px)", right: 0, minWidth: 200, background: "#FFFFFF", border: "1px solid var(--nk-border-soft)", borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 20px 50px rgba(0,0,0,.28)", zIndex: 40 }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nk-light-meta)", padding: "8px 12px 6px" }}>{dict.cityPicker.heading}</span>
            {cityOptions.map(([val, label]) => {
              const active = city === val;
              return (
                <button key={label} type="button" role="option" aria-selected={active}
                  onClick={() => { setCity(val); setOpenCity(false); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    background: active ? "var(--nk-purple-soft)" : "transparent", color: active ? "var(--nk-purple-deep)" : "var(--nk-bg)",
                    fontFamily: "var(--nk-font-body)", fontSize: 17 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="MapPin" size={17} color={active ? "var(--nk-purple-deep)" : "#9A9A9A"} stroke={2} /> {label}</span>
                  {active && <Icon name="BadgeCheck" size={18} color="var(--nk-purple-deep)" stroke={2} />}
                </button>
              );
            })}
          </span>
        )}
      </span>
      <button type="submit" className="nk-btn nk-btn--primary" style={{ padding: "16px 36px" }}>{dict.search.submit}</button>
    </form>
  );
}

/* ---------------- Categories ---------------- */
export function Categories() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const t = dict.categories;
  const { data, isLoading, isError, refetch } = useCategories(locale);
  const list = (data ?? []).slice(0, 6);
  return (
    <section id="kategorijos" className="nk-container" style={{ paddingBlock: "clamp(72px, 10vw, 120px)" }}>
      <SectionHead eyebrow={t.eyebrow} title={t.title}
        action={<Button variant="outline" onClick={() => router.push("/kategorijos")}>{t.all}</Button>} />
      {isLoading ? (
        <div className="nk-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="LayoutGrid"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          actionLabel={t.errorAction} onAction={() => refetch()} />
      ) : (
        <div className="nk-grid-6 nk-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20 }}>
          {list.map((c) => <CategoryCard key={c.id} title={c.title} tint={c.tint} onOpen={() => router.push(`/skelbimai?cat=${encodeURIComponent(c.id)}`)} />)}
        </div>
      )}
    </section>
  );
}

/* ---------------- Offers ---------------- */
export function Offers() {
  const { locale, dict } = useI18n();
  const t = dict.offers;
  const { data, isLoading, isError, refetch } = useListings(locale);
  const list = (data ?? []).slice(0, 4);
  return (
    <section id="skelbimai" className="nk-container" style={{ paddingBlock: "clamp(72px, 10vw, 120px)" }}>
      <SectionHead eyebrow={t.eyebrow} title={t.title} />
      {isLoading ? (
        <div className="nk-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => <OfferCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="SearchX"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          actionLabel={t.errorAction} onAction={() => refetch()} />
      ) : (
        <div className="nk-grid-4 nk-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {list.map((o) => (
            <OfferCard key={o.id} title={o.title} city={o.city} price={o.price} img={o.img}
              unit={dict.common.perDay}
              rating={o.rating}
              count={o.ratingCount > 0 ? dict.common.reviewCount(o.ratingCount) : undefined}
              href={`/skelbimai/${o.id}`} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- Features band ---------------- */
export function Features() {
  const { dict } = useI18n();
  return (
    <section style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/section-pattern.png" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.40 }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "clamp(80px, 11vw, 140px)" }}>
        <div className="nk-reveal nk-row">
          {dict.features.map((f, i) => <div key={f.title} className="nk-reveal" data-delay={(i % 3) + 1} style={{ display: "flex", flex: 1 }}><FeatureCard {...f} /></div>)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials() {
  const { dict } = useI18n();
  const q = dict.testimonials.quote;
  return (
    <section className="nk-container" style={{ paddingBlock: "clamp(96px, 14vw, 200px)" }}>
      <SectionHead eyebrow={dict.testimonials.eyebrow} title={dict.testimonials.title} />
      <div className="nk-reveal nk-row">
        <Testimonial name="Eglė J." quote={q} avatarTint="#C1C1C1" />
        <Testimonial name="Marius V." quote={q} avatarTint="#A7B0AE" />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}><Dots n={4} active={0} /></div>
    </section>
  );
}

/* ---------------- CTA banner ---------------- */
export function CtaBanner() {
  const { dict } = useI18n();
  return (
    <section className="nk-container" style={{ paddingBlock: "clamp(80px, 11vw, 140px)" }}>
      <div className="nk-reveal nk-cta" style={{ position: "relative", borderRadius: 20, background: "var(--nk-green)", overflow: "hidden", minHeight: 620 }}>
        {/* phone bleeding from the top, filling the right half down to the bottom edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nk-cta__media" src="/naudokis/download-phone.png" alt={dict.cta.phoneAlt} style={{ position: "absolute", right: 0, top: -56, height: 680, width: "auto", maxWidth: "52%", objectFit: "cover", objectPosition: "left top", filter: "drop-shadow(0 22px 44px rgba(16,16,16,.30))" }} />
        <Sparkles />
        <div className="nk-cta__badges" style={{ position: "absolute", left: 60, top: 60 }}><AppBadges /></div>
        <div className="nk-cta__body" style={{ position: "absolute", left: 60, bottom: 60, maxWidth: 808, display: "flex", flexDirection: "column", gap: 18 }}>
          <h2 className="nk-h-cta">{dict.cta.title}</h2>
          <p style={{ margin: 0, maxWidth: 640, fontFamily: "var(--nk-font-body)", fontSize: 20, lineHeight: "32px", color: "var(--nk-bg)" }}>{dict.cta.body}</p>
        </div>
        <div className="nk-cta__media" style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)" }}><QR size={208} /></div>
      </div>
    </section>
  );
}

type Sparkle = { left: number; top: number; color: string; size: number };
const SPARKLES: Sparkle[] = [
  { left: 58, top: 18, color: "var(--nk-yellow)", size: 14 },
  { left: 70, top: 30, color: "var(--nk-purple)", size: 18 },
  { left: 50, top: 42, color: "var(--nk-text)", size: 12 },
  { left: 64, top: 12, color: "var(--nk-purple)", size: 10 },
  { left: 44, top: 24, color: "var(--nk-yellow)", size: 16 },
  { left: 60, top: 6, color: "var(--nk-yellow)", size: 12 },
];

function Sparkles() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SPARKLES.map(({ left, top, color, size }) => (
        <Icon key={`${left}-${top}`} name="X" size={size} color={color} stroke={3} style={{ position: "absolute", left: left + "%", top: top + "%" }} />
      ))}
      <span style={{ position: "absolute", left: "73%", top: "20%", width: 12, height: 12, borderRadius: 6, background: "var(--nk-yellow)" }} />
      <span style={{ position: "absolute", left: "47%", top: "16%", width: 12, height: 12, borderRadius: 6, background: "var(--nk-purple-deep)" }} />
    </div>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  const { dict } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--nk-bg)" }}>
      <div className="nk-container" style={{ paddingBlock: "clamp(80px, 11vw, 140px)", maxWidth: 1320 }}>
        <div className="nk-reveal" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 40, alignItems: "center", marginBottom: 60 }}>
          <h2 className="nk-h-card" style={{ margin: 0 }}>{dict.faq.heading}</h2>
          <p className="nk-body" style={{ margin: 0, maxWidth: 866, color: "var(--nk-yellow)" }}>{dict.faq.subheading}</p>
        </div>
        <div className="nk-reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {dict.faq.items.map((f, i) => <FaqRow key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const { dict } = useI18n();
  return (
    <footer id="kontaktai" style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/footer-pattern.png" alt="" aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, width: 1053, height: "100%", objectFit: "cover", objectPosition: "right", opacity: 0.34 }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Logo />
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "nowrap" }}>
              <span className="nk-nav" style={{ whiteSpace: "nowrap" }}>+370 643 49559</span>
              <span className="nk-nav" style={{ color: "var(--nk-text-2)", whiteSpace: "nowrap" }}>info@naudokis.lt</span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {(["Facebook", "Instagram", "Linkedin"] as const).map((n) => (
                <a key={n} className="nk-link" href="#" aria-label={n} aria-disabled="true" onClick={(e) => e.preventDefault()}
                  style={{ width: 24, height: 24, display: "flex" }}><Icon name={n} size={22} color="var(--nk-text)" stroke={1.8} /></a>
              ))}
            </div>
          </div>
          <AppBadges footer={true} height={48} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, marginTop: 64, flexWrap: "wrap" }}>
          <nav style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
            {dict.footer.links.map((link) => (
              <Link key={link.href} className="nk-nav nk-link" href={link.href} style={{ color: "var(--nk-text-2)", whiteSpace: "nowrap" }}>{link.label}</Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {([["pay-visa", "Visa"], ["pay-apple", "Apple Pay"], ["pay-google", "Google Pay"], ["pay-mastercard", "Mastercard"]] as const).map(([f, a]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/naudokis/${f}.png`} alt={a} style={{ height: 36, width: "auto" }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
