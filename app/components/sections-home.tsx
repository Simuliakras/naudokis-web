// Naudokis UI kit — presentational homepage sections (no "use client": rendered
// as server components by the home page, so their JSX stays out of the client
// bundle; the same file compiles as client code where client screens import
// Footer). Translations come from a `locale` prop + getDictionary — the Dict
// holds function members, so it must never cross the server→client boundary.
import Link from "next/link";
import Image from "next/image";
import {
  Icon, type IconName, Logo, AppBadges, SectionHead, QR, Pattern,
} from "./ui";
import { FeatureCard, Testimonial } from "./cards";
import { SearchBar } from "./sections";
import { listingSearchHref } from "@/app/lib/search";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/app/lib/contact";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import type { Locale } from "@/app/lib/i18n/config";

/* ---------------- Hero ---------------- */
export function Hero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section id="top" style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="hero-pattern" priority
        style={{ position: "absolute", right: -80, top: 0, bottom: 0, height: "100%", width: 1000, objectFit: "cover", objectPosition: "right top", opacity: 0.30, pointerEvents: "none" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "clamp(20px, 3vw, 40px) var(--nk-section-y-lg)" }}>
        {/* grid columns / padding / min-height live on .nk-hero-panel in globals.css
            so the 980px stack doesn't need !important overrides */}
        <div className="nk-hero-panel nk-grain nk-gborder" style={{ position: "relative", borderRadius: 20, background: "var(--nk-glass)", backdropFilter: "blur(35px)" }}>
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
          <div className="nk-hero-media" style={{ position: "relative" }}>
            {/* LCP image: next/image serves responsive AVIF/WebP and `priority`
                preloads it (replaces the manual fetchPriority hint). */}
            <Image src="/naudokis/hero-phone.png" alt={dict.hero.phoneAlt} width={714} height={968} priority sizes="(max-width: 980px) 80vw, 420px" style={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-54%)", height: "118%", width: "auto", maxWidth: "none", filter: "var(--nk-shadow-phone-hero)" }} />
            <div style={{ position: "absolute", right: 32, bottom: 0 }}><QR size={132} /></div>
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
    <section style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="section-pattern" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.40 }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "var(--nk-section-y-lg)" }}>
        <div className="nk-reveal nk-row">
          {dict.features.map((f, i) => <div key={f.title} className="nk-reveal" data-delay={(i % 3) + 1} style={{ display: "flex", flex: 1 }}><FeatureCard {...f} /></div>)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Bottom SEO text block ---------------- */
export function HomeSeo({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home;
  return (
    <section className="nk-container" style={{ paddingBlock: "0 var(--nk-section-y)" }}>
      <div className="nk-reveal" style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{t.seoHeading}</h2>
        <p className="nk-prose" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{t.seoBody}</p>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ----------------
   Static two-column pair of featured reviews, matching the design bundle. */
export function Testimonials({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).testimonials;
  const items = t.items.slice(0, 2);
  return (
    <section className="nk-container" style={{ paddingBlock: "var(--nk-section-y)" }}>
      <SectionHead eyebrow={t.eyebrow} title={t.title} quiet />
      <div className="nk-reveal nk-row">
        {items.map((item) => (
          <Testimonial key={item.name} name={item.name} role={item.role} quote={item.quote} avatarTint={item.avatarTint} />
        ))}
      </div>
    </section>
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
      <div className="nk-reveal nk-cta nk-grain nk-gborder" style={{ position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 620, background: "linear-gradient(135deg, var(--nk-card-grad-1) 0%, var(--nk-card-grad-2) 52%, var(--nk-bg-deep) 100%)", boxShadow: "var(--nk-shadow-banner)" }}>
        <AmbientGlow />
        {/* phone bleeding from the top, filling the right half down to the bottom edge */}
        <Image className="nk-cta__media" src="/naudokis/download-phone.png" alt={dict.cta.phoneAlt} width={899} height={705} sizes="(max-width: 980px) 60vw, 480px" style={{ position: "absolute", right: 0, top: -56, height: 680, width: "auto", maxWidth: "52%", objectFit: "cover", objectPosition: "left top", filter: "var(--nk-shadow-phone-cta)" }} />
        <div className="nk-cta__badges" style={{ position: "absolute", left: "var(--nk-panel-pad)", top: "var(--nk-panel-pad)" }}><AppBadges /></div>
        <div className="nk-cta__body" style={{ position: "absolute", left: "var(--nk-panel-pad)", bottom: "var(--nk-panel-pad)", maxWidth: 808, display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px 8px 12px", borderRadius: "var(--nk-r-pill)", background: "var(--nk-glass-strong)", border: "1px solid var(--nk-border)", backdropFilter: "blur(12px)" }}>
            <Icon name="Sparkles" size={17} color="var(--nk-yellow)" />
            <span style={{ fontFamily: "var(--nk-font-body)", fontWeight: 500, fontSize: 15, letterSpacing: ".04em", color: "var(--nk-yellow)" }}>{dict.cta.badge}</span>
          </span>
          <h2 className="nk-h-cta" style={{ color: "var(--nk-text)" }}>{dict.cta.title}</h2>
          <p style={{ margin: 0, maxWidth: 640, fontFamily: "var(--nk-font-body)", fontSize: 20, lineHeight: "32px", color: "var(--nk-text-muted)" }}>{dict.cta.body}</p>
        </div>
        <div className="nk-cta__media" style={{ position: "absolute", right: 80, bottom: "var(--nk-panel-pad)" }}><QR size={168} /></div>
      </div>
    </section>
  );
}

/* Ambient glow layer behind the CTA copy — purple + yellow radial glows, a
   diagonal sheen, and a bottom vignette to keep the headline crisp. */
function AmbientGlow() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
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
const FOOTER_SOCIAL: IconName[] = ["Facebook", "Instagram", "Linkedin"];
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
            <Logo />
            <p className="nk-footer__tagline">{t.tagline}</p>
            <div className="nk-footer__contact">
              <a href={CONTACT_PHONE_TEL}><Icon name="Phone" size={17} stroke={2} color="var(--nk-text-muted)" /> {CONTACT_PHONE}</a>
              <a href={"mailto:" + CONTACT_EMAIL}><Icon name="Mail" size={17} stroke={2} color="var(--nk-text-muted)" /> {CONTACT_EMAIL}</a>
            </div>
            {/* Placeholder profiles — purely decorative until real URLs exist,
                so the whole row is hidden from assistive tech. Swap the spans
                for <a href> when the accounts go live. */}
            <div className="nk-footer__social" aria-hidden="true">
              {FOOTER_SOCIAL.map((n) => (
                <span key={n}>
                  <Icon name={n} size={20} color="var(--nk-text)" stroke={1.8} />
                </span>
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
              <img key={f} src={`/naudokis/${f}.png`} alt={a} loading="lazy" style={{ height: 30, width: "auto" }} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
