// The translation contract. Both dictionaries must satisfy `Dict`, so adding a
// string here forces both locales to provide it (compile-time safety).
import type { IconName } from "@/app/components/ui";

export type FaqItem = { q: string; a: string };
export type FeatureItem = { icon: IconName; title: string; body: string };

// "Kaip tai veikia" (How it works) standalone page.
export type HtwTone = "yellow" | "green" | "purple";
export type HtwScreen = "search" | "reserve" | "pickup" | "review" | "list" | "accept" | "handover" | "payout";
export type HtwStep = { icon: IconName; title: string; tag: string; tone: HtwTone; body: string; screen: HtwScreen };
export type HtwRole = {
  label: string; // role-toggle label (e.g. "Nuomininkas" / "Nuomotojas")
  lead: string;
  ctaTitle: string;
  ctaBody: string;
  steps: [HtwStep, HtwStep, HtwStep, HtwStep];
};
export type HtwTrust = { icon: IconName; title: string; body: string };
export type FooterLink = { label: string; href: string };
// A footer category link: localized display `label` + a stable Lithuanian
// search `q` (shared across locales, since listings are predominantly LT).
export type FooterCategory = { label: string; q: string };
export type TestimonialItem = { name: string; role: string; quote: string; avatarTint: string };

// Legal Policy Center — UI chrome strings only. The document content itself
// comes from app/lib/legal/data/*.json, not the dictionaries.
export type LegalDict = {
  // doc-page chrome
  brandSub: string;        // topbar small label
  langSwitchLabel: string; // LT/EN toggle group label + aria
  breadcrumb: string;      // breadcrumb <nav> aria-label
  policyCenter: string;    // hub name / breadcrumb root
  inThisDoc: string;       // sidebar TOC heading
  contents: string;        // drawer heading
  related: string;         // related-docs heading
  backTop: string;         // back-to-top aria/title
  openMenu: string;        // mobile FAB label
  readingProgress: string; // progress-bar aria
  effective: string;
  version: string;
  updated: string;
  onlyLt: string;          // LT-only fallback notice
  briefLabel: string;      // callout label ("Trumpai" / "In brief")
  company: string;         // footer company line
  footHelp: string;
  footWrite: string;
  termsLabel: string;      // footer link label
  privacyLabel: string;    // footer link label
  // hub
  hubEyebrow: string;
  hubTitle: string;
  hubIntro: string;
  hubMetaDescription: string;
  featured: string;        // "Start here"
  read: string;            // "Read"
  docsWord: string;        // "documents"
  contacts: string;
  fullHierarchy: string;   // "Read the full Policy Center document"
  cGeneral: string;
  cPrivacy: string;
  cDsa: string;
  cSafety: string;
  appOrEmail: string;
  ltOnlyBadge: string;     // doc-card badge for LT-only docs
  searchPlaceholder: string;
  searchNoResults: string;
  metaDescriptionFallback: string;
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
    howItWorks: string; // "Kaip tai veikia" link
    getApp: string; // primary "Get the app" button
    language: string; // language-picker trigger label ("Kalba" / "Language")
    languageNames: { lt: string; en: string }; // endonyms shown in the picker
    primary: string; // aria-label for the primary <nav> landmark
    openMenu: string; // aria-label for the mobile burger (closed state)
    closeMenu: string; // aria-label for the mobile burger (open state)
  };
  hero: {
    badge: string;
    title: string;
    body: string;
    phoneAlt: string;
    trust: [string, string, string]; // three product-fact labels under the search bar
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
    // Section-level empty band on the home page (S1 — no data, not a search).
    bandEmptyTitle: string;
    bandEmptyBody: string;
    bandEmptyAction: string;
  };
  offers: {
    eyebrow: string;
    title: string;
    all: string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
    // Section-level empty band on the home page (S2 — no data, not a search).
    bandEmptyTitle: string;
    bandEmptyBody: string;
    bandEmptyAction: string;
  };
  features: [FeatureItem, FeatureItem, FeatureItem];
  // Standalone "Kaip tai veikia" page (/kaip-tai-veikia).
  howItWorks: {
    meta: { title: string; description: string };
    eyebrow: string;
    title: string;
    lead: string;
    renter: HtwRole;
    owner: HtwRole;
    trustEyebrow: string;
    trustTitle: string;
    trust: [HtwTrust, HtwTrust, HtwTrust];
    faqEyebrow: string;
    faqTitle: string;
    faq: FaqItem[];
    ctaPhoneAlt: string;
    // micro-labels rendered inside the synced phone mock-ups
    screen: {
      searchPlaceholder: string;
      reserveCta: string;
      frozenPill: string;
      pickupCta: string;
      reviewCta: string;
      listUpload: string;
      listPrice: string;
      listCta: string;
      acceptCta: string;
      handoverCta: string;
      payoutAmount: string;
      payoutLabel: string;
      completedPill: string;
    };
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
    badge: string;
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
    tagline: string;
    browseHeading: string;
    allCategories: string;
    categories: FooterCategory[]; // curated category links (label + stable LT search query)
    helpHeading: string;
    help: FooterLink[]; // FAQ anchor, contacts anchor, privacy, terms
    copyright: string;
    secure: string; // "Saugūs atsiskaitymai" badge by the payment marks
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
    reviewsShowAll: (count: number) => string;
    perDay: string;
    depositReturnable: string;
    reserve: string;
    reserveMobile: string;
    appOnlyNote: string; // sets expectation before the locked reserve tap
    escrowNote: string;
    loadErrorTitle: string;
    loadErrorBody: string;
    backToListings: string;
    // header actions + meta
    save: string; // "Įsiminti" header action
    newListingPill: string; // gallery "Naujas skelbimas" badge
    galleryAll: (count: number) => string; // "Visos N nuotr."
    galleryViewLabel: string; // lightbox dialog aria-label
    galleryClose: string; // lightbox close-button aria-label
    galleryPrev: string; // lightbox previous-photo aria-label
    galleryNext: string; // lightbox next-photo aria-label
    perDayShort: string; // "/ d."
    // booking panel
    dateFrom: string;
    dateTo: string;
    sampleDateFrom: string;
    sampleDateTo: string;
    lineItem: (price: string, days: number) => string; // "20,00 € × 3 d."
    serviceFee: string;
    serviceFeeHint: string; // tooltip explaining the free service fee
    serviceFeeFree: string; // "Nemokama"
    totalToday: string;
    freeCancellation: string;
    // host card
    hostStatRating: string;
    hostStatReviews: string;
    hostStatResponse: string;
    hostStatMember: string;
    hostResponseTime: string; // "~1 val."
    hostMemberSince: string; // "2024"
    hostMessage: string; // "Rašyti žinutę"
    hostVerifiedNote: string;
    // delivery block
    deliverySub: (city: string) => string;
    deliveryZone: string; // "≈20 km zona"
    // terms fact cards
    depositNoun: string; // "užstatas"
    termRentSub: string;
    termDepositSub: string;
    termDuration: string;
    termDurationSub: string;
    termCancel: string;
    termCancelSub: string;
    depositSafeTitle: string;
    depositSafeBody: string;
  };
  common: {
    favorite: string; // aria-label on the heart button
    perDay: string; // price unit on cards
    reviewCount: (count: number) => string; // localized, pluralized review count
    newListing: string; // card badge for listings with no reviews yet
    sampleCity: string; // sample listing city
    samplePrice: string; // sample listing price
    breadcrumbHome: string; // breadcrumb root label
    breadcrumbLabel: string; // accessible name for the breadcrumb <nav> landmark
    skipToContent: string; // skip-link label (first focusable element on the page)
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
    loadMore: string; // "load more results" button
    loadingMore: string; // button label while the next page is loading
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
    // Zero-result empty states, split by reason (mirrors the design's L2/L3/L4).
    empty: {
      searchTitle: (query: string) => string; // L2 — keyword found nothing
      searchBody: string;
      searchAction: string;
      filterTitle: string; // L3 — active filters exclude everything
      filterTitleCity: (city: string) => string; // L3 with a city filter — echoes the city
      filterBody: string;
      filterAction: string;
      categoryTitle: string; // L4 — valid but empty category
      categoryBody: string;
      categoryActionPrimary: string;
      categoryActionSecondary: string;
    };
    interruptTitle: string;
    interruptBody: string;
    interruptCta: string;
  };
  // Offline / no-connection empty state (L6) — shared by the feed and categories.
  offline: {
    title: string;
    body: string;
    retry: string;
  };
  // Locked-mode "Bridge": transactional actions open the app-redirect modal.
  bridge: {
    defaultTitle: string;
    defaultBody: string;
    qrHint: string;
    close: string;
    opensAppHint: string; // affordance hint on locked CTAs ("Opens in the app")
    googlePlayAlt: string; // store-badge image alt / button accessible name
    appStoreAlt: string;
    reserveTitle: string;
    reserveBody: string;
    datesTitle: string;
    datesBody: string;
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
  // Route-level fallbacks: 404 (not-found.tsx) and the error boundary (error.tsx).
  errors: {
    notFoundTitle: string;
    notFoundBody: string;
    notFoundAction: string; // back-home CTA
    errorTitle: string;
    errorBody: string;
    errorAction: string; // retry CTA (calls reset())
  };
  legal: LegalDict;
};
