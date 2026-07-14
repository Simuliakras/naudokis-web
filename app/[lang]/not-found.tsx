import type { Metadata } from "next";
import { LocalizedNotFoundScreen } from "@/app/components/LocalizedNotFoundScreen";
import { SITE_URL } from "@/app/lib/seo";

// A localized not-found cannot receive route params, so keep the head concise
// and bilingual. Most importantly, do not inherit the homepage canonical or OG
// identity for a URL that returned 404.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Puslapis nerastas | Page not found | Naudokis.lt",
  description: "Patikrinkite adresą arba grįžkite į nuomojamų daiktų sąrašą. Check the address or browse available rentals.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return <LocalizedNotFoundScreen />;
}
