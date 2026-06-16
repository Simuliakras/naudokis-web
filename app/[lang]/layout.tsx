import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Providers } from "../providers";
import { I18nProvider } from "../components/I18nProvider";
import { locales, isLocale, localeHome } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";

const SITE_URL = "https://naudokis.lt";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  // 800 was declared but never referenced in CSS/inline styles (max used is 700).
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    return {};
  }
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    applicationName: "Naudokis",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/naudokis/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/naudokis/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: { url: "/naudokis/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    },
    alternates: {
      canonical: localeHome(lang),
      languages: {
        lt: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Naudokis.lt",
      locale: meta.ogLocale,
      url: `${SITE_URL}${localeHome(lang)}`,
      title: meta.title,
      description: meta.description,
      // Image comes from app/[lang]/opengraph-image.tsx (generated 1200×630 card).
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      // Image comes from app/[lang]/opengraph-image.tsx.
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#282C2D",
  colorScheme: "dark",
  // viewport-fit=cover makes env(safe-area-inset-*) non-zero on notched iPhones
  // (the sticky mobile bar, sheets and app banner all pad with it).
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Cookieless analytics (Plausible). Only loaded when a domain is configured, so
// dev and unconfigured builds ship no third-party script and write no cookies.
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={`${archivo.variable} ${sora.variable}`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly, dark-reader, …)
          inject attributes onto <body> before React hydrates; this silences the
          resulting one-level attribute mismatch without hiding it for children. */}
      <body suppressHydrationWarning>
        <a href="#nk-main" className="nk-skip">{dict.common.skipToContent}</a>
        <Providers>
          <I18nProvider locale={lang}>{children}</I18nProvider>
        </Providers>
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src={plausibleSrc} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
