// Per-page metadata builder — mirrors the root layout's SEO shape (canonical +
// hreflang alternates + OG/Twitter), so new pages stay consistent and sourced
// from one place. Lithuanian is unprefixed at "/"; English lives at "/en".
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, locales, localePath, localePrefix, type Locale } from "@/app/lib/i18n/config";
import { CONTACT_EMAIL, CONTACT_PHONE, SITE_ORIGIN, SOCIAL_LINKS, APP_STORE_URL, PLAY_STORE_URL, LEGAL_NAME, COMPANY_CODE } from "@/app/lib/contact";
import type { FaqItem } from "@/app/lib/i18n/types";
import { LT_CITIES, type City } from "@/app/lib/cities";
import type { Category } from "@/app/lib/categories";
import { listingLandingPath } from "@/app/lib/landing-routes";
import { listingDetailPath } from "@/app/lib/listing-url";

export {
  categorySlugForId,
  cityFromSlug,
  citySlugFor,
  listingFilterPath,
  listingLandingPath,
  resolveCategorySlug,
  resolveSubcategorySlug,
  subcategorySlugForId,
} from "@/app/lib/landing-routes";
export type { ListingLandingFilters, SlugMatch, SlugResolution } from "@/app/lib/landing-routes";

// Canonical production origin, for absolute URLs in the metadata builders here and
// in the sitemap/robots routes. Defined in contact.ts (which client components can
// import without dragging this whole module graph into the bundle) and re-exported
// under the name the SEO code has always used.
export const SITE_URL = SITE_ORIGIN;

// `robots` value for pages we want crawled-through but kept out of the index —
// empty category/city landings, a missing listing, LT-content served under /en.
// `follow` so link equity still flows; `index:false` so the thin/duplicate URL
// never ranks. Shared so every noindex site stays in lockstep.
export const NOINDEX_FOLLOW: Metadata["robots"] = { index: false, follow: true };

// A category/city landing is worth indexing once it has real inventory behind it,
// and the bar is a single listing: one genuine result is still a useful landing,
// and at current inventory we favour letting every stocked category be discovered
// over withholding it for a larger choice set. The floor stays at 1, never 0 — an
// empty landing has nothing to rank for and reads as thin/doorway content, so a
// zero-listing page keeps its noindex,follow (crawlable through to listings, out
// of the index).
export const MIN_INDEXABLE_LISTINGS = 1;

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

// `path` is the bare INTERNAL route, e.g. "/skelbimai" ("" for home). Segments are
// spelled per locale in the public URL ("/en/listings"), which is why these go
// through `localePath` rather than concatenating a prefix — see i18n/routes.ts.
export function ltPath(path: string) {
  return localePath(defaultLocale, path);
}
export function canonicalFor(locale: Locale, path: string) {
  return localePath(locale, path);
}

// The per-locale WebSite node's stable @id, referenced by every isPartOf. One
// definition: three hand-rolled spellings of this (two of them with a hardcoded
// lt/en ternary) would silently disagree the moment a third locale is added.
export function webSiteId(locale: Locale) {
  return `${SITE_URL}${localePrefix(locale)}/#website`;
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
    path: listingLandingPath({
      category: category?.parentId ?? category?.id,
      subcategory: category?.parentId ? category.id : undefined,
      city,
    }),
  };
}

// Search-engine ownership proof, read from the environment so no verification
// token is ever committed. Returns undefined when nothing is configured, which
// keeps the tag out of the document entirely — an unconfigured build renders
// byte-identical HTML. Server-only vars (not NEXT_PUBLIC_): these are read
// during metadata generation, so there is no reason to inline them into the
// client bundle.
export function verificationMeta(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  if (!google && !bing) {
    return undefined;
  }
  const verification: NonNullable<Metadata["verification"]> = {};
  if (google) {
    verification.google = google;
  }
  if (bing) {
    verification.other = { "msvalidate.01": bing };
  }
  return verification;
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
    alternateLocale: locale === "lt" ? ["en_GB"] : ["lt_LT"],
    url: `${SITE_URL}${canonical}`,
    title,
    description,
  };
  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title,
    description,
  };
  // A per-page image (e.g. a listing photo) overrides the explicit localized
  // social-card endpoint.
  if (image) {
    openGraph.images = [{ url: image, alt: ogImageAlt }];
    twitter.images = [image];
  } else {
    const generatedImage = `${SITE_URL}${canonicalFor(locale, "/social-card")}`;
    openGraph.images = [{ url: generatedImage, width: 1200, height: 630, alt: ogImageAlt }];
    twitter.images = [generatedImage];
  }
  // Built by iterating `locales` — each locale's URL is its own localized path, not
  // the Lithuanian one with a prefix bolted on.
  const languages: Record<string, string> = ltOnly
    ? { [defaultLocale]: ltPath(path), "x-default": ltPath(path) }
    : {
        ...Object.fromEntries(locales.map((l) => [l, canonicalFor(l, path)])),
        "x-default": ltPath(path),
      };
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: "Naudokis",
    // Keep the duplicate LT-content-under-/en URL out of the index.
    robots: ltOnly && locale !== defaultLocale ? NOINDEX_FOLLOW : undefined,
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

const inLanguage = (locale: Locale) => (locale === "lt" ? "lt-LT" : "en-LT");

export function organizationJsonLd(): JsonLdNode {
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Naudokis",
    // Same constants the footer renders — see LEGAL_NAME in contact.ts.
    legalName: LEGAL_NAME,
    identifier: COMPANY_CODE,
    url: SITE_URL,
    logo: `${SITE_URL}/naudokis/naudokis-logo.png`,
    // Languages the brand operates in (correct Organization property; `inLanguage`
    // belongs on CreativeWork/WebSite, not Organization).
    knowsLanguage: ["lt", "en"],
    areaServed: { "@type": "Country", name: "Lithuania" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Numėjos g. 6",
      postalCode: "LT-08402",
      addressLocality: "Vilnius",
      addressCountry: "LT",
    },
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
    "@id": `${SITE_URL}/#app`,
    name: "Naudokis",
    operatingSystem: "iOS, Android",
    applicationCategory: "LifestyleApplication",
    url: SITE_URL,
    installUrl: `${SITE_URL}/go`,
    downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
    provider: { "@id": `${SITE_URL}/#organization` },
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
    "@id": webSiteId(locale),
    name: "Naudokis.lt",
    url: absoluteUrl(locale, ""),
    inLanguage: inLanguage(locale),
    publisher: { "@id": `${SITE_URL}/#organization` },
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

// A category landing as a CollectionPage — name/description come from the
// taxonomy's authored SEO copy (seo_title / meta_description), so the structured
// data matches the visible heading and the <head> snippet.
export function collectionPageJsonLd({
  locale, name, description, path,
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(locale, path),
    inLanguage: inLanguage(locale),
    isPartOf: { "@id": webSiteId(locale) },
  };
}

// The all-categories page as a CollectionPage whose mainEntity is an ItemList of
// the category landings (name + canonical landing URL — both come from the
// taxonomy, so nothing is fabricated). Aids entity understanding / sitelinks.
export function categoriesCollectionJsonLd({
  locale, name, description, path, items,
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(locale, path),
    inLanguage: inLanguage(locale),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: absoluteUrl(locale, item.path),
      })),
    },
  };
}

// Listings → an ItemList of links to each detail page (category/search/city pages).
export function itemListJsonLd(locale: Locale, items: { id: string; name: string; city?: string }[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(locale, listingDetailPath({ id: item.id, title: item.name, city: item.city })),
    })),
  };
}

// A rental listing as a Product with a per-day Offer (UnitPriceSpecification
// keeps the daily rate honest — schema.org Offer has no native rental unit).
export function listingJsonLd({
  locale, id, path, name, description, image, priceCents, ratingAverage, ratingCount,
  itemCondition, category, sellerName, sellerIsBusiness,
}: {
  locale: Locale;
  id: string;
  path?: string;
  name: string;
  description: string;
  image?: string;
  priceCents: number;
  ratingAverage: number | null;
  ratingCount: number;
  itemCondition?: string;
  category?: string;
  sellerName?: string;
  sellerIsBusiness?: boolean;
}): JsonLdNode {
  const price = (priceCents / 100).toFixed(2);
  const url = absoluteUrl(locale, path ?? `/skelbimai/${id}`);
  const offers: JsonLdNode = {
    "@type": "Offer",
    "@id": `${url}#rental-offer`,
    // Offer defaults to Sell when businessFunction is omitted. This listing is
    // a lease-out offer; it must never be represented as a product sale.
    businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    price,
    priceCurrency: "EUR",
    url,
    // Still no `availability` — but no longer because we cannot see the calendar.
    //
    // This site CAN now read a listing's booked days (GET /listings/{id}/availability;
    // see app/lib/availability.ts, which backs the date picker). The reason to stay
    // silent here is different, and stronger: schema.org's Offer.availability is a
    // DATE-INDEPENDENT claim ("InStock"), while a rental's availability is a fact
    // about particular days. This page is ISR-cached (revalidate 300) and crawler-
    // cached far longer, so a baked "InStock" would keep asserting the item is free
    // to rent long after it was booked out — something we would be publishing, not
    // observing. There is no rental-calendar vocabulary here that consumers act on,
    // so there is nothing truthful to emit.
    //
    // This is also why the visible calendar is client-only and no-store: availability
    // is the one fact on this page that must never be frozen into a cached document.
    // The JSON-LD is server-rendered and the calendar is not, so the two cannot drift.
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "EUR",
      unitText: locale === "lt" ? "para" : "day",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
    },
  };
  // Seller requires a schema.org @type, and Organization vs Person is a factual
  // claim about the owner. Emit it ONLY when the wire states is_business —
  // defaulting an unknown flag to Person would publish "this is a private
  // individual" as structured data on every business listing that didn't set it.
  if (sellerName && sellerIsBusiness !== undefined) {
    offers.seller = {
      "@type": sellerIsBusiness ? "Organization" : "Person",
      name: sellerName,
    };
  }
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#rental-item`,
    sku: id,
    name,
    description,
    url,
    inLanguage: inLanguage(locale),
    isPartOf: { "@id": webSiteId(locale) },
    offers,
  };
  if (image) {
    node.image = image;
  }
  if (itemCondition) {
    node.itemCondition = itemCondition;
  }
  if (category) {
    node.category = category;
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
