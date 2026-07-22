// Naudokis UI kit — presentational homepage sections (no "use client": rendered
// as server components by the home page, so their JSX stays out of the client
// bundle; the same file compiles as client code where client screens import
// Footer). Translations come from a `locale` prop + getDictionary — the Dict
// holds function members, so it must never cross the server→client boundary.
import Image from "next/image";
import Link from "next/link";
import {
  Icon, LogoMark, QR, Pattern,
} from "./visual";
import {
  AppBadges,
} from "./ui";
import { SearchBar, HeroOwnerCta } from "./HeroSearch";
import { AppCtaBanner } from "./AppCtaBanner";
import { FeatureBand } from "./FeatureBand";
import { FooterDisclosure } from "./FooterDisclosure";
import { PrivacyChoices } from "./PrivacyChoices";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SOCIAL_PROFILES, LEGAL_NAME, COPYRIGHT_YEAR } from "@/app/lib/contact";
import { LT_CITIES } from "@/app/lib/cities";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import { listingLandingHref } from "@/app/lib/search";
import { IMAGE_SIZES, LEGACY_VIEWPORT_QUERIES } from "@/app/lib/breakpoints";

/* ---------------- Hero ---------------- */
export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section id="top" style={{ position: "relative", background: "radial-gradient(circle at 85% 20%, var(--nk-purple-halo), transparent 42%), var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="hero-pattern" priority mobileBlank className="nk-hero-pattern nk-brand-pattern"
        style={{ position: "absolute", top: 0, bottom: 0, height: "100%", objectFit: "cover", objectPosition: "right top", pointerEvents: "none" }} />
      <div className="nk-container nk-home-hero-container" style={{ position: "relative", paddingBlock: "clamp(20px, 3vw, 40px) var(--nk-section-y-lg)" }}>
        {/* grid columns / padding / min-height live on .nk-hero-panel in globals.css
            so the 980px stack doesn't need !important overrides */}
        <div className="nk-hero-panel nk-grain nk-gborder" style={{ position: "relative", borderRadius: "var(--nk-r-lg)", background: "var(--nk-glass)", backdropFilter: "blur(35px)" }}>
          <AmbientGlow />
          {/* left column */}
          <div className="nk-hero-intro" style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "var(--nk-stack-lg)", justifyContent: "center", maxWidth: "min(100%, 680px)" }}>
            {/* badge + h1 share a tighter sub-stack than the column rhythm, so the
                badge reads as the headline's kicker rather than a separate block */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--nk-gap-lg)" }}>
              <span className="nk-hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--nk-green)", borderRadius: "var(--nk-r-pill)", padding: "6px 18px 6px 6px", boxShadow: "var(--nk-edge-top)" }}>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: "var(--nk-bg)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name="Users" size={18} color="var(--nk-text)" stroke={1.8} />
                </span>
                <b className="nk-hero-badge__label" style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, color: "var(--nk-bg)" }}>{dict.hero.badge}</b>
              </span>
              <h1 className="nk-h-hero" style={{ margin: 0 }}>{dict.hero.title}</h1>
            </div>
            <p className="nk-body" style={{ margin: 0, maxWidth: "min(100%, 662px)" }}>{dict.hero.body}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginTop: "var(--nk-gap-sm)" }}>
              <SearchBar />
              <HeroOwnerCta />
            </div>
            <AppBadges />
          </div>
          {/* right column — real app device + QR */}
          <div className="nk-hero-media" style={{ position: "relative", zIndex: 1 }}>
            {/* The phone is the desktop LCP candidate, so it loads eagerly at high
                fetch priority. It is deliberately NOT `preload`ed: preload emits a
                <link rel=preload imagesrcset> that ignores <picture>/<source media>
                selection, so phones would download the desktop PNG they never show.
                `fetchPriority` alone would not do — next/image treats an Image with
                neither `preload` nor `loading` as lazy, which is the opposite of
                what an LCP element wants. */}
            <picture className="nk-hero-device">
              {/* Browsers fetch an <img> even inside a display:none ancestor, and the
                  whole media column is display:none below 560px. Selecting a 1×1 GIF
                  there means the desktop URL is never requested on phones — the only
                  candidate the browser resolves is this one. LEGACY_ syntax on
                  purpose: <source media> is not downleveled, and an engine that
                  cannot parse `(width < …)` reads it as non-matching, which would
                  hand phones the full-size PNG this line exists to withhold. */}
              <source media={LEGACY_VIEWPORT_QUERIES.compact} srcSet="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
              <Image className="nk-hero-phone" src="/naudokis/hero-phone.png" alt={dict.hero.phoneAlt}
                width={1436} height={1868} loading="eager" fetchPriority="high"
                sizes={IMAGE_SIZES.heroPhone} />
            </picture>
            <div className="nk-hero-qr" style={{ position: "absolute", right: "clamp(16px, 2vw, 32px)", bottom: 0 }}><QR size={132} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features band ----------------
   Shared trust-features band (see FeatureBand); the home page keeps its own
   dict.features copy. */
export function Features({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  // Full-bleed band; add outer rhythm so it floats clear of the neighbouring
  // Offers / HowItWorks sections instead of butting straight against them.
  return (
    <div style={{ marginBlock: "var(--nk-section-y)" }}>
      <FeatureBand eyebrow={dict.featuresHead.eyebrow} title={dict.featuresHead.title} items={dict.features} />
    </div>
  );
}

/* ---------------- CTA banner ----------------
   App-download banner shared with the "Kaip tai veikia" page (see AppCtaBanner);
   the home page keeps its own dict.cta copy. */
export function CtaBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return <AppCtaBanner eyebrow={dict.cta.eyebrow} title={dict.cta.title} body={dict.cta.body} phoneAlt={dict.cta.phoneAlt} placement="home_cta" />;
}

/* Ambient glow layer for the hero panel — purple + yellow radial glows and a
   diagonal sheen, concentrated behind the device on the right so the phone pops.
   The wrapper is clipped to the panel's rounded rect; the phone is independently
   constrained by the media track so neither layer relies on decorative overflow. */
function AmbientGlow() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      <div style={{ position: "absolute", top: "50%", right: "-10%", width: 720, height: 720, borderRadius: "50%", transform: "translateY(-50%)", background: "radial-gradient(circle, var(--nk-glow-purple) 0%, transparent 66%)" }} />
      <div style={{ position: "absolute", top: "-14%", right: "8%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-purple-hover) 26%, transparent) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-8%", right: "14%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-yellow) 14%, transparent) 0%, transparent 64%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, color-mix(in srgb, var(--nk-purple) 10%, transparent) 0%, transparent 52%)" }} />
    </div>
  );
}

/* ---------------- Footer ----------------
   Multi-column marketplace sitemap: brand + Browse / Help columns, then a bottom
   bar with copyright and the payment marks. */
const FOOTER_PAY: [string, string][] = [
  ["pay-visa", "Visa"], ["pay-apple", "Apple Pay"], ["pay-google", "Google Pay"], ["pay-mastercard", "Mastercard"],
];

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;
  return (
    <footer id="kontaktai" className="nk-footer">
      <div className="nk-container">
        {/* Kept inside the query container so the artwork follows the footer's
            usable width instead of the page viewport. Pattern itself is decorative. */}
        <Pattern name="footer-pattern" className="nk-footer__pattern" />
        <div className="nk-footer__top">
          <div className="nk-footer__brand">
            <LogoMark locale={locale} />
            <p className="nk-footer__tagline">{t.tagline}</p>
            <div className="nk-footer__contact">
              <a href={CONTACT_PHONE_TEL}><Icon name="Phone" size={17} stroke={2} color="currentColor" /> {CONTACT_PHONE}</a>
              <a href={"mailto:" + CONTACT_EMAIL}><Icon name="Mail" size={17} stroke={2} color="currentColor" /> {CONTACT_EMAIL}</a>
            </div>
            {/* <nav>: aria-label does nothing on a bare div (role=generic), and
                these ARE navigation links — matches the sibling footer columns. */}
            <nav className="nk-footer__social" aria-label={t.socialLabel}>
              {SOCIAL_PROFILES.map((profile) => (
                <a key={profile.id} href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={profile.label}>
                  <Icon name={profile.icon} size={20} color="currentColor" />
                </a>
              ))}
            </nav>
            <AppBadges footer={true} height={40} gap={12} />
          </div>

          {/* h2 (visually sized by the .nk-footer__col heading rule): hardcoded h4s
              produced h1→h4 outline jumps on pages with no h2/h3 (404, /invite). */}
          <FooterDisclosure heading={t.browseHeading} className="nk-footer__col--categories">
            <FooterCategories locale={locale} />
          </FooterDisclosure>

          {/* city landings — internal-link equity + the H1's own "nearby" promise */}
          <FooterDisclosure heading={t.citiesHeading} className="nk-footer__col--cities">
            <FooterCities locale={locale} />
          </FooterDisclosure>

          <FooterDisclosure heading={t.helpHeading} className="nk-footer__col--help">
            <FooterHelpLinks locale={locale} />
          </FooterDisclosure>
        </div>

        <div className="nk-footer__bottom">
          {/* Rights notice, naming the registered entity rather than the domain.
              The company code is no longer surfaced here — it stays published in
              the Organization JSON-LD and stated in full (with the registered
              address) in the Terms, Privacy and account-deletion pages linked
              from this same footer. */}
          <span className="nk-footer__legal">
            {t.copyright({ year: COPYRIGHT_YEAR, legalName: LEGAL_NAME })}
          </span>
          {/* Privacy control and payment marks read as one trailing cluster, split by a
              hairline: both answer "what does this site do with me / my money", and the
              copyright keeps the opposite edge to itself. */}
          <div className="nk-footer__meta">
            {/* Client leaf: the install-attribution choice must be changeable/withdrawable
                from any page, so it lives in the footer rather than only in the prompt. */}
            <PrivacyChoices />
            <span className="nk-footer__sep" aria-hidden />
            {/* Payment methods accepted in the app (via Stripe) — the site itself takes
                no payment. */}
            <div className="nk-footer__pay" role="list" aria-label={t.paymentLabel}>
              {FOOTER_PAY.map(([f, a]) => (
                <span key={f} role="listitem">
                  <Image src={`/naudokis/${f}.png`} alt={a} width={100} height={52}
                    style={{ height: 30, width: "auto" }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCategories({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;
  // split into two even columns so each side stays independent — height-balanced
  // multicol split unevenly whenever a two-line label inflated one column
  const mid = Math.ceil(t.categories.length / 2);
  const columns = [t.categories.slice(0, mid), t.categories.slice(mid)];
  return (
    <div className="nk-footer__catgrid">
      {columns.map((column, i) => (
        <ul key={i} className="nk-footer__catcol">
          {column.map((category) => (
            <li key={category.categoryId}>
              <Link href={listingLandingHref({ category: category.categoryId, locale })}>
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

function FooterCities({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;
  return (
    <ul className="nk-footer__linklist">
      {LT_CITIES.slice(0, 5).map((city) => (
        <li key={city}>
          <Link href={listingLandingHref({ city, locale })}>
            {t.cityLink(city)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterHelpLinks({ locale }: { locale: Locale }) {
  return (
    <ul className="nk-footer__linklist">
      {getDictionary(locale).footer.help.map((link) => (
        <li key={link.href}>
          <Link href={localePath(locale, link.href)}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}
