// Naudokis UI kit — presentational homepage sections (no "use client": rendered
// as server components by the home page, so their JSX stays out of the client
// bundle; the same file compiles as client code where client screens import
// Footer). Translations come from a `locale` prop + getDictionary — the Dict
// holds function members, so it must never cross the server→client boundary.
import Image from "next/image";
import Link from "next/link";
import {
  Icon, type IconName, LogoMark, QR, Pattern,
} from "./visual";
import {
  AppBadges,
} from "./ui";
import { SearchBar } from "./HeroSearch";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SOCIAL_PROFILES } from "@/app/lib/contact";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import { listingLandingHref } from "@/app/lib/search";

/* ---------------- Hero ---------------- */
export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section id="top" style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="hero-pattern" priority className="nk-hero-pattern nk-brand-pattern"
        style={{ position: "absolute", top: 0, bottom: 0, height: "100%", objectFit: "cover", objectPosition: "right top", pointerEvents: "none" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "clamp(20px, 3vw, 40px) var(--nk-section-y-lg)" }}>
        {/* grid columns / padding / min-height live on .nk-hero-panel in globals.css
            so the 980px stack doesn't need !important overrides */}
        <div className="nk-hero-panel nk-grain nk-gborder" style={{ position: "relative", borderRadius: "var(--nk-r-lg)", background: "var(--nk-glass)", backdropFilter: "blur(35px)" }}>
          <AmbientGlow variant="hero" />
          {/* left column */}
          <div className="nk-hero-intro" style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "var(--nk-stack-lg)", justifyContent: "center", maxWidth: "min(100%, 680px)" }}>
            <span className="nk-hero-badge" style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 14, background: "var(--nk-green)", borderRadius: "var(--nk-r-pill)", padding: "6px 18px 6px 6px", boxShadow: "var(--nk-edge-top)" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, background: "var(--nk-bg)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon name="Users" size={18} color="var(--nk-text)" stroke={1.8} />
              </span>
              <b className="nk-hero-badge__label" style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, color: "var(--nk-bg)" }}>{dict.hero.badge}</b>
            </span>
            <h1 className="nk-h-hero" style={{ margin: 0 }}>{dict.hero.title}</h1>
            <p className="nk-body" style={{ margin: 0, maxWidth: "min(100%, 540px)" }}>{dict.hero.body}</p>
            <SearchBar />
            <AppBadges />
          </div>
          {/* right column — real app device + QR */}
          <div className="nk-hero-media" style={{ position: "relative", zIndex: 1 }}>
            {/* LCP image: next/image serves responsive AVIF/WebP and `preload`
                preloads it (replaces the manual fetchPriority hint). */}
            {/* `preload` preloads the desktop LCP; the ≤560px candidate is tiny on
                purpose because the device mockup is `display:none` there (see globals),
                so phones don't waste bandwidth preloading an image they never show. */}
            <Image className="nk-hero-phone" src="/naudokis/hero-phone.png" alt={dict.hero.phoneAlt} width={714} height={968} preload sizes="(max-width: 560px) 60px, (max-width: 1024px) 80vw, 420px" style={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-54%)", height: "118%", width: "auto", maxWidth: "none", filter: "var(--nk-shadow-phone-hero)" }} />
            <div className="nk-hero-qr" style={{ position: "absolute", right: "clamp(16px, 2vw, 32px)", bottom: 0 }}><QR size={132} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Features band ---------------- */
export function Features({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden", marginBlock: "var(--nk-section-y-lg)" }}>
      <Pattern name="section-pattern" className="nk-brand-pattern" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "var(--nk-section-y-lg)" }}>
        <div className="nk-row">
          {dict.features.map((f) => <FeatureCard key={f.title} {...f} className="nk-reveal" />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon = "ShieldCheck", title, body, className,
}: {
  icon?: IconName;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={className ? `nk-feature ${className}` : "nk-feature"} style={{
      flex: 1, borderRadius: "var(--nk-r-card)", background: "var(--nk-glass-strong)", backdropFilter: "var(--nk-blur)", WebkitBackdropFilter: "var(--nk-blur)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-1)",
      padding: "var(--nk-block-pad)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-stack-lg)", textAlign: "center",
    }}>
      <span style={{ width: "var(--nk-size-icon-lg)", height: "var(--nk-size-icon-lg)", borderRadius: "50%", background: "var(--nk-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={36} color="var(--nk-yellow)" stroke={2} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
        <h3 className="nk-h-card" style={{ margin: 0 }}>{title}</h3>
        <p className="nk-body" style={{ margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

/* ---------------- CTA banner ----------------
   Background ported from the design's AiGenerateHeroPanel: a diagonal brand
   gradient (cardGradient → near-black) with an ambient glow + hairline border
   and a sparkle eyebrow pill — replaces the old flat-green fill + X confetti. */
export function CtaBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="nk-container" style={{ paddingBlock: "var(--nk-section-y-lg)" }}>
      <div className="nk-reveal nk-cta nk-grain nk-gborder" style={{ position: "relative", borderRadius: "var(--nk-r-lg)", overflow: "hidden", minHeight: 620, background: "linear-gradient(135deg, var(--nk-card-grad-1) 0%, var(--nk-card-grad-2) 52%, var(--nk-bg-deep) 100%)" }}>
        <AmbientGlow variant="cta" />
        {/* phone bleeding from the top, filling the right half down to the bottom edge */}
        <Image className="nk-cta__media" src="/naudokis/download-phone.png" alt={dict.cta.phoneAlt} width={899} height={705} sizes="(max-width: 980px) 60vw, 480px" style={{ position: "absolute", right: 0, top: -56, height: 680, width: "auto", maxWidth: "52%", objectFit: "cover", objectPosition: "left top", filter: "var(--nk-shadow-phone-cta)" }} />
        <div className="nk-cta__badges" style={{ position: "absolute", left: "var(--nk-panel-pad)", top: "var(--nk-panel-pad)" }}><AppBadges /></div>
        <div className="nk-cta__body" style={{ position: "absolute", left: "var(--nk-panel-pad)", bottom: "var(--nk-panel-pad)", maxWidth: 808, display: "flex", flexDirection: "column", gap: "var(--nk-gap-lg)" }}>
          <h2 className="nk-h-cta">{dict.cta.title}</h2>
          <p style={{ margin: 0, maxWidth: 640, fontFamily: "var(--nk-font-body)", fontSize: 20, lineHeight: "32px", color: "var(--nk-text-muted)" }}>{dict.cta.body}</p>
        </div>
        <div className="nk-cta__media" style={{ position: "absolute", right: 80, bottom: "var(--nk-panel-pad)" }}><QR size={168} /></div>
      </div>
    </section>
  );
}

/* Ambient glow layer — purple + yellow radial glows, a diagonal sheen and a
   vignette. The "cta" variant keys the glow to the bottom-left copy; the "hero"
   variant concentrates it behind the device on the right so the phone pops.
   The wrapper is clipped to the panel's rounded rect (the phone itself
   overflows it as a later sibling). */
function AmbientGlow({ variant }: { variant: "cta" | "hero" }) {
  if (variant === "hero") {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
        <div style={{ position: "absolute", top: "50%", right: "-10%", width: 720, height: 720, borderRadius: "50%", transform: "translateY(-50%)", background: "radial-gradient(circle, var(--nk-glow-purple) 0%, transparent 66%)" }} />
        <div style={{ position: "absolute", top: "-14%", right: "8%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-purple-hover) 26%, transparent) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-8%", right: "14%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-yellow) 14%, transparent) 0%, transparent 64%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, color-mix(in srgb, var(--nk-purple) 10%, transparent) 0%, transparent 52%)" }} />
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      <div style={{ position: "absolute", top: "-16%", left: "-8%", width: 680, height: 680, borderRadius: "50%", background: "radial-gradient(circle, var(--nk-glow-purple) 0%, transparent 68%)" }} />
      <div style={{ position: "absolute", top: "6%", right: "16%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-purple-hover) 30%, transparent) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: "44%", right: "3%", width: 420, height: 420, borderRadius: "50%", transform: "translateY(-50%)", background: "radial-gradient(circle, color-mix(in srgb, var(--nk-yellow) 16%, transparent) 0%, transparent 66%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, color-mix(in srgb, var(--nk-purple) 12%, transparent) 0%, transparent 58%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 46%, rgba(0,0,0,0.30) 100%)" }} />
    </div>
  );
}

/* ---------------- Footer ----------------
   Multi-column marketplace sitemap: brand + Browse / Help columns, then a bottom
   bar with copyright, a "secure payments" badge and the payment marks. */
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
            <div className="nk-footer__social" aria-label={t.socialLabel}>
              {SOCIAL_PROFILES.map((profile) => (
                <a key={profile.id} href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={profile.label}>
                  <Icon name={profile.icon} size={20} color="currentColor" />
                </a>
              ))}
            </div>
            <AppBadges footer={true} height={46} />
          </div>

          <nav className="nk-footer__col" aria-label={t.browseHeading}>
            <h4>{t.browseHeading}</h4>
            <FooterCategories locale={locale} />
          </nav>

          <nav className="nk-footer__col" aria-label={t.helpHeading}>
            <h4>{t.helpHeading}</h4>
            <FooterHelpLinks locale={locale} />
          </nav>
        </div>

        <div className="nk-footer__bottom">
          <span className="nk-footer__legal">{t.copyright}</span>
          <div className="nk-footer__pay">
            <span className="nk-footer__secure"><Icon name="ShieldCheck" size={17} color="var(--nk-green)" stroke={2} /> {t.secure}</span>
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
  return (
    <div className="nk-footer__catgrid">
      {t.categories.map((category) => (
        <Link key={category.categoryId} href={listingLandingHref({ category: category.categoryId, locale })}>
          {category.label}
        </Link>
      ))}
    </div>
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
