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
// Homepage social-proof band: honest, non-attributed use-case cards (icon disk +
// scenario title + supporting line). Deliberately NOT framed as named, star-rated
// customer reviews — see the testimonials reframe note in the design audit.
export type UseCaseItem = { icon: IconName; title: string; body: string; tone: HtwTone };

// Legal Policy Center — UI chrome strings only. The document content itself
// comes from app/lib/legal/data/*.json, not the dictionaries.
export type LegalDict = {
  // doc-page chrome
  brandSub: string;        // header eyebrow label above the document title
  inThisDoc: string;       // sidebar TOC heading
  contents: string;        // drawer heading
  backTop: string;         // back-to-top aria/title
  openMenu: string;        // mobile FAB label
  readingProgress: string; // progress-bar aria
  effective: string;
  updated: string;
  onlyLt: string;          // LT-only fallback notice
  briefLabel: string;      // callout label ("Trumpai" / "In brief")
  anchorLabel: string;     // h2 permalink aria-label ("Link to this section")
  relatedHeading: string;  // "See also" heading at the bottom of a doc
  docTermsTitle: string;   // sibling-link label → Terms of Use
  docPrivacyTitle: string; // sibling-link label → Privacy Policy
  questionsTitle: string;  // contact card heading
  questionsBody: string;   // contact card body
  contactCta: string;      // contact card mailto label
  metaDescriptionFallback: string;
};

export type Dict = {
  meta: {
    title: string;
    description: string;
    ogLocale: string; // e.g. "lt_LT" / "en_US"
    ogImageAlt: string;
  };
  nav: {
    search: string;
    category: string;
    listings: string; // "Items to rent" / "Nuomojami daiktai" link to the feed
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
  };
  search: {
    placeholder: string;
    inputLabel: string; // accessible name for the hero search <input>
    where: string;
    labelWhat: string; // micro-label above the hero search field (mobile)
    labelWhere: string; // micro-label above the hero city field (mobile)
    submit: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    all: string;
    // Generic page-intro fallback for a category landing when the backend has no
    // authored seo/meta description yet (e.g. a brand-new, un-seeded node).
    seoFallbackBody: (name: string) => string;
    // Brand-suffixed <title> fallback for the same un-authored case — keeps the
    // site's "… | Naudokis.lt" convention out of the data layer.
    metaTitleFallback: (name: string) => string;
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
    bandEmptySecondary: string;
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
    bandEmptySecondary: string;
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
  useCases: {
    eyebrow: string;
    title: string;
    items: [UseCaseItem, UseCaseItem, UseCaseItem];
    goToSlide: (index: number) => string; // aria-label for carousel dot (0-based index)
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
    tagline: string;
    browseHeading: string;
    allCategories: string;
    categories: FooterCategory[]; // curated category links (label + stable LT search query)
    helpHeading: string;
    help: FooterLink[]; // FAQ anchor, contacts anchor, privacy, terms
    copyright: string;
    secure: string; // "Protected payments" badge by the payment marks
  };
  detail: {
    metaFallbackTitle: string;
    metaFallbackTitleForId: (readableId: string) => string;
    metaFallbackDescription: string;
    // SEO <title> / description for a single listing. `city` is the raw city name
    // (LT locative applied inside the dictionary); `category` is the listing's
    // primary category name. Both already include the " — Naudokis.lt" suffix.
    seoTitle: (parts: { title: string; city?: string }) => string;
    seoDescription: (parts: { title: string; city?: string; category?: string }) => string;
    share: string; // aria-label on the gallery share/more button
    shareCopied: string;
    verifiedOwnerPill: string;
    galleryMore: (count: number) => string;
    descHeading: string;
    specsHeading: string;
    ownerHeading: string;
    ownerVerified: string;
    ownerNewMember: string;
    ownerListings: (count: number) => string;
    contact: string;
    handoverHeading: string;
    mapTitle: (city: string) => string;
    pickupLabel: string;
    pickupFree: string;
    deliveryLabel: string;
    deliveryByArrangement: string;
    deliveryRadius: (km: number) => string; // "Pristatymas iki N km"
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
    reviewsInApp: (count: number) => string;
    similarHeading: string; // "Similar items" cross-sell rail at the page foot
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
    dateInApp: string;
    chooseDates: string; // single booking-panel date affordance label
    pricePerDayLine: string;
    serviceFee: string;
    serviceFeeHint: string; // tooltip explaining the free service fee
    serviceFeeFree: string; // "Nemokama"
    inAppValue: string;
    totalToday: string;
    cancellationNote: (tier: string) => string; // booking-panel cancellation pill
    // host card
    hostStatRating: string;
    hostStatReviews: string;
    hostStatListings: string;
    hostStatStatus: string;
    hostMessage: string; // "Rašyti žinutę"
    hostVerifiedNote: string;
    // delivery block
    deliverySub: (city: string) => string;
    deliveryZone: string; // "≈20 km zona" fallback when radius unknown
    deliveryZoneKm: (km: number) => string; // "≈N km zona" graphic label
    // terms fact cards
    termRentSub: string;
    depositNone: string; // shown when the listing takes no deposit
    termDepositSub: string;
    durationRange: (min: number, max: number) => string; // rental length, e.g. "1–30 dienų"
    termDurationSub: string;
    cancellationLabel: (tier: string) => string; // policy tier name
    termCancelSub: string;
    mobileBookingNote: string;
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
    loading: string; // SR-only status announced while a list/page is loading
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
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
    foundCount: (count: number) => string; // live "N categories" count (aria-live)
    searchItems: (query: string) => string; // explicit cross-search to the items feed
    seoHeading: string;
    seoBody: string;
  };
  feed: {
    metaTitle: string;
    metaDescription: string;
    // SEO copy for the canonical category / city / category+city landing variants
    // of /skelbimai. `categorySeoLabel` maps a category id to its display label
    // (LT uses a genitive form; EN falls back to the plain title). `landingTitle` /
    // `landingDescription` take that label plus the raw city name and apply any
    // locale grammar (e.g. the LT locative) inside the dictionary.
    categorySeoLabel: (id: string, fallback: string) => string;
    landingTitle: (parts: { category?: string; city?: string }) => string;
    landingDescription: (parts: { category?: string; city?: string }) => string;
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
    installCta: string; // primary install button in the bridge modal (→ /go smart link)
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
  // Referral bridge (/invite) — validates a ?code, shows the reward and routes to
  // the app. Copy must stay honest: the reward lands AFTER the user verifies
  // identity in the app, and the inviter is paid on the new user's first
  // completed rental. No referrer identity is available, so messaging is generic.
  invite: {
    meta: { title: string; description: string };
    eyebrow: string;
    titleValid: (amount: string) => string; // valid code → reward headline
    titleUnknown: string; // network / rate-limited → optimistic, no reward claim
    titleGeneric: string; // invalid / missing code → plain install
    lead: string;
    rewardExplainer: string; // the honest "when do I get it" note
    ctaInstall: string;
    qrHint: string;
    codeLabel: string; // label above the on-page code (manual-entry fallback)
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
