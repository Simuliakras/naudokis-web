// Root-level 404 for unmatched URLs that never reach the [lang] segment. Since
// the localized root layout lives under app/[lang], this page must carry its
// own reset and brand chrome. Copy is LT-primary with an EN secondary line
// (mirroring app/global-error.tsx), since unmatched root URLs can be hit in
// either language. Inlined colors mirror --nk-* tokens; keep in sync.
import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/app/lib/contact";
import { brandFont } from "@/app/lib/fonts";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Šio puslapio neradome | Page not found",
  description: "Adresas gali būti neteisingas arba puslapis perkeltas. The address may be wrong or the page may have moved.",
  robots: {
    index: false,
    follow: false,
  },
};

const navLinks = [
  { href: "/kategorijos", label: "Kategorijos" },
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
  background: "#6665E0", // --nk-purple
  boxShadow: "0 4px 18px rgba(102,101,224,.24)",
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
          "radial-gradient(circle at 78% 18%, rgba(102,101,224,.30), transparent 34%), radial-gradient(circle at 18% 82%, rgba(16,185,129,.18), transparent 30%), #222527",
        color: "#FFFFFF",
      }}
      className={`${brandFont.className} ${styles.root}`}
    >
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={162} height={36} style={{ height: 36, width: "auto" }} />
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
            className={brandFont.className}
            style={{
              margin: 0,
              fontSize: "clamp(34px, 7vw, 64px)",
              lineHeight: 1.04,
              letterSpacing: 0,
              fontWeight: 700,
            }}
          >
            Šio puslapio neradome
          </h1>
          <p
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
              Naršyti nuomą / Browse rentals
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
        <span>© {new Date().getFullYear()} Naudokis.lt</span>
        <a href={"mailto:" + CONTACT_EMAIL} style={{ color: "rgba(255,255,255,.6)", textDecoration: "underline", textUnderlineOffset: 3 }}>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  );
}
