import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Providers } from "../providers";
import { I18nProvider } from "../components/I18nProvider";
import { ScrollToTop } from "../components/ScrollToTop";
import { locales, isLocale, localeHome } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { APP_STORE_ID } from "@/app/lib/contact";
import { SITE_URL } from "@/app/lib/seo";

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
    // iOS Safari Smart App Banner — Apple's own trusted install strip on the
    // highest-intent mobile segment; renders only in iOS Safari.
    itunes: { appId: APP_STORE_ID },
    // Geo-targeting signals for Lithuania (Vilnius), carried over from the
    // previous site so regional intent isn't lost in the migration.
    other: {
      "geo.region": "LT",
      "geo.placename": "Vilnius",
      "geo.position": "54.687157;25.279652",
      ICBM: "54.687157, 25.279652",
    },
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
// Pre-hydration handoff for the app-redirect modal. Runs beforeInteractive so a
// tap on the primary "Reserve" CTA before React hydrates still opens the modal
// instead of doing nothing. Contract (three parts, shared with AppRedirect.tsx):
//   1. Triggers opt in via `data-nk-redirect` + `data-nk-redirect-title|-body`
//      attributes (only the Reserve buttons in ListingDetail.tsx carry them;
//      their copy mirrors dict.bridge.reserveTitle/reserveBody).
//   2. While `window.__nkBridgeReady` is false, this captures the click, stashes
//      the payload on `window.__nkPendingRedirect`, and dispatches `nk:redirect`.
//   3. On mount, AppRedirect sets `__nkBridgeReady = true` and replays any
//      `__nkPendingRedirect` once; thereafter this early-returns and the React
//      `onClick={onReserve}` path (openRedirect → same event) owns every tap.
// No double-open: pre-hydration the dispatched event has no listener yet, so the
// single source of truth is the replayed pending payload.
const bridgeBootstrap = `
(() => {
  const EVENT = "nk:redirect";
  document.addEventListener("click", (event) => {
    if (window.__nkBridgeReady) return;
    const trigger = event.target && event.target.closest && event.target.closest("[data-nk-redirect]");
    if (!trigger) return;
    event.preventDefault();
    const payload = {
      title: trigger.getAttribute("data-nk-redirect-title") || "",
      body: trigger.getAttribute("data-nk-redirect-body") || ""
    };
    window.__nkPendingRedirect = payload;
    window.dispatchEvent(new CustomEvent(EVENT, { detail: payload }));
  }, true);
})();
`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dict = getDictionary(lang);
  return (
    <html lang={lang} className={`${archivo.variable} ${sora.variable}`} data-scroll-behavior="smooth">
      {/* suppressHydrationWarning: browser extensions (Grammarly, dark-reader, …)
          inject attributes onto <body> before React hydrates; this silences the
          resulting one-level attribute mismatch without hiding it for children. */}
      <body suppressHydrationWarning>
        {/* Raw server-rendered <script>, deliberately NOT next/script: it must be a real
            inline tag in the SSR HTML so it executes synchronously at parse time, before
            hydration. next/script's `beforeInteractive` does NOT do this for inline content
            in the App Router — it renders the script as a client-component reference with no
            parse-time tag, which silently breaks the pre-hydration contract above (verified).
            React's dev-only "script tag in component" warning does NOT fire on a clean render
            or in production; it only appears when a browser extension mutates <body> and
            forces React to client-render this subtree. Leave this as a raw <script>. */}
        <script id="nk-bridge-bootstrap" dangerouslySetInnerHTML={{ __html: bridgeBootstrap }} />
        <a href="#nk-main" className="nk-skip">{dict.common.skipToContent}</a>
        <Providers>
          <I18nProvider locale={lang}>
            <ScrollToTop />
            {children}
          </I18nProvider>
        </Providers>
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src={plausibleSrc} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
