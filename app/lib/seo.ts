// Per-page metadata builder — mirrors the root layout's SEO shape (canonical +
// hreflang alternates + OG/Twitter), so new pages stay consistent and sourced
// from one place. Lithuanian is unprefixed at "/"; English lives at "/en".
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/app/lib/i18n/config";

const SITE_URL = "https://naudokis.lt";

// Shared guard for `[lang]` routes: narrow the segment to a valid `Locale` or
// 404. Use in both `generateMetadata` and the page component so invalid locales
// resolve consistently (`isLocale` is a type guard, so the return is typed
// `Locale` with no cast).
export function requireLocale(lang: string): Locale {
  if (!isLocale(lang)) {
    notFound();
  }
  return lang;
}

// `path` is the bare route, e.g. "/kategorijos" ("" for home).
function ltPath(path: string) {
  return path || "/";
}
function enPath(path: string) {
  return `/en${path}`;
}
function canonicalFor(locale: Locale, path: string) {
  return locale === defaultLocale ? ltPath(path) : enPath(path);
}

export function pageMetadata({
  locale, path, title, description, ogLocale, ogImageAlt, keywords, image,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogLocale: string;
  ogImageAlt: string;
  keywords?: string[];
  image?: string; // absolute URL for a per-page share image (e.g. a listing photo)
}): Metadata {
  const canonical = canonicalFor(locale, path);
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: "website",
    siteName: "Naudokis.lt",
    locale: ogLocale,
    url: `${SITE_URL}${canonical}`,
    title,
    description,
  };
  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title,
    description,
  };
  // A per-page image (e.g. a listing photo) overrides the generated OG card from
  // app/[lang]/opengraph-image.tsx; without one, that card is used automatically.
  if (image) {
    openGraph.images = [{ url: image, alt: ogImageAlt }];
    twitter.images = [image];
  }
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: "Naudokis",
    keywords,
    alternates: {
      canonical,
      languages: { lt: ltPath(path), en: enPath(path), "x-default": ltPath(path) },
    },
    openGraph,
    twitter,
  };
}
