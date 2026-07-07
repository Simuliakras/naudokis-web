"use client";
// Naudokis UI kit — interactive page sections (state/hooks/handlers). The
// presentational homepage sections live in sections-home.tsx so the home page
// can render them as server components.
import { useCategories } from "@/app/lib/categories";
import { categoryIconFor } from "@/app/lib/category-style";
import {
  barePath,
  localePath,
  localePrefix,
  locales,
  type Locale,
} from "@/app/lib/i18n/config";
import type { FaqItem } from "@/app/lib/i18n/types";
import { useListings, photoFirst } from "@/app/lib/listings";
import { prefersReducedMotion } from "@/app/lib/motion";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { listingLandingHref } from "@/app/lib/search";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CategoryCard,
  CategoryCardSkeleton,
  FaqRow,
  OfferCard,
  OfferCardSkeleton,
  SectionEmptyGrid,
} from "./cards";
import { useI18n } from "./I18nProvider";
import {
  closeListbox,
  focusListboxSelection,
  Icon,
  IconName,
  listboxKeyNav,
  listboxTriggerKeyNav,
  Logo,
  openRedirect,
} from "./ui";
import { Section, SectionHead } from "./headers";

/* ---------------- Nav ----------------
   Translucent sticky bar that condenses on scroll; on tablet/mobile (≤1120px)
   the links collapse into a hamburger drawer.
   `onSearch` is optional so the server-rendered home page can mount <Nav />
   without passing a function across the server→client boundary; the default
   scrolls to the homepage categories band. Client screens pass their own. */
export function Nav({ onSearch }: { onSearch?: () => void }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Active-route flag for aria-current — strip any locale prefix to the bare
  // path (the default locale is unprefixed) before matching.
  const isCategories = barePath(pathname) === "/kategorijos";
  const isHowItWorks = barePath(pathname) === "/kaip-tai-veikia";
  // Section-level match: highlights on both the feed and listing-detail pages.
  const bare = barePath(pathname);
  const isListings = bare.startsWith("/skelbimai") || bare.startsWith("/nuoma") || bare.startsWith("/miestai");
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

  // Escape-to-close, focus-restore to the burger, and auto-close once the viewport
  // grows past the tablet/mobile breakpoint (same 1120px query as the
  // .nk-nav-drawer rules in globals.css). lockScroll is off — the drawer
  // deliberately leaves the page scrollable behind it.
  useDismissableLayer(menuOpen, () => setMenuOpen(false), {
    lockScroll: false,
    closeAt: "(min-width: 1121px)",
  });

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

  // While the drawer is open: move focus to its first item and close on a click
  // outside it. (Escape, focus-restore to the burger, and the breakpoint close
  // are owned by useDismissableLayer above.)
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    // Click outside the drawer (and not on the burger toggle) closes it — this
    // also catches clicks on the dimming scrim, which sits behind the drawer.
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (drawerRef.current?.contains(target) || burgerRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => {
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
    // On the home page there's no page-search input to focus, so take the user to
    // the hero (id="top"), where the search field lives — matching the "Search"
    // label — rather than jumping to the categories band below it.
    document
      .getElementById("top")
      ?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
  };

  return (
    <>
      {/* Dims the page behind the open mobile drawer. Tapping it closes the
          drawer (onClick); the same document mousedown handler also catches it.
          Kept OUTSIDE the backdrop-filtered .nk-nav-bar so position:fixed resolves
          against the viewport (a filtered ancestor would trap it to the header). */}
      <div
        className={"nk-nav-scrim" + (menuOpen ? " open" : "")}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <header className={"nk-nav-bar" + (scrolled ? " nk-scrolled" : "")}>
        <div className="nk-nav-inner nk-container">
          <Logo priority />
          <nav className="nk-nav-links" aria-label={dict.nav.primary}>
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
            <LocaleSwitcher />
          </nav>
          {/* Install CTA lives OUTSIDE the collapsible link group so the site's
              single conversion action survives the ≤1120px collapse — full label
              on desktop, compact label beside the burger on phones/tablets. */}
          <button
            className="nk-btn nk-btn--primary nk-nav-cta"
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
            <span className="nk-nav-cta__full">{dict.nav.getApp}</span>
            <span className="nk-nav-cta__short">{dict.nav.getAppShort}</span>
          </button>
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
          // Closed, the drawer is only visually collapsed (max-height/opacity) so
          // the exit animation can play — inert removes its six interactive
          // descendants from the Tab order and the accessibility tree.
          inert={!menuOpen}
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
              {/* In-flow expansion: a floating panel here clipped at the viewport
                  edge and covered the install CTA below (F-110). */}
              <LocaleSwitcher inflow />
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
    </>
  );
}

// Language picker — globe + "Kalba"/"Language" + chevron trigger opening a listbox
// of endonym options (a globe, not flags: flags denote countries, not languages).
// Options are Next <Link>s to the per-locale path (default locale unprefixed) so it
// keeps you on-page. `inflow` renders the options as an in-flow expansion instead of
// a floating panel — used inside the mobile drawer, where an absolutely-positioned
// panel clipped at the viewport edge and occluded the install CTA.
function LocaleSwitcher({ inflow = false }: { inflow?: boolean }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
    // Escape restores focus to the trigger (focus lives inside the open panel).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeListbox(setOpen, triggerRef, ref);
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
      style={
        inflow
          ? { display: "flex", flexDirection: "column", alignItems: "stretch" }
          : { position: "relative", display: "inline-flex", marginInline: -10 }
      }
      onBlur={(e) => {
        if (
          open &&
          e.relatedTarget instanceof Node &&
          ref.current &&
          !ref.current.contains(e.relatedTarget)
        ) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="nk-locale-trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${dict.nav.language}: ${dict.nav.languageNames[locale]}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        <Icon name="Globe" size={17} stroke={2} color="var(--nk-text-muted)" />
        <span className="nk-nav">{dict.nav.language}</span>
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
            ...(inflow
              ? { marginTop: 6 }
              : {
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 160,
                  maxWidth: "calc(100vw - 2*var(--nk-gutter))",
                  boxShadow: "0 16px 40px rgba(0,0,0,.4)",
                  zIndex: 60,
                }),
            background: "var(--nk-surface)",
            border: "1px solid var(--nk-border)",
            borderRadius: 12,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 2,
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
                onClick={() => closeListbox(setOpen, triggerRef, ref)}
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
                {dict.nav.languageNames[l]}
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
  const list = (data ?? []).slice(0, 10);
  return (
    <Section id="kategorijos" contained bottom="head">
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
          {Array.from({ length: 10 }).map((_, i) => (
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
              href={listingLandingHref({ category: c.id, locale })}
            />
          ))}
        </div>
      ) : (
        // Lead with a productive action (open the app) instead of a "Refresh"
        // that returns the same empty catalog; refresh stays as the secondary.
        <SectionEmptyGrid
          variant="categories"
          icon="LayoutGrid"
          title={t.bandEmptyTitle}
          subtitle={t.bandEmptyBody}
          primaryLabel={t.bandEmptyAppCta}
          onPrimary={() =>
            openRedirect({
              title: dict.bridge.defaultTitle,
              body: dict.bridge.defaultBody,
            })
          }
          secondaryLabel={t.bandEmptyRetry}
          onSecondary={() => refetch()}
        />
      )}
    </Section>
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
  // Photo safeguard: surface photo-bearing listings in the flagship "Popular
  // items" band so it isn't 4 category-icon placeholders.
  const list = photoFirst(data ?? []).slice(0, 4);
  return (
    <Section id="skelbimai" contained top="head">
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
              subdivision={o.subdivision}
              price={o.price}
              img={o.img}
              unit={dict.common.perDay}
              rating={o.rating}
              ratingCount={o.ratingCount}
              hasDelivery={o.hasDelivery}
              category={o.category}
              categoryIcon={categoryIconFor(cats, o.category)}
              href={localePath(locale, `/skelbimai/${o.id}`)}
            />
          ))}
          {/* Launch-size inventory: a ghost browse-all tile fills the trailing
              cell so a 3-item row never reads as a failed load — and converts. */}
          {list.length < 4 && (
            <Link
              href={localePath(locale, "/skelbimai")}
              className="nk-ghost-tile nk-reveal"
            >
              {t.all}{" "}
              <Icon
                name="ArrowRight"
                size={20}
                stroke={2.2}
                color="currentColor"
              />
            </Link>
          )}
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
    </Section>
  );
}

/* ---------------- How it works (numbered stepper) ----------------
   Three role-neutral steps on a purple→yellow→green connector line. Icons and
   the step number are positional design constants; the dictionary carries the
   copy only. */

// Per-step accent, positional: each index maps to the matching stop on the
// connector-line gradient (purple → yellow → green).
const STEP_ACCENTS = ["var(--nk-purple-hover)", "var(--nk-yellow)", "var(--nk-green)"] as const;

// Per-step icons, positional (find → secure → use).
const STEP_ICONS: [IconName, IconName, IconName] = ["Search", "ShieldCheck", "Package"];

export function HowItWorks() {
  const { locale, dict } = useI18n();
  const t = dict.homeSteps;
  const steps = t.steps;

  return (
    // extra bottom breathing room below the stepper before the FAQ band
    <Section
      contained
      top="section"
      style={{ paddingBottom: "calc(var(--nk-section-y) + clamp(32px,4vw,64px))" }}
    >
      <SectionHead
        eyebrow={t.eyebrow}
        title={t.title}
        subtitle={t.lead}
        action={
          <Link className="nk-cats-all" href={localePath(locale, "/kaip-tai-veikia")}>
            {t.ctaLabel}{" "}
            <Icon name="ArrowRight" size={24} stroke={2.4} color="currentColor" />
          </Link>
        }
      />

      <div className="nk-hiw-track nk-reveal">
        <span className="nk-hiw-line" aria-hidden="true" />
        <div className="nk-hiw-grid">
          {steps.map((step, i) => (
            <div key={step.title} className="nk-hiw-step">
              <span className="nk-hiw-node">
                <Icon
                  name={STEP_ICONS[i]}
                  size={32}
                  stroke={2}
                  color={STEP_ACCENTS[i]}
                />
              </span>
              <span className="nk-hiw-idx">
                <b style={{ color: STEP_ACCENTS[i] }}>{`0${i + 1}`}</b>
                {step.kicker}
              </span>
              <h3 className="nk-hiw-h">{step.title}</h3>
              <p className="nk-hiw-p">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- FAQ ----------------
   Shared FAQ section, used by both the home page (general questions) and the
   How-It-Works page (role-aware renter/owner sets). Prop-driven so callers own
   the content; owns its single-open accordion state. The subheading is optional
   — omit it for a tighter head. Reset the open row across content swaps by
   remounting with a `key` (How-It-Works passes `key={role}`). */
export function Faq({
  eyebrow,
  heading,
  subheading,
  items,
}: {
  eyebrow: string;
  heading: string;
  subheading?: string;
  items: readonly FaqItem[];
}) {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--nk-bg)" }}>
      <Section as="div" contained top="section-lg" bottom="section-lg" style={{ maxWidth: 1320 }}>
        {/* same eyebrow+H2 anatomy as every other home section, left-aligned to
            match them; the optional subheading rides in the head's subtitle slot */}
        <SectionHead eyebrow={eyebrow} title={heading} subtitle={subheading} />
        <div
          className="nk-reveal"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--nk-gap-lg)",
          }}
        >
          {items.map((f, i) => (
            <FaqRow
              key={i}
              q={f.q}
              a={f.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </Section>
    </section>
  );
}
