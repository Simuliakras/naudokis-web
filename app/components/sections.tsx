"use client";
// Naudokis UI kit — page sections.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Icon, type IconName, Logo, Button, AppBadges, SectionHead, Dots, RoundArrow, QR, openRedirect,
} from "./ui";
import {
  OfferCard, CategoryCard, FeatureCard, Testimonial, FaqRow, OfferCardSkeleton, CategoryCardSkeleton, EmptyState,
} from "./cards";
import { useCategories } from "@/app/lib/categories";
import { useListings } from "@/app/lib/listings";
import { LT_CITIES } from "@/app/lib/cities";
import { listingSearchHref } from "@/app/lib/search";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/app/lib/contact";
import { useI18n } from "./I18nProvider";
import { locales, defaultLocale, barePath, type Locale } from "@/app/lib/i18n/config";

/* ---------------- Nav ----------------
   Translucent sticky bar that condenses on scroll (.nk-scrolled toggled in
   HomeApp). The "Paieška" ghost button swaps for an inline search once the hero
   search bar scrolls out of view; on mobile (≤820px) the links collapse into a
   hamburger drawer. */
export function Nav({ onSearch }: { onSearch: () => void }) {
  const { dict } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Active-route flag for aria-current — strip any locale prefix to the bare
  // path (the default locale is unprefixed) before matching.
  const isCategories = barePath(pathname) === "/kategorijos";
  const isHowItWorks = barePath(pathname) === "/kaip-tai-veikia";

  // Condense the bar once the page scrolls — wired here (not per-page) so it
  // works on every screen that renders the Nav.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Expand the inline nav search once the hero search bar leaves the viewport.
  // On pages without a hero search (#nk-hero-search) the observer never fires,
  // so the ghost button stays.
  useEffect(() => {
    const hero = document.getElementById("nk-hero-search");
    if (!hero || !("IntersectionObserver" in window)) {
      return;
    }
    const io = new IntersectionObserver(([e]) => setSearchExpanded(!e.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Close the drawer when the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 820) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close the drawer on navigation (the route — not just the hash — changed).
  // Tracking the previous path in state and adjusting during render is React's
  // recommended alternative to a setState-in-effect here.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (menuOpen) {
      setMenuOpen(false);
    }
  }

  // While the drawer is open: move focus to its first item, close on Escape and
  // return focus to the burger (matching the modal a11y in AppRedirect).
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const doSearch = () => { setMenuOpen(false); onSearch(); };

  return (
    <header className={"nk-nav-bar" + (scrolled ? " nk-scrolled" : "")}>
      <div className="nk-nav-inner nk-container">
        <Logo />
        <nav className="nk-nav-links" aria-label={dict.nav.primary}>
          {searchExpanded
            ? <NavSearch key="navsearch" />
            : (
              <button key="navbtn" className="nk-btn nk-btn--ghost nk-fadein" onClick={doSearch} style={{ borderColor: "var(--nk-border)" }}>
                <Icon name="Search" size={17} stroke={2.2} color="var(--nk-text)" /> {dict.nav.search}
              </button>
            )}
          <Link className="nk-nav nk-link" href="/kaip-tai-veikia" aria-current={isHowItWorks ? "page" : undefined}>{dict.nav.howItWorks}</Link>
          <Link className="nk-nav nk-link" href="/kategorijos" aria-current={isCategories ? "page" : undefined}>{dict.nav.category}</Link>
          <a className="nk-nav nk-link" href="#kontaktai">{dict.nav.contacts}</a>
          <LocaleSwitcher />
          <button className="nk-btn nk-btn--primary" style={{ padding: "10px 20px", fontSize: 15 }}
            onClick={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })}>
            <Icon name="Download" size={17} stroke={2.2} color="var(--nk-text)" /> {dict.nav.getApp}
          </button>
        </nav>
        <button ref={burgerRef} className="nk-nav-burger" aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
          aria-expanded={menuOpen} aria-controls="nk-mobile-nav" onClick={() => setMenuOpen((v) => !v)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={22} stroke={2.2} color="var(--nk-text)" />
        </button>
      </div>
      <div ref={drawerRef} id="nk-mobile-nav" className={"nk-nav-drawer" + (menuOpen ? " open" : "")}>
        <div className="nk-nav-drawer-inner">
          <button className="nk-drawer-item" onClick={doSearch}>
            <Icon name="Search" size={20} stroke={2.2} color="var(--nk-text)" /> {dict.nav.search}
          </button>
          <Link className="nk-drawer-item" href="/kaip-tai-veikia" aria-current={isHowItWorks ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            <Icon name="Sparkles" size={20} stroke={2} color="var(--nk-text)" /> {dict.nav.howItWorks}
          </Link>
          <Link className="nk-drawer-item" href="/kategorijos" aria-current={isCategories ? "page" : undefined} onClick={() => setMenuOpen(false)}>
            <Icon name="LayoutGrid" size={20} stroke={2} color="var(--nk-text)" /> {dict.nav.category}
          </Link>
          <a className="nk-drawer-item" href="#kontaktai" onClick={() => setMenuOpen(false)}>
            <Icon name="MessageCircle" size={20} stroke={2} color="var(--nk-text)" /> {dict.nav.contacts}
          </a>
          <div className="nk-drawer-locale"><LocaleSwitcher /></div>
          <button className="nk-btn nk-btn--primary" style={{ margin: "4px 12px 0", justifyContent: "center" }}
            onClick={() => { setMenuOpen(false); openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody }); }}>
            <Icon name="Download" size={18} stroke={2.2} color="var(--nk-text)" /> {dict.nav.getApp}
          </button>
        </div>
      </div>
    </header>
  );
}

/* Inline nav search — compact echo of the hero SearchBar; routes to the feed. */
function NavSearch() {
  const { dict } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(listingSearchHref({ q, city }));
  };
  return (
    <form className="nk-navsearch nk-fadein" onSubmit={go} role="search">
      <Icon name="Search" size={17} stroke={2.2} color="var(--nk-text-muted)" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.search.placeholder} aria-label={dict.search.inputLabel} />
      <span className="nk-navsearch__div" />
      <CityPicker variant="nav" value={city} onChange={setCity} />
      <button type="submit" className="nk-navsearch__go" aria-label={dict.search.submit}>
        <Icon name="ArrowRight" size={19} stroke={2.2} color="#fff" />
      </button>
    </form>
  );
}

/* Shared city dropdown — used by the hero SearchBar and the inline NavSearch.
   Owns its open state, outside-click + Escape close, and the listbox markup;
   `variant` switches the light (hero, opens up) / dark (nav, opens down) theme.
   Icon tints are passed inline because <Icon> always sets style.color, so a CSS
   class can't override it — layout/text colors live in the .nk-citypick rules. */
function CityPicker({ value, onChange, variant }: {
  value: string;
  onChange: (city: string) => void;
  variant: "hero" | "nav";
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);
  const options = useMemo<[string, string][]>(
    () => [["", dict.cityPicker.all], ...LT_CITIES.map((c) => [c, c] as [string, string])],
    [dict.cityPicker.all],
  );
  const hero = variant === "hero";
  return (
    <span ref={ref} className={"nk-citypick nk-citypick--" + variant}>
      <button type="button" className="nk-citypick__trigger" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <Icon name="MapPin" size={hero ? 20 : 16} stroke={2} color={hero ? "var(--nk-bg)" : "var(--nk-text-muted)"} />
        <span className={"nk-citypick__val" + (value ? " is-set" : "")}>{value || dict.search.where}</span>
        <Icon name="ChevronDown" size={hero ? 16 : 14} stroke={2.2} color={hero ? "var(--nk-light-meta)" : "var(--nk-text-muted)"}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </button>
      {open && (
        <span role="listbox" className="nk-citypick__panel">
          {hero && <span className="nk-citypick__heading">{dict.cityPicker.heading}</span>}
          {options.map(([val, label]) => {
            const active = value === val;
            return (
              <button key={label} type="button" role="option" aria-selected={active}
                onClick={() => { onChange(val); setOpen(false); }}
                className={"nk-citypick__opt" + (active ? " is-active" : "")}>
                <span className="nk-citypick__opt-l">
                  <Icon name="MapPin" size={hero ? 17 : 15} stroke={2} color={active ? (hero ? "var(--nk-purple-deep)" : "#fff") : "var(--nk-light-icon)"} /> {label}
                </span>
                {active && <Icon name="BadgeCheck" size={hero ? 18 : 16} stroke={2} color={hero ? "var(--nk-purple-deep)" : "#fff"} />}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}

function LocaleSwitcher() {
  const { locale } = useI18n();
  const pathname = usePathname();
  // Strip a leading locale prefix to get the bare path, then re-prefix for the
  // target locale (default locale is unprefixed). Keeps you on the same page.
  const bare = barePath(pathname);
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
        style={{ position: "absolute", right: -80, top: 0, bottom: 0, height: "100%", width: 1000, objectFit: "cover", objectPosition: "right top", opacity: 0.30, pointerEvents: "none" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "40px 90px" }}>
        <div className="nk-hero-panel" style={{ position: "relative", borderRadius: 20, background: "var(--nk-glass)", backdropFilter: "blur(40px)", border: "1px solid var(--nk-hairline)",
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
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(listingSearchHref({ q, city }));
  };
  return (
    <form id="nk-hero-search" className="nk-search" onSubmit={go} style={{
      display: "flex", alignItems: "center", gap: 8, background: "var(--nk-light-field)", border: "1px solid var(--nk-light-line)",
      borderRadius: 34, boxShadow: "var(--nk-shadow-input)", padding: "8px 8px 8px 24px", maxWidth: 662,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <Icon name="Search" size={20} color="var(--nk-bg)" stroke={2} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={dict.search.placeholder}
          aria-label={dict.search.inputLabel}
          style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 18, color: "var(--nk-bg)", width: 150 }} />
      </span>
      <span style={{ width: 1, height: 36, background: "var(--nk-light-line)" }} />
      <CityPicker variant="hero" value={city} onChange={setCity} />
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
  const list = (data ?? []).slice(0, 8);
  return (
    <section id="kategorijos" className="nk-container" style={{ paddingBlock: "clamp(72px, 10vw, 120px)" }}>
      <SectionHead eyebrow={t.eyebrow} title={t.title}
        action={<Button variant="outline" onClick={() => router.push("/kategorijos")}>{t.all}</Button>} />
      {isLoading ? (
        <div className="nk-grid-cats">
          {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="LayoutGrid"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          actionLabel={t.errorAction} onAction={() => refetch()} />
      ) : (
        <div className="nk-grid-cats nk-reveal">
          {list.map((c) => <CategoryCard key={c.id} title={c.title} href={listingSearchHref({ cat: c.id })} />)}
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
        <div className="nk-grid-4">
          {Array.from({ length: 4 }).map((_, i) => <OfferCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState icon="SearchX"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          actionLabel={t.errorAction} onAction={() => refetch()} />
      ) : (
        <div className="nk-grid-4 nk-reveal">
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

/* ---------------- Bottom SEO text block ---------------- */
export function HomeSeo() {
  const { dict } = useI18n();
  const t = dict.home;
  return (
    <section className="nk-container" style={{ paddingBlock: "0 80px" }}>
      <div className="nk-reveal" style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{t.seoHeading}</h2>
        <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{t.seoBody}</p>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
// A featured-quote carousel: one review at a time, navigable by dots, arrows,
// keyboard (←/→), and swipe. Autoplays unless hovered/focused or the user
// prefers reduced motion.
export function Testimonials() {
  const { dict } = useI18n();
  const t = dict.testimonials;
  const items = t.items;
  const count = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);

  const next = useCallback(() => setActive((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setActive((p) => (p - 1 + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(next, 6500);
    return () => window.clearInterval(id);
  }, [count, paused, next]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "ArrowRight") {
      next();
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (start === null || Math.abs(e.clientX - start) < 40) {
      return;
    }
    if (e.clientX < start) {
      next();
    } else {
      prev();
    }
  };

  return (
    <section className="nk-container" style={{ paddingBlock: "clamp(96px, 14vw, 200px)" }}>
      <SectionHead eyebrow={t.eyebrow} title={t.title} />
      <div role="region" aria-roledescription="carousel" aria-label={t.title} onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className="nk-tm-viewport nk-reveal"
          onPointerDown={(e) => { dragStart.current = e.clientX; }} onPointerUp={onPointerUp}>
          <div className="nk-tm-track" style={{ transform: `translateX(-${active * 100}%)` }}>
            {items.map((item, i) => (
              <div key={item.name} className="nk-tm-slide" role="group" aria-roledescription="slide"
                aria-label={`${i + 1} / ${count}`} aria-hidden={i !== active}>
                <Testimonial name={item.name} role={item.role} quote={item.quote} avatarTint={item.avatarTint} />
              </div>
            ))}
          </div>
        </div>
        {count > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 48 }}>
            <RoundArrow variant="outline" dir="left" onClick={prev} />
            <Dots n={count} active={active} onSelect={setActive} label={t.goToReview} />
            <RoundArrow variant="outline" dir="right" onClick={next} />
          </div>
        )}
      </div>
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
          <h2 className="nk-h-section" style={{ margin: 0 }}>{dict.faq.heading}</h2>
          <p className="nk-body" style={{ margin: 0, maxWidth: 866, color: "var(--nk-yellow)" }}>{dict.faq.subheading}</p>
        </div>
        <div className="nk-reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {dict.faq.items.map((f, i) => <FaqRow key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ----------------
   Multi-column marketplace sitemap: brand + Browse / Cities / Help columns, then
   a bottom bar with copyright, a "secure payments" badge and the payment marks. */
const FOOTER_SOCIAL: IconName[] = ["Facebook", "Instagram", "Linkedin"];
const FOOTER_PAY: [string, string][] = [
  ["pay-visa", "Visa"], ["pay-apple", "Apple Pay"], ["pay-google", "Google Pay"], ["pay-mastercard", "Mastercard"],
];

export function Footer() {
  const { dict } = useI18n();
  const t = dict.footer;
  return (
    <footer id="kontaktai" className="nk-footer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="nk-footer__pattern" src="/naudokis/footer-pattern.png" alt="" aria-hidden="true" />
      <div className="nk-container">
        <div className="nk-footer__top">
          <div className="nk-footer__brand">
            <Logo />
            <p className="nk-footer__tagline">{t.tagline}</p>
            <div className="nk-footer__contact">
              <a href={CONTACT_PHONE_TEL}><Icon name="Phone" size={17} stroke={2} color="var(--nk-text-muted)" /> {CONTACT_PHONE}</a>
              <a href={"mailto:" + CONTACT_EMAIL}><Icon name="Mail" size={17} stroke={2} color="var(--nk-text-muted)" /> {CONTACT_EMAIL}</a>
            </div>
            <div className="nk-footer__social">
              {FOOTER_SOCIAL.map((n) => (
                <a key={n} href="#" aria-label={n} aria-disabled="true" onClick={(e) => e.preventDefault()}>
                  <Icon name={n} size={20} color="var(--nk-text)" stroke={1.8} />
                </a>
              ))}
            </div>
            <AppBadges footer={true} height={46} />
          </div>

          <nav className="nk-footer__col" aria-label={t.browseHeading}>
            <h4>{t.browseHeading}</h4>
            <div className="nk-footer__catgrid">
              <Link href="/kategorijos">{t.allCategories}</Link>
              {t.categories.map((c) => (
                <Link key={c.q} href={listingSearchHref({ q: c.q })}>{c.label}</Link>
              ))}
            </div>
          </nav>

          <nav className="nk-footer__col" aria-label={t.helpHeading}>
            <h4>{t.helpHeading}</h4>
            {t.help.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </nav>
        </div>

        <div className="nk-footer__bottom">
          <span className="nk-footer__legal">{t.copyright}</span>
          <div className="nk-footer__pay">
            <span className="nk-footer__secure"><Icon name="ShieldCheck" size={17} color="var(--nk-green)" stroke={2} /> {t.secure}</span>
            {FOOTER_PAY.map(([f, a]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/naudokis/${f}.png`} alt={a} style={{ height: 30, width: "auto" }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
