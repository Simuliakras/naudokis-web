// Per-page metadata builder — mirrors the root layout's SEO shape (canonical +
// hreflang alternates + OG/Twitter), so new pages stay consistent and sourced
// from one place. Lithuanian is unprefixed at "/"; English lives at "/en".
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, localePrefix, type Locale } from "@/app/lib/i18n/config";
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS, APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
import type { FaqItem } from "@/app/lib/i18n/types";
import { LT_CITIES, type City } from "@/app/lib/cities";
import type { Category } from "@/app/lib/categories";

// Canonical production origin — the single source of truth for absolute URLs,
// shared by the metadata builders here and the sitemap/robots routes.
export const SITE_URL = "https://www.naudokis.lt";

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
export function ltPath(path: string) {
  return path || "/";
}
export function enPath(path: string) {
  return `/en${path}`;
}
export function canonicalFor(locale: Locale, path: string) {
  const prefix = localePrefix(locale);
  return prefix ? `${prefix}${path}` : ltPath(path);
}

export type ListingLandingFilters = { category?: string; city?: string };

export function listingLandingPath(filters: ListingLandingFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.category) {
    params.set("cat", filters.category);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  const query = params.toString();
  return query ? `/skelbimai?${query}` : "/skelbimai";
}

// Resolve the ?cat / ?city feed filters to the canonical category/city landing
// state: the matched category/city (if valid), whether either param was invalid
// (used to keep junk filter URLs out of the index), and the canonical path.
export type ListingLanding = {
  category?: Category;
  city?: City;
  hasInvalidCategory: boolean;
  hasInvalidCity: boolean;
  path: string;
};

export function resolveListingLanding({
  catParam, cityParam, categories,
}: {
  catParam: string;
  cityParam: string;
  categories: Category[];
}): ListingLanding {
  const cat = catParam.trim();
  const cityName = cityParam.trim();
  const category = categories.find((c) => c.id === cat);
  const city = LT_CITIES.find((c) => c === cityName);
  return {
    category,
    city,
    hasInvalidCategory: Boolean(cat && !category),
    hasInvalidCity: Boolean(cityName && !city),
    path: listingLandingPath({ category: category?.id, city }),
  };
}

export function pageMetadata({
  locale, path, title, description, ogLocale, ogImageAlt, image, ltOnly,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogLocale: string;
  ogImageAlt: string;
  image?: string; // absolute URL for a per-page share image (e.g. a listing photo)
  // Set for content that exists only in Lithuanian (e.g. the policy-center doc):
  // the LT URL is canonical for both locales, the EN hreflang is dropped, and the
  // EN render is marked noindex so the duplicate LT-under-EN URL stays out of the index.
  ltOnly?: boolean;
}): Metadata {
  // For LT-only content the canonical is always the LT URL, regardless of locale.
  const canonical = ltOnly ? ltPath(path) : canonicalFor(locale, path);
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
  const languages = ltOnly
    ? { lt: ltPath(path), "x-default": ltPath(path) }
    : { lt: ltPath(path), en: enPath(path), "x-default": ltPath(path) };
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: "Naudokis",
    // Keep the duplicate LT-content-under-/en URL out of the index.
    robots: ltOnly && locale !== defaultLocale ? { index: false, follow: true } : undefined,
    alternates: {
      canonical,
      languages,
    },
    openGraph,
    twitter,
  };
}

/* ---------------- JSON-LD builders ---------------- */
// Structural type for a schema.org node — typed enough to avoid `any` while
// staying flexible across the varied shapes below. Rendered by <JsonLd/>.
export type JsonLdNode = Record<string, unknown>;

// Absolute, locale-correct URL for a bare path ("" → home). Mirrors the
// canonical logic so JSON-LD URLs match the page's own canonical/hreflang.
export function absoluteUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${canonicalFor(locale, path)}`;
}

const inLanguage = (locale: Locale) => (locale === "lt" ? "lt-LT" : "en-US");

export function organizationJsonLd(): JsonLdNode {
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Naudokis",
    url: SITE_URL,
    logo: `${SITE_URL}/naudokis/naudokis-logo.png`,
    // Languages the brand operates in (correct Organization property; `inLanguage`
    // belongs on CreativeWork/WebSite, not Organization).
    knowsLanguage: ["lt", "en"],
    areaServed: { "@type": "Country", name: "Lithuania" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE,
      availableLanguage: ["lt", "en"],
    },
  };
  // Only emit sameAs once real brand profiles exist (see SOCIAL_LINKS) — wrong or
  // placeholder URLs would undermine entity reconciliation rather than help it.
  if (SOCIAL_LINKS.length > 0) {
    node.sameAs = SOCIAL_LINKS;
  }
  return node;
}

// The Naudokis mobile app as a SoftwareApplication — the core thing this bridge
// site promotes. Free to download (App-Store/Google-Play Offer at price 0), with
// the two store listings as `sameAs`. No `aggregateRating` is emitted: we don't
// have first-party store-rating data on the wire, and fabricating it is a policy
// violation (see the no-fabricated-structured-data convention).
export function softwareApplicationJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Naudokis",
    operatingSystem: "iOS, Android",
    applicationCategory: "LifestyleApplication",
    url: SITE_URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    sameAs: [APP_STORE_URL, PLAY_STORE_URL],
  };
}

// Homepage FAQ section → FAQPage structured data. Sourced from the same dictionary
// entries the visible accordion renders, so copy never diverges. Note: since 2023
// Google shows FAQ rich results only for authoritative (gov/health) sites — this
// still aids content understanding, just don't expect FAQ snippets in SERPs.
export function faqJsonLd(items: readonly FaqItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function webSiteJsonLd(locale: Locale): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Naudokis.lt",
    url: absoluteUrl(locale, ""),
    inLanguage: inLanguage(locale),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(locale, "/skelbimai")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

// Listings → an ItemList of links to each detail page (category/search/city pages).
export function itemListJsonLd(locale: Locale, items: { id: string; name: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(locale, `/skelbimai/${item.id}`),
    })),
  };
}

// A rental listing as a Product with a per-day Offer (UnitPriceSpecification
// keeps the daily rate honest — schema.org Offer has no native rental unit).
export function listingJsonLd({
  locale, id, name, description, image, priceCents, ratingAverage, ratingCount, itemCondition,
}: {
  locale: Locale;
  id: string;
  name: string;
  description: string;
  image?: string;
  priceCents: number;
  ratingAverage: number | null;
  ratingCount: number;
  itemCondition?: string;
}): JsonLdNode {
  const price = (priceCents / 100).toFixed(2);
  const url = absoluteUrl(locale, `/skelbimai/${id}`);
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "EUR",
        unitText: locale === "lt" ? "para" : "day",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
      },
    },
  };
  if (image) {
    node.image = image;
  }
  if (itemCondition) {
    node.itemCondition = itemCondition;
  }
  if (ratingAverage != null && ratingCount > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingAverage.toFixed(1),
      reviewCount: ratingCount,
    };
  }
  return node;
}
