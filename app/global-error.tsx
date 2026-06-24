"use client";
// Last-resort boundary: catches errors thrown in the root layout itself, so it
// replaces the whole document and must render its own <html>/<body>. The locale
// context and design tokens are unavailable here, so styles and copy are
// self-contained (LT primary, EN secondary) and intentionally minimal. The
// inlined colors below intentionally mirror specific --nk-* tokens from
// globals.css (--nk-bg, --nk-text, --nk-text-2, --nk-purple); keep them in sync.
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
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
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Nepavyko parodyti puslapio</h1>
        <p style={{ margin: 0, maxWidth: 420, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" /* --nk-text-2 */ }}>
          Pabandykite dar kartą. Jei problema kartosis, grįžkite šiek tiek vėliau.
          <br />
          Please try again. If the problem continues, come back a little later.
        </p>
        <button
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
          }}
        >
          Bandyti dar kartą / Try again
        </button>
      </body>
    </html>
  );
}
