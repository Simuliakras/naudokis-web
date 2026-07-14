import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { defaultLocale, isLocale, locales } from "@/app/lib/i18n/config";

const size = { width: 1200, height: 630 };

// The card is identical for every request in a locale, so render both at build
// time rather than paying for satori + two file reads on each cold request. (The
// deleted opengraph-image.tsx this replaces was prerendered the same way.)
export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

async function loadSora(): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), "public/fonts/Sora-Bold.ttf"));
  } catch {
    return null;
  }
}

// Explicit share-image endpoint. Keeping it outside Next's opengraph-image file
// convention prevents the internal /lt segment from leaking into public OG URLs.
export async function GET(_: Request, { params }: RouteContext<"/[lang]/social-card">) {
  const { lang } = await params;
  const { hero } = getDictionary(isLocale(lang) ? lang : defaultLocale);
  const logoData = await readFile(join(process.cwd(), "public/naudokis/naudokis-logo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;
  const font = await loadSora();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#282C2D", fontFamily: font ? "Sora" : "sans-serif", color: "#F9F9F9" }}>
        {/* ImageResponse renders this data URI directly; next/image is not supported here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
