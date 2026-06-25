// Root-level 404 for unmatched URLs that never reach the [lang] segment. Since
// the localized root layout lives under app/[lang], this page must carry its
// own reset and brand chrome. Copy is LT-primary with an EN secondary line
// (mirroring app/global-error.tsx), since unmatched root URLs can be hit in
// either language. Inlined colors mirror --nk-* tokens; keep in sync.
import Link from "next/link";

const navLinks = [
  { href: "/kategorijos", label: "Kategorijos" },
  { href: "/skelbimai", label: "Skelbimai" },
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
    <>
      <style>{`
        html, body {
          margin: 0;
          min-height: 100%;
          background: #282C2D;
        }
        body {
          overflow-x: hidden;
        }
        @media (max-width: 640px) {
          .nf-header {
            justify-content: center !important;
          }
          .nf-nav {
            display: none !important;
          }
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 78% 18%, rgba(102,101,224,.30), transparent 34%), radial-gradient(circle at 18% 82%, rgba(16,185,129,.18), transparent 30%), #282C2D",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <header
          className="nf-header"
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
            className="nf-nav"
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
                style={{
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontSize: 16,
                  fontWeight: 650,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
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
                margin: "0 0 14px",
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
              style={{
                margin: 0,
                fontSize: "clamp(34px, 7vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: 0,
              }}
            >
              Puslapis nerastas
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
              Šis adresas neegzistuoja arba buvo perkeltas. Grįžkite į pagrindinį puslapį arba tęskite daiktų paiešką.
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
              This page doesn’t exist or has moved. Head back home or keep browsing rentals.
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
              <Link href="/" style={primaryCta}>
                Į pradžią
              </Link>
              <Link href="/skelbimai" style={secondaryCta}>
                Naršyti skelbimus
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
