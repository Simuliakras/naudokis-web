// Root-level 404 for unmatched URLs that never reach the [lang] segment. Since
// the localized root layout lives under app/[lang], this page must carry its
// own reset and brand chrome. Copy is LT-primary with an EN secondary line
// (mirroring app/global-error.tsx), since unmatched root URLs can be hit in
// either language. Inlined colors mirror --nk-* tokens; keep in sync.
import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/app/lib/contact";
import { brandFont } from "@/app/lib/fonts";

// This page used to carry a CSS module. It was the repo's only one, and it cost
// every OTHER route ~2.5 KB of render-blocking CSS: `globalNotFound` streams this
// component into every route's payload, so Next bundled its stylesheet into the
// shared chunk that blocks first paint site-wide. Inline <style> instead — the
// rules are needed on exactly one page, and this is the only way to say that.
// The names are hand-written and `nf-`-prefixed (no module hashing to scope them),
// so they must not collide with the nk- design system. Rules that a plain inline
// style could express still live in the style={{}} objects below; what is HERE is
// what an inline style cannot do: @container queries, :hover/:focus-visible, and
// the html[data-nf-en] ordering.
const styles = {
  root: "nf-root",
  header: "nf-header",
  nav: "nf-nav",
  cta: "nf-cta",
  ctaFull: "nf-cta-full",
  ctaShort: "nf-cta-short",
  card: "nf-card",
  badge: "nf-badge",
  title: "nf-title",
  ltFirst: "nf-lt-first",
  enFirst: "nf-en-first",
  ltPara: "nf-lt-para",
  enPara: "nf-en-para",
  actions: "nf-actions",
  get: "nf-get",
} as const;

// Hardcoded hexes rather than --nk-* are deliberate: this page must render
// correctly even if the token stylesheet fails to load. Keep #222527 in sync with
// --nk-bg in globals.css — it is a copy, not a source.
//
// The html/body reset is gated on :has(.nf-root) so it only applies while THIS page
// is mounted. An ungated `body { … }` here would repaint every route: that exact
// bug shipped once, painting a stale #282c2d (the pre-"Quiet Luxe" --nk-bg) over
// the real one, plus overflow-x:hidden clobbering globals.css's deliberate `clip`.
// The visible symptom was the sticky feed filter bar — the one element still
// painting the correct token — reading as a mismatched darker slab. Do not ungate.
const STYLES = `
html:has(.nf-root), body:has(.nf-root) { margin: 0; min-height: 100%; background: #222527 }
body:has(.nf-root) { overflow-x: hidden }
.nf-root { container: nk-not-found / inline-size }
.nf-root a:focus-visible { outline: 2px solid #8a89ff; outline-offset: 3px }
.nf-nav a:hover { color: #8a89ff !important }
.nf-cta { transition: opacity .15s ease, transform .15s ease }
.nf-cta:hover { opacity: .92 }
.nf-cta:active { transform: scale(.98) }
.nf-get:hover { color: #fff !important }
.nf-cta-short { display: none }

/* The root 404 owns no localized app shell, so its header measures itself.
   56rem, not 40: between 640 and ~900 the three links wrapped 2+1 with an
   orphaned "Kaip tai veikia" — the real Nav is a hamburger through that band. */
@container nk-not-found (width < 56rem) {
  .nf-nav { display: none !important }
}

/* Keep the bilingual secondary pill on one line at phone widths. */
@container nk-not-found (width < 26.875rem) {
  .nf-cta { font-size: 15px !important; padding-inline: 18px !important }
}

/* Language ordering: LT-first by default; under /en/* English takes the heading
   and the primary emphasis. The flag is stamped on <html> by the parse-time inline
   script below, NOT from an effect — an effect paints the Lithuanian order first
   and then visibly re-flows it, which is the one thing a 404 that is already the
   wrong page must not also do.
   !important is needed where the card's inline styles carry the LT-first look.

   Every ordered child is addressed by CLASS. This used to use :nth-child(), which
   silently re-ordered the card the moment anything was inserted between them. */
.nf-en-first { display: none }
html[data-nf-en] .nf-lt-first { display: none }
html[data-nf-en] .nf-en-first { display: inline }
html[data-nf-en] .nf-card { display: flex; flex-direction: column }
html[data-nf-en] .nf-badge { order: 1 }
html[data-nf-en] .nf-title { order: 2 }
html[data-nf-en] .nf-en-para { order: 3; color: rgba(255,255,255,.82) !important; font-size: clamp(17px, 2vw, 20px) !important; margin-top: 20px !important }
html[data-nf-en] .nf-lt-para { order: 4; color: rgba(255,255,255,.58) !important; font-size: clamp(14px, 1.6vw, 16px) !important; margin-top: 10px !important }
html[data-nf-en] .nf-actions { order: 5 }
html[data-nf-en] .nf-get { order: 6 }

@container nk-not-found (width < 26.875rem) {
  .nf-header { gap: 12px !important; padding-inline: 12px !important }
  .nf-header img { height: 32px !important; width: auto !important }
  .nf-header .nf-cta { padding-inline: 16px !important }
  .nf-cta-full { display: none }
  .nf-cta-short { display: inline }
}
`;

// Which language leads. The page is static — it is streamed into every route's RSC
// payload via global-not-found.tsx, with a hardcoded lang="lt" — so the path is only
// knowable in the browser. A raw inline <script>, deliberately NOT an effect and NOT
// next/script: it executes synchronously at parse time, so English visitors get the
// English order on the FIRST paint. From an effect they saw the Lithuanian heading,
// then watched the card re-order under them.
// Both the flag (read by the STYLES block above) and `lang` are set: the document
// really is in English then, and a screen reader must not read it with Lithuanian
// pronunciation rules. script-src carries 'unsafe-inline' (next.config.ts) and is
// deliberately unprobed, so this needs no hash allowlisting.
const LANG_BOOTSTRAP = `if(location.pathname==="/en"||location.pathname.indexOf("/en/")===0){document.documentElement.setAttribute("data-nf-en","");document.documentElement.lang="en"}`;

export const metadata: Metadata = {
  title: "Šio puslapio neradome | Page not found",
  description: "Adresas gali būti neteisingas arba puslapis perkeltas. The address may be wrong or the page may have moved.",
  robots: {
    index: false,
    follow: false,
  },
};

const navLinks = [
  { href: "/nuoma", label: "Kategorijos" },
  { href: "/skelbimai", label: "Nuomojami daiktai" },
  { href: "/kaip-tai-veikia", label: "Kaip tai veikia" },
];

const ctaBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  padding: "0 26px",
  borderRadius: 999,
  color: "#FFFFFF", // --nk-text
  textDecoration: "none",
  fontSize: 16,
  fontWeight: 750,
};
const primaryCta: React.CSSProperties = {
  ...ctaBase,
  background: "#5E5CE6", // --nk-purple (Quiet Luxe)
  boxShadow: "0 4px 18px rgba(94,92,230,.24)",
};
const secondaryCta: React.CSSProperties = {
  ...ctaBase,
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.16)",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 78% 18%, rgba(94,92,230,.30), transparent 34%), radial-gradient(circle at 18% 82%, rgba(16,185,129,.18), transparent 30%), #222527",
        color: "#FFFFFF",
      }}
      className={`${brandFont.className} ${styles.root}`}
    >
      <style id="nk-404-style" dangerouslySetInnerHTML={{ __html: STYLES }} />
      <script id="nk-404-lang" dangerouslySetInnerHTML={{ __html: LANG_BOOTSTRAP }} />
      <header
        className={styles.header}
        style={{
          minHeight: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "0 clamp(20px, 6vw, 82px)",
          background: "rgba(26,26,26,.78)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          backdropFilter: "blur(24px)",
        }}
      >
        <Link href="/" aria-label="Naudokis.lt" style={{ display: "inline-flex", alignItems: "center" }}>
          {/* loading="lazy" is not about this page — it is about every OTHER page.
              experimental.globalNotFound streams this whole tree into each route's
              RSC payload, and React Float emits a <link rel=preload as=image> for any
              eager <img> it renders. That put a preload of the UNOPTIMIZED logo PNG in
              the <head> of the home page, alongside the real optimized one the nav
              already fetches — two copies of the same mark, one of them for a page
              nobody is on. Lazy suppresses the preload; on the actual 404 this image
              is at the top of the viewport, so it still loads immediately. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={162} height={36} loading="lazy" style={{ height: 36, width: "auto" }} />
        </Link>
        <nav
          className={styles.nav}
          aria-label="Pagrindinė navigacija"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(14px, 3vw, 36px)",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={brandFont.className}
              style={{
                color: "#FFFFFF",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* the site's one conversion action stays in the chrome even here;
            /go is a redirect route handler, so a plain <a> is correct */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/go" aria-label="Atsisiųsti programėlę" className={`${styles.cta} ${brandFont.className}`} style={{ ...primaryCta, minHeight: 44, padding: "0 20px", fontSize: 15, flex: "none" }}>
          <span className={styles.ctaFull}>Atsisiųsti programėlę</span>
          <span className={styles.ctaShort}>Programėlė</span>
        </a>
      </header>

      <section
        style={{
          minHeight: "calc(100vh - 76px)",
          display: "grid",
          placeItems: "center",
          padding: "clamp(48px, 8vw, 112px) clamp(20px, 6vw, 82px)",
          boxSizing: "border-box",
        }}
      >
        <div
          className={styles.card}
          style={{
            width: "min(100%, 760px)",
            borderRadius: 20,
            padding: "clamp(28px, 5vw, 56px)",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.12)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 22px 50px rgba(0,0,0,.36)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <p
            className={styles.badge}
            style={{
              margin: "0 0 4px",
              color: "#F9F367",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: ".18em",
              textTransform: "uppercase",
            }}
          >
            404
          </p>
          <h1
            className={`${brandFont.className} ${styles.title}`}
            style={{
              margin: 0,
              fontSize: "clamp(34px, 7vw, 64px)",
              lineHeight: 1.04,
              letterSpacing: 0,
              fontWeight: 700,
            }}
          >
            {/* lang per span: the two never show at once, but the document's own
                lang is only right for one of them, and a screen reader reading
                "Page not found" with Lithuanian phonemes is unintelligible. */}
            <span lang="lt" className={styles.ltFirst}>Šio puslapio neradome</span>
            <span lang="en" className={styles.enFirst}>Page not found</span>
          </h1>
          <p
            lang="lt"
            className={styles.ltPara}
            style={{
              margin: "20px auto 0",
              maxWidth: 560,
              color: "rgba(255,255,255,.82)",
              fontSize: "clamp(17px, 2vw, 20px)",
              lineHeight: 1.55,
            }}
          >
            Adresas gali būti neteisingas arba puslapis perkeltas. Grįžkite į pradžią arba toliau naršykite nuomos pasiūlymus.
          </p>
          <p
            lang="en"
            className={styles.enPara}
            style={{
              margin: "10px auto 0",
              maxWidth: 560,
              color: "rgba(255,255,255,.58)",
              fontSize: "clamp(14px, 1.6vw, 16px)",
              lineHeight: 1.55,
            }}
          >
            The address may be wrong or the page may have moved. Go home or keep browsing rentals.
          </p>
          <div
            className={styles.actions}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 30,
            }}
          >
            <Link href="/" className={styles.cta} style={primaryCta}>
              Į pradžią / Home
            </Link>
            <Link href="/skelbimai" className={styles.cta} style={secondaryCta}>
              Naršyti skelbimus / Browse listings
            </Link>
          </div>
          {/* minimal install affordance — /go is a redirect route handler (sniffs
              the OS), so a full navigation via <a> is correct, not next/link. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/go" className={styles.get} style={{ display: "inline-block", marginTop: 22, color: "rgba(255,255,255,.6)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: 14, transition: "color .15s ease" }}>
            Atsisiųsti programėlę / Get the app
          </a>
        </div>
      </section>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "18px clamp(20px, 6vw, 82px)",
          borderTop: "1px solid rgba(255,255,255,.08)",
          color: "rgba(255,255,255,.6)",
          fontSize: 14,
        }}
      >
        <span>© {new Date().getFullYear()} MB Naudokis</span>
        <a href={"mailto:" + CONTACT_EMAIL} style={{ color: "rgba(255,255,255,.6)", textDecoration: "underline", textUnderlineOffset: 3 }}>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  );
}
