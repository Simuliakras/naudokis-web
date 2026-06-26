"use client";
// Naudokis UI kit — interactive page sections (state/hooks/handlers). The
// presentational homepage sections live in sections-home.tsx so the home page
// can render them as server components.
import { useCategories } from "@/app/lib/categories";
import { categoryIconFor } from "@/app/lib/category-style";
import { LT_CITIES } from "@/app/lib/cities";
import {
  barePath,
  localePath,
  localePrefix,
  locales,
  type Locale,
} from "@/app/lib/i18n/config";
import { useListings } from "@/app/lib/listings";
import { prefersReducedMotion } from "@/app/lib/motion";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { listingSearchHref } from "@/app/lib/search";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoryCard,
  CategoryCardSkeleton,
  FaqRow,
  OfferCard,
  OfferCardSkeleton,
  SectionEmptyGrid,
  UseCaseCard,
} from "./cards";
import { useI18n } from "./I18nProvider";
import {
  Dots,
  focusListboxSelection,
  Icon,
  listboxKeyNav,
  listboxTriggerKeyNav,
  Logo,
  openRedirect,
  SectionHead,
} from "./ui";

/* ---------------- Nav ----------------
   Translucent sticky bar that condenses on scroll. The inline search bar is
   always visible in the nav links; on tablet/mobile (≤1120px) the links
   collapse into a hamburger drawer.
   `onSearch` is optional so the server-rendered home page can mount <Nav />
   without passing a function across the server→client boundary; the default
   scrolls to the homepage categories band. Client screens pass their own. */
export function Nav({ onSearch }: { onSearch?: () => void }) {
  const { locale, dict } = useI18n();
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
  // Section-level match: highlights on both the feed and listing-detail pages.
  const isListings = barePath(pathname).startsWith("/skelbimai");
  // Only the home page has a hero search bar; on every other page the inline nav
  // search is shown by default (the design has no ghost "Paieška" button).
  const isHome = barePath(pathname) === "/";
  // Condense the bar once the page scrolls — wired here (not per-page) so it
  // works on every screen that renders the Nav.
  useEffect(() => {
    (window as Window & { __nkNavReady?: boolean }).__nkNavReady = true;
    return () => {
      (window as Window & { __nkNavReady?: boolean }).__nkNavReady = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Expand the inline nav search once the hero search bar leaves the viewport.
  // On pages without a hero search (#nk-hero-search) the observer never fires,
  // so the inline search stays hidden until you scroll past the hero.
  useEffect(() => {
    const hero = document.getElementById("nk-hero-search");
    if (!hero || !("IntersectionObserver" in window)) {
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => setSearchExpanded(!e.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Close the drawer when the viewport grows past the tablet/mobile breakpoint
  // (same 1120px query as the .nk-nav-drawer rules in globals.css).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1120px)");
    const onChange = () => {
      if (!mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
    // Click outside the drawer (and not on the burger toggle) closes it — same
    // pattern as the FilterSelect popovers, no scrim element needed.
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (drawerRef.current?.contains(target) || burgerRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [menuOpen]);

  // Trap Tab within the open drawer so focus can't slip behind it (Escape + the
  // scrim are the exits) — same hook the modal + lightbox use.
  useFocusTrap(drawerRef, menuOpen);

  const doSearch = () => {
    setMenuOpen(false);
    if (onSearch) {
      onSearch();
      return;
    }
    document
      .getElementById("kategorijos")
      ?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
  };

  return (
    <header className={"nk-nav-bar" + (scrolled ? " nk-scrolled" : "")}>
      <div className="nk-nav-inner nk-container">
        <Logo priority />
        <nav className="nk-nav-links" aria-label={dict.nav.primary}>
          {(searchExpanded || !isHome) && <NavSearch key="navsearch" />}
          <Link
            className="nk-nav nk-link"
            href={localePath(locale, "/kategorijos")}
            aria-current={isCategories ? "page" : undefined}
          >
            {dict.nav.category}
          </Link>
          <Link
            className="nk-nav nk-link"
            href={localePath(locale, "/skelbimai")}
            aria-current={isListings ? "page" : undefined}
          >
            {dict.nav.listings}
          </Link>
          <Link
            className="nk-nav nk-link"
            href={localePath(locale, "/kaip-tai-veikia")}
            aria-current={isHowItWorks ? "page" : undefined}
          >
            {dict.nav.howItWorks}
          </Link>
          <button
            className="nk-btn nk-btn--primary"
            style={{ padding: "10px 20px", fontSize: 15 }}
            onClick={() =>
              openRedirect({
                title: dict.bridge.defaultTitle,
                body: dict.bridge.defaultBody,
              })
            }
          >
            <Icon
              name="Download"
              size={17}
              stroke={2.2}
              color="var(--nk-text)"
            />{" "}
            {dict.nav.getApp}
          </button>
        </nav>
        <button
          ref={burgerRef}
          className="nk-nav-burger"
          aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls="nk-mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon
            name={menuOpen ? "X" : "Menu"}
            size={22}
            stroke={2.2}
            color="var(--nk-text)"
          />
        </button>
      </div>
      <div
        ref={drawerRef}
        id="nk-mobile-nav"
        className={"nk-nav-drawer" + (menuOpen ? " open" : "")}
      >
        <div className="nk-nav-drawer-inner">
          <button className="nk-drawer-item" onClick={doSearch}>
            <Icon name="Search" size={20} stroke={2.2} color="var(--nk-text)" />{" "}
            {dict.nav.search}
          </button>
          <Link
            className="nk-drawer-item"
            href={localePath(locale, "/kategorijos")}
            aria-current={isCategories ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <Icon
              name="LayoutGrid"
              size={20}
              stroke={2}
              color="var(--nk-text)"
            />{" "}
            {dict.nav.category}
          </Link>
          <Link
            className="nk-drawer-item"
            href={localePath(locale, "/skelbimai")}
            aria-current={isListings ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="Tag" size={20} stroke={2} color="var(--nk-text)" />{" "}
            {dict.nav.listings}
          </Link>
          <Link
            className="nk-drawer-item"
            href={localePath(locale, "/kaip-tai-veikia")}
            aria-current={isHowItWorks ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="Sparkles" size={20} stroke={2} color="var(--nk-text)" />{" "}
            {dict.nav.howItWorks}
          </Link>
          <div className="nk-drawer-locale">
            <LocaleSwitcher />
          </div>
          <button
            className="nk-btn nk-btn--primary"
            style={{ margin: "4px 12px 0", justifyContent: "center" }}
            onClick={() => {
              setMenuOpen(false);
              openRedirect({
                title: dict.bridge.defaultTitle,
                body: dict.bridge.defaultBody,
              });
            }}
          >
            <Icon
              name="Download"
              size={18}
              stroke={2.2}
              color="var(--nk-text)"
            />{" "}
            {dict.nav.getApp}
          </button>
        </div>
      </div>
    </header>
  );
}

/* Inline nav search — compact search field in the nav; routes to the feed. */
function NavSearch() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(listingSearchHref({ q, city, locale }));
  };
  return (
    <form className="nk-navsearch nk-fadein" onSubmit={go} role="search">
      <Icon name="Search" size={17} stroke={2.2} color="var(--nk-text-muted)" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={dict.search.placeholder}
        aria-label={dict.search.inputLabel}
      />
      <span className="nk-navsearch__div" />
      <CityPicker value={city} onChange={setCity} />
      <button
        type="submit"
        className="nk-navsearch__go"
        aria-label={dict.search.submit}
      >
        <Icon name="ArrowRight" size={19} stroke={2.2} color="#fff" />
      </button>
    </form>
  );
}

/* City dropdown — the dark nav variant used by the inline NavSearch (the light
   hero variant lives as HeroCityPicker in HeroSearch.tsx). Owns its open state,
   outside-click + Escape close, and the listbox markup. Icon tints are passed
   inline because <Icon> always sets style.color, so a CSS class can't override
   it — layout/text colors live in the .nk-citypick rules. */
function CityPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  // Move focus into the open list (onto the active city) for keyboard users.
  useEffect(() => {
    if (open) {
      focusListboxSelection(listRef.current);
    }
  }, [open]);
  const options = useMemo<[string, string][]>(
    () => [
      ["", dict.cityPicker.all],
      ...LT_CITIES.map((c) => [c, c] as [string, string]),
    ],
    [dict.cityPicker.all],
  );
  return (
    <span ref={ref} className="nk-citypick nk-citypick--nav">
      <button
        type="button"
        className="nk-citypick__trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="MapPin" size={16} stroke={2} color="var(--nk-text-muted)" />
        <span className={"nk-citypick__val" + (value ? " is-set" : "")}>
          {value || dict.search.where}
        </span>
        <Icon
          name="ChevronDown"
          size={14}
          stroke={2.2}
          color="var(--nk-text-muted)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s ease",
          }}
        />
      </button>
      {open && (
        <span
          ref={listRef}
          role="listbox"
          aria-label={dict.cityPicker.heading}
          onKeyDown={listboxKeyNav}
          className="nk-citypick__panel"
        >
          {options.map(([val, label]) => {
            const active = value === val;
            return (
              <button
                key={label}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(val);
                  setOpen(false);
                }}
                className={"nk-citypick__opt" + (active ? " is-active" : "")}
              >
                <span className="nk-citypick__opt-l">
                  <Icon
                    name="MapPin"
                    size={15}
                    stroke={2}
                    color={active ? "#fff" : "var(--nk-light-icon)"}
                  />{" "}
                  {label}
                </span>
                {active && (
                  <Icon name="BadgeCheck" size={16} stroke={2} color="#fff" />
                )}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}

/* Mini flag glyphs (LT tricolor / EN union jack) used by the language picker. */
function Flag({ code }: { code: Locale }) {
  if (code === "lt") {
    return (
      <span
        style={{
          width: 20,
          height: 14,
          borderRadius: 2,
          overflow: "hidden",
          display: "inline-flex",
          flexDirection: "column",
          flex: "none",
        }}
      >
        <i style={{ flex: 1, background: "#FDB913" }} />
        <i style={{ flex: 1, background: "#006A44" }} />
        <i style={{ flex: 1, background: "#C1272D" }} />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 20,
        height: 14,
        borderRadius: 2,
        overflow: "hidden",
        display: "inline-flex",
        position: "relative",
        flex: "none",
        background: "#012169",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          width: "140%",
          height: 2,
          background: "#fff",
          transform: "rotate(34deg)",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: "140%",
          height: 2,
          background: "#fff",
          transform: "rotate(-34deg)",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: "100%",
          height: 4,
          background: "#C8102E",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: 4,
          height: "100%",
          background: "#C8102E",
        }}
      />
    </span>
  );
}

// Language picker — flag + "Kalba"/"Language" + chevron trigger opening a listbox
// of endonym options. Matches the design's LangPicker; options are Next <Link>s
// to the per-locale path (default locale unprefixed) so it keeps you on-page.
function LocaleSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  // Move focus into the open menu (onto the current locale) for keyboard users.
  useEffect(() => {
    if (open) {
      focusListboxSelection(listRef.current);
    }
  }, [open]);
  // Strip a leading locale prefix to get the bare path, then re-prefix for the
  // target locale (default locale is unprefixed). Keeps you on the same page.
  const bare = barePath(pathname);
  const href = (l: Locale) =>
    localePrefix(l) + (bare === "/" ? "" : bare) || "/";
  return (
    <span
      ref={ref}
      style={{
        position: "relative",
        display: "inline-flex",
        marginInline: -10,
      }}
    >
      <button
        type="button"
        className="nk-locale-trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dict.nav.language}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 10,
          cursor: "pointer",
          background: "transparent",
        }}
      >
        <Flag code={locale} />
        <Icon
          name="ChevronDown"
          size={15}
          stroke={2.2}
          color="var(--nk-text-muted)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s ease",
          }}
        />
      </button>
      {open && (
        <span
          ref={listRef}
          role="listbox"
          aria-label={dict.nav.language}
          onKeyDown={listboxKeyNav}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 160,
            maxWidth: "calc(100vw - 2*var(--nk-gutter))",
            background: "var(--nk-surface)",
            border: "1px solid var(--nk-border)",
            borderRadius: 12,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            boxShadow: "0 16px 40px rgba(0,0,0,.4)",
            zIndex: 60,
          }}
        >
          {locales.map((l) => {
            const active = l === locale;
            return (
              <Link
                key={l}
                href={href(l)}
                role="option"
                aria-selected={active}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  textAlign: "left",
                  background: active ? "var(--nk-purple-deep)" : "transparent",
                  color: active ? "#fff" : "var(--nk-text)",
                  fontFamily: "var(--nk-font-display)",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                <Flag code={l} /> {dict.nav.languageNames[l]}
                {active && (
                  <Icon
                    name="BadgeCheck"
                    size={16}
                    color="#fff"
                    stroke={2}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </Link>
            );
          })}
        </span>
      )}
    </span>
  );
}

/* ---------------- Categories ---------------- */
export function Categories() {
  const { locale, dict } = useI18n();
  const t = dict.categories;
  const { data, isLoading, isError, refetch } = useCategories(locale);
  const list = (data ?? []).slice(0, 8);
  return (
    <section
      id="kategorijos"
      className="nk-container"
      style={{ paddingBlock: "var(--nk-section-y) var(--nk-section-head)" }}
    >
      <SectionHead
        eyebrow={t.eyebrow}
        title={t.title}
        action={
          <Link className="nk-cats-all" href={localePath(locale, "/kategorijos")}>
            {t.all}{" "}
            <Icon
              name="ArrowRight"
              size={24}
              stroke={2.4}
              color="currentColor"
            />
          </Link>
        }
      />
      {isLoading ? (
        <div className="nk-grid-cats">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <SectionEmptyGrid
          variant="categories"
          tone="danger"
          icon="LayoutGrid"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          primaryLabel={t.errorAction}
          onPrimary={() => refetch()}
        />
      ) : list.length ? (
        <div className="nk-grid-cats nk-reveal-grid">
          {list.map((c) => (
            <CategoryCard
              key={c.id}
              id={c.id}
              icon={c.icon}
              title={c.title}
              href={listingSearchHref({ cat: c.id, locale })}
            />
          ))}
        </div>
      ) : (
        <SectionEmptyGrid
          variant="categories"
          icon="LayoutGrid"
          title={t.bandEmptyTitle}
          subtitle={t.bandEmptyBody}
          primaryLabel={t.bandEmptyAction}
          onPrimary={() => refetch()}
          secondaryLabel={t.bandEmptySecondary}
          onSecondary={() =>
            openRedirect({
              title: dict.bridge.defaultTitle,
              body: dict.bridge.defaultBody,
            })
          }
        />
      )}
    </section>
  );
}

/* ---------------- Offers ---------------- */
export function Offers() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const t = dict.offers;
  const { data, isLoading, isError, refetch } = useListings(locale);
  // Already prefetched/cached for the Categories band — only read for the
  // empty-photo placeholder glyphs.
  const cats = useCategories(locale).data ?? [];
  const list = (data ?? []).slice(0, 4);
  return (
    <section
      id="skelbimai"
      className="nk-container"
      style={{ paddingBlock: "var(--nk-section-head) var(--nk-section-y)" }}
    >
      <SectionHead
        eyebrow={t.eyebrow}
        title={t.title}
        action={
          <Link className="nk-cats-all" href={localePath(locale, "/skelbimai")}>
            {t.all}{" "}
            <Icon
              name="ArrowRight"
              size={24}
              stroke={2.4}
              color="currentColor"
            />
          </Link>
        }
      />
      {isLoading ? (
        <div className="nk-grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <SectionEmptyGrid
          variant="offers"
          tone="danger"
          icon="SearchX"
          title={t.errorTitle}
          subtitle={t.errorSubtitle}
          primaryLabel={t.errorAction}
          onPrimary={() => refetch()}
        />
      ) : list.length ? (
        <div className="nk-grid-4 nk-reveal-grid">
          {list.map((o) => (
            <OfferCard
              key={o.id}
              title={o.title}
              city={o.city}
              price={o.price}
              img={o.img}
              unit={dict.common.perDay}
              rating={o.rating}
              count={
                o.ratingCount > 0
                  ? dict.common.reviewCount(o.ratingCount)
                  : undefined
              }
              category={o.category}
              categoryIcon={categoryIconFor(cats, o.category)}
              href={localePath(locale, `/skelbimai/${o.id}`)}
            />
          ))}
        </div>
      ) : (
        <SectionEmptyGrid
          variant="offers"
          icon="Tag"
          title={t.bandEmptyTitle}
          subtitle={t.bandEmptyBody}
          primaryLabel={t.bandEmptyAction}
          onPrimary={() => router.push(localePath(locale, "/kategorijos"))}
          secondaryLabel={t.bandEmptySecondary}
          onSecondary={() =>
            openRedirect({
              title: dict.bridge.defaultTitle,
              body: dict.bridge.defaultBody,
            })
          }
        />
      )}
    </section>
  );
}

/* ---------------- Use cases ----------------
   Desktop shows all use-case cards 3-up; ≤1024px becomes a scroll-snap slider
   with navigation dots. The active dot tracks the real scroll position via an
   IntersectionObserver (same idiom as ScrollReveal). */
export function UseCases() {
  const { dict } = useI18n();
  const t = dict.useCases;
  const items = t.items;
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const slides = Array.from(
      track.querySelectorAll<HTMLElement>("[data-idx]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) {
              setActive(idx);
            }
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [items.length]);

  const goTo = (i: number) => {
    const slide = trackRef.current?.querySelector<HTMLElement>(
      `[data-idx="${i}"]`,
    );
    slide?.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section
      className="nk-container"
      style={{ paddingBlock: "var(--nk-section-y)" }}
    >
      <SectionHead eyebrow={t.eyebrow} title={t.title} />
      <div ref={trackRef} className="nk-reveal nk-carousel">
        {items.map((item, i) => (
          <div key={item.title} data-idx={i}>
            <UseCaseCard
              icon={item.icon}
              title={item.title}
              body={item.body}
              tone={item.tone}
            />
          </div>
        ))}
      </div>
      <div className="nk-carousel-dots">
        <Dots
          n={items.length}
          active={active}
          onSelect={goTo}
          label={t.goToSlide}
        />
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  const { dict } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--nk-bg)" }}>
      <div
        className="nk-container"
        style={{ paddingBlock: "var(--nk-section-y-lg)", maxWidth: 1320 }}
      >
        <div
          className="nk-reveal"
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "var(--nk-gap-md)",
            alignItems: "center",
            marginBottom: "var(--nk-section-head)",
          }}
        >
          <h2 className="nk-h-section" style={{ margin: 0 }}>
            {dict.faq.heading}
          </h2>
          <p
            className="nk-body"
            style={{ margin: 0, maxWidth: 866, color: "var(--nk-yellow)" }}
          >
            {dict.faq.subheading}
          </p>
        </div>
        <div
          className="nk-reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--nk-gap-lg)",
          }}
        >
          {dict.faq.items.map((f, i) => (
            <FaqRow
              key={i}
              q={f.q}
              a={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
