import type { Metadata, Viewport } from "next";
import { Archivo, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Providers } from "../providers";
import { I18nProvider } from "../components/I18nProvider";
import { locales, defaultLocale, isLocale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";

const SITE_URL = "https://naudokis.lt";

// Lithuanian is served unprefixed at "/"; English lives at "/en".
const localePath = (locale: string) => (locale === defaultLocale ? "/" : `/${locale}`);

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
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
    keywords: meta.keywords,
    alternates: {
      canonical: localePath(lang),
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
      url: `${SITE_URL}${localePath(lang)}`,
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
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  return (
    <html lang={lang} className={`${archivo.variable} ${sora.variable}`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly, dark-reader, …)
          inject attributes onto <body> before React hydrates; this silences the
          resulting one-level attribute mismatch without hiding it for children. */}
      <body suppressHydrationWarning>
        <Providers>
          <I18nProvider locale={lang}>{children}</I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
