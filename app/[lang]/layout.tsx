import type { Metadata, Viewport } from "next";
import "../globals.css";
import { I18nProvider } from "../components/I18nProvider";
import { ScrollToTop } from "../components/ScrollToTop";
import { Analytics } from "../components/Analytics";
import { WebVitals } from "../components/WebVitals";
import { defaultLocale, locales, isLocale, localeHome } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { APP_STORE_ID } from "@/app/lib/contact";
import { SITE_URL, canonicalFor } from "@/app/lib/seo";
import { brandFont, priceFont } from "@/app/lib/fonts";
import { BRIDGE_BOOTSTRAP } from "@/app/lib/bridge-bootstrap";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    return {};
  }
  const { meta } = getDictionary(lang);
  // Same builder pageMetadata() uses, rather than a second hand-rolled lt/en ternary.
  const socialCard = `${SITE_URL}${canonicalFor(lang, "/social-card")}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    applicationName: "Naudokis",
    manifest: "/manifest.webmanifest",
    // iOS Safari Smart App Banner — Apple's own trusted install strip on the
    // highest-intent mobile segment; renders only in iOS Safari.
    itunes: { appId: APP_STORE_ID },
    icons: {
      icon: [
        { url: "/naudokis/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/naudokis/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: { url: "/naudokis/icon-192.png", sizes: "192x192", type: "image/png" },
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
      alternateLocale: lang === "lt" ? ["en_GB"] : ["lt_LT"],
      images: [{
        url: socialCard,
        width: 1200,
        height: 630,
        alt: meta.ogImageAlt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [socialCard],
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
// Pre-hydration handoff for the app-redirect modal. The CSP-hashed inline script
// executes synchronously at parse time, so a
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
export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  return (
    <html lang={locale} className={`${brandFont.variable} ${priceFont.variable}`} data-scroll-behavior="smooth">
      {/* suppressHydrationWarning: browser extensions (Grammarly, dark-reader, …)
          inject attributes onto <body> before React hydrates; this silences the
          resulting one-level attribute mismatch without hiding it for children. */}
      <body suppressHydrationWarning>
        {/* Raw server-rendered <script>, deliberately NOT next/script: it must be a real
            inline tag in the SSR HTML so it executes synchronously at parse time, before
            hydration. next/script's `beforeInteractive` does NOT do this for inline content
            in the App Router — it renders the script as a client-component reference with no
            parse-time tag, which silently breaks the pre-hydration contract above (verified).
            Its exact content is SHA-256 allowlisted in the strict report-only CSP;
            Next's static bootstrap is the only remaining inline-script blocker.
            React's dev-only "script tag in component" warning does NOT fire on a clean render
            or in production; it only appears when a browser extension mutates <body> and
            forces React to client-render this subtree. Leave this as a raw <script>. */}
        <script id="nk-bridge-bootstrap" dangerouslySetInnerHTML={{ __html: BRIDGE_BOOTSTRAP }} />
        <I18nProvider locale={locale}>
          <ScrollToTop />
          {children}
        </I18nProvider>
        {plausibleDomain && (
          <>
            <Analytics domain={plausibleDomain} src={plausibleSrc} />
            <WebVitals />
          </>
        )}
      </body>
    </html>
  );
}
