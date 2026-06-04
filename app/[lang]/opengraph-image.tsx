// Generated 1200×630 social share card (cascades to every /[lang] route; the
// listing-detail page overrides it with the listing photo via generateMetadata).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { locales, defaultLocale, isLocale } from "@/app/lib/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Naudokis.lt";

// Prerender both locale cards at build time (matches the SSG pages), instead of
// rendering the image on demand per request.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Static Sora 700 (full latin + latin-ext, so Lithuanian diacritics render),
// bundled in the repo for deterministic offline builds — satori needs a TTF.
// Returns null on failure so the card still renders (falls back to sans-serif).
async function loadSora(): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), "public/fonts/Sora-Bold.ttf"));
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { hero } = getDictionary(isLocale(lang) ? lang : defaultLocale);

  const logoData = await readFile(join(process.cwd(), "public/naudokis/naudokis-logo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;
  const font = await loadSora();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: 80, background: "#282C2D",
          fontFamily: font ? "Sora" : "sans-serif", color: "#F9F9F9",
        }}
      >
        <img src={logoSrc} height={64} alt="" style={{ alignSelf: "flex-start" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, maxWidth: 900 }}>{hero.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: "#F9F367" }} />
            <span style={{ fontSize: 30, fontWeight: 700, color: "#F9F367" }}>naudokis.lt</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Sora", data: font, style: "normal", weight: 700 }] : undefined,
    },
  );
}
