// The translation contract. Both dictionaries must satisfy `Dict`, so adding a
// string here forces both locales to provide it (compile-time safety).
import type { IconName } from "@/app/components/ui";

export type FaqItem = { q: string; a: string };
export type FeatureItem = { icon: IconName; title: string; body: string };
export type HowItWorksStep = { icon: IconName; title: string; body: string };
export type FooterLink = { label: string; href: string };
export type TestimonialItem = { name: string; role: string; quote: string; avatarTint: string };

export type LegalSubsection = { heading: string; body: string[] };
export type LegalSection = { id: string; heading: string; body: string[]; subsections?: LegalSubsection[] };
export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string; // full label, e.g. "Atnaujinta 2026 m. kovo 1 d."
  intro: string;
  sections: LegalSection[];
};

export type Dict = {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogLocale: string; // e.g. "lt_LT" / "en_US"
    ogImageAlt: string;
  };
  nav: {
    search: string;
    category: string;
    contacts: string;
  };
  hero: {
    badge: string;
    title: string;
    body: string;
    phoneAlt: string;
  };
  search: {
    placeholder: string;
    inputLabel: string; // accessible name for the hero search <input>
    where: string;
    submit: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    all: string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
  };
  offers: {
    eyebrow: string;
    title: string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
  };
  features: [FeatureItem, FeatureItem, FeatureItem];
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: [HowItWorksStep, HowItWorksStep, HowItWorksStep];
  };
  home: {
    seoHeading: string;
    seoBody: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    items: TestimonialItem[];
    goToReview: (index: number) => string; // aria-label for carousel dot (0-based index)
  };
  cta: {
    title: string;
    body: string;
    phoneAlt: string;
  };
  faq: {
    heading: string;
    subheading: string;
    items: FaqItem[];
  };
  footer: {
    links: FooterLink[];
  };
  detail: {
    metaFallbackTitle: string;
    metaFallbackDescription: string;
    metaTitleSuffix: string; // appended to a listing title for the <title>
    share: string; // aria-label on the gallery share/more button
    verifiedOwnerPill: string;
    galleryMore: (count: number) => string;
    descHeading: string;
    descMore: string;
    descLess: string;
    specsHeading: string;
    ownerHeading: string;
    ownerVerified: string;
    ownerNewMember: string;
    ownerRentals: (count: number) => string;
    contact: string;
    handoverHeading: string;
    pickupLabel: string;
    pickupFree: string;
    deliveryLabel: string;
    deliveryByArrangement: string;
    termsHeading: string;
    priceLabel: string;
    depositLabel: string;
    refundLabel: string;
    refundValue: string;
    durationLabel: string;
    durationValue: string;
    reviewsHeading: string;
    reviewsEmptyTitle: string;
    reviewsEmptyBody: string;
    perDay: string;
    depositReturnable: string;
    reserve: string;
    reserveMobile: string;
    escrowNote: string;
    loadErrorTitle: string;
    loadErrorBody: string;
    backToListings: string;
  };
  common: {
    favorite: string; // aria-label on the heart button
    perDay: string; // price unit on cards
    reviewCount: (count: number) => string; // localized, pluralized review count
    sampleCity: string; // sample listing city
    samplePrice: string; // sample listing price
    breadcrumbHome: string; // breadcrumb root label
    breadcrumbLabel: string; // accessible name for the breadcrumb <nav> landmark
  };
  categoriesPage: {
    metaTitle: string;
    metaDescription: string;
    crumb: string; // active breadcrumb label
    eyebrow: string;
    title: string;
    body: string;
    searchPlaceholder: string;
    submit: string;
    tileCount: (count: number) => string; // localized "X skelbimų"
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
    seoHeading: string;
    seoBody: string;
  };
  feed: {
    metaTitle: string;
    metaDescription: string;
    crumbCategories: string;
    titleAll: string;
    titleSearch: string;
    subtitleAll: string;
    subtitleSearch: (query: string) => string;
    resultCount: (count: number) => string;
    clear: string;
    searchPlaceholder: string;
    sortLabel: string;
    sortRecommended: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortRatingBest: string;
    categoryLabel: string;
    allCategories: string;
    cityLabel: string;
    deliveryToggle: string;
    relatedHeading: string;
    relatedTags: string[];
    seoHeading: string;
    seoBody: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyAction: string;
    interruptTitle: string;
    interruptBody: string;
    interruptCta: string;
  };
  // Locked-mode "Bridge": transactional actions open the app-redirect modal.
  bridge: {
    defaultTitle: string;
    defaultBody: string;
    qrHint: string;
    close: string;
    reserveTitle: string;
    reserveBody: string;
    contactTitle: string;
    contactBody: string;
    favoriteTitle: string;
    favoriteBody: string;
    shareTitle: string;
    shareBody: string;
  };
  appBanner: {
    title: string;
    body: string;
    install: string;
    dismiss: string;
  };
  cityPicker: {
    heading: string; // dropdown header, e.g. "Pasirinkite miestą"
    all: string; // "Visi miestai" / "All cities"
  };
  legal: {
    tocHeading: string;
    crossToTerms: string;
    crossToPrivacy: string;
    privacy: LegalDoc;
    terms: LegalDoc;
  };
};
