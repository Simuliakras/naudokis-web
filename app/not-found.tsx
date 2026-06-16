// Root-level 404 for unmatched URLs that never reach the [lang] segment (the
// localized app/[lang]/not-found.tsx only fires on explicit notFound() calls
// inside the locale tree). There is no app/layout.tsx — the locale layout under
// [lang] acts as the root layout for matched routes — so this page renders its
// own <html>/<body> and self-contained styles/copy (LT primary, EN secondary),
// mirroring app/global-error.tsx. Inlined colors mirror --nk-* tokens; keep in sync.
import Link from "next/link";

const WRAP: React.CSSProperties = {
  margin: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  padding: 24,
  textAlign: "center",
  background: "#282C2D", // --nk-bg
  color: "#FFFFFF", // --nk-text
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

export default function NotFound() {
  return (
    <main style={WRAP}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "0.18em", color: "#6665E0" /* --nk-purple */ }}>404</p>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Puslapis nerastas</h1>
      <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" /* --nk-text-2 */ }}>
        Tokio puslapio nėra arba jis buvo perkeltas.
        <br />
        This page doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        style={{
          textDecoration: "none",
          borderRadius: 999,
          padding: "12px 28px",
          fontSize: 16,
          fontWeight: 600,
          background: "#6665E0", // --nk-purple (matches .nk-btn--primary)
          color: "#FFFFFF", // --nk-text
        }}
      >
        Į pradžią / Go home
      </Link>
    </main>
  );
}
