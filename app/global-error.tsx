"use client";
// Last-resort boundary: catches errors thrown in the root layout itself, so it
// replaces the whole document and must render its own <html>/<body>. The locale
// context and design tokens are unavailable here, so styles and copy are
// self-contained (LT primary, EN secondary) and intentionally minimal. The
// inlined colors below intentionally mirror specific --nk-* tokens from
// globals.css (--nk-bg, --nk-text, --nk-text-2, --nk-purple); keep them in sync.
import { useEffect } from "react";
import { captureException } from "@/app/lib/report-error";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Via report-error, so this boundary — which is in every page's client graph —
  // does not statically pull the Sentry SDK into the default bundle.
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="lt">
      <body
        style={{
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
        }}
      >
        {/* No globals.css here (this replaces the whole document), so hover/focus
            states are provided by a self-contained inline <style> — CSP allows
            'unsafe-inline' for style-src. */}
        <style>{`
          .ge-btn:hover{background:#5756C6}
          .ge-btn:focus-visible,.ge-home:focus-visible{outline:2px solid #8A89FF;outline-offset:3px}
          .ge-home:hover{opacity:.82}
        `}</style>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Nepavyko parodyti puslapio</h1>
        <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" /* --nk-text-2 */ }}>
          Pabandykite dar kartą. Jei problema kartosis, grįžkite šiek tiek vėliau.
          <br />
          Please try again. If the problem continues, come back a little later.
        </p>
        <button
          className="ge-btn"
          onClick={reset}
          style={{
            cursor: "pointer",
            border: "none",
            borderRadius: 999,
            padding: "12px 28px",
            fontSize: 16,
            fontWeight: 600,
            background: "#6665E0", // --nk-purple (matches .nk-btn--primary)
            color: "#FFFFFF", // --nk-text
            transition: "background .15s ease",
          }}
        >
          Bandyti dar kartą / Try again
        </button>
        {/* Hard escape if reset() keeps failing — a full navigation (NOT next/link,
            which can't be relied on from the last-resort boundary that replaces the
            whole document). */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="ge-home" href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline", textUnderlineOffset: 3, fontSize: 14 }}>
          Grįžti į pradžią / Back to home
        </a>
      </body>
    </html>
  );
}
