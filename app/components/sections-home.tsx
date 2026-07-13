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
import { PrivacyChoices } from "./PrivacyChoices";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SOCIAL_PROFILES } from "@/app/lib/contact";
import { LT_CITIES } from "@/app/lib/cities";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import { listingLandingHref } from "@/app/lib/search";

/* ---------------- Hero ---------------- */
export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section id="top" style={{ position: "relative", background: "radial-gradient(circle at 85% 20%, var(--nk-purple-halo), transparent 42%), var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="hero-pattern" priority mobileBlank className="nk-hero-pattern nk-brand-pattern"
        style={{ position: "absolute", top: 0, bottom: 0, height: "100%", objectFit: "cover", objectPosition: "right top", pointerEvents: "none" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "clamp(20px, 3vw, 40px) var(--nk-section-y-lg)" }}>
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
            {/* LCP image: next/image serves responsive AVIF/WebP and `preload`
                preloads the desktop candidate. The ≤560px candidate is tiny on
                purpose — the device mockup is `display:none` there (see globals),
                so phones don't waste bandwidth preloading an image they never show. */}
            <Image className="nk-hero-phone" src="/naudokis/hero-phone.png" alt={dict.hero.phoneAlt}
              width={714} height={968} preload
              sizes="(max-width: 560px) 60px, (max-width: 1024px) 80vw, 420px"
              style={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-54%)", height: "118%", width: "auto", maxWidth: "none", filter: "var(--nk-shadow-phone-hero)" }} />
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
   The wrapper is clipped to the panel's rounded rect (the phone itself overflows
   it as a later sibling). */
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
      <Pattern name="footer-pattern" className="nk-footer__pattern" />
      <div className="nk-container">
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
            <AppBadges footer={true} height={46} />
          </div>

          {/* h2 (visually sized by the .nk-footer__col heading rule): hardcoded h4s
              produced h1→h4 outline jumps on pages with no h2/h3 (404, /invite). */}
          <nav className="nk-footer__col" aria-label={t.browseHeading}>
            <h2>{t.browseHeading}</h2>
            <FooterCategories locale={locale} />
          </nav>

          {/* city landings — internal-link equity + the H1's own "nearby" promise */}
          <nav className="nk-footer__col nk-footer__col--center" aria-label={t.citiesHeading}>
            <h2>{t.citiesHeading}</h2>
            <FooterCities locale={locale} />
          </nav>

          <nav className="nk-footer__col" aria-label={t.helpHeading}>
            <h2>{t.helpHeading}</h2>
            <FooterHelpLinks locale={locale} />
          </nav>
        </div>

        <div className="nk-footer__bottom">
          <span className="nk-footer__legal">{t.copyright}</span>
          {/* Client leaf: the install-attribution choice must be changeable/withdrawable
              from any page, so it lives in the footer rather than only in the prompt. */}
          <PrivacyChoices />
          <div className="nk-footer__pay">
            {FOOTER_PAY.map(([f, a]) => (
              <Image key={f} src={`/naudokis/${f}.png`} alt={a} width={100} height={52}
                style={{ height: 30, width: "auto" }} />
            ))}
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
        <div key={i} className="nk-footer__catcol">
          {column.map((category) => (
            <Link key={category.categoryId} href={listingLandingHref({ category: category.categoryId, locale })}>
              {category.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

function FooterCities({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;
  return (
    <>
      {LT_CITIES.slice(0, 5).map((city) => (
        <Link key={city} href={listingLandingHref({ city, locale })}>
          {t.cityLink(city)}
        </Link>
      ))}
    </>
  );
}

function FooterHelpLinks({ locale }: { locale: Locale }) {
  return (
    <>
      {getDictionary(locale).footer.help.map((link) => (
        <Link key={link.href} href={localePath(locale, link.href)}>{link.label}</Link>
      ))}
    </>
  );
}
