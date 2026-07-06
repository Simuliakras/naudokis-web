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
// A footer category link: localized display `label` + stable backend category id.
export type FooterCategory = { label: string; categoryId: string };
// Homepage social-proof band: honest, non-attributed use-case cards (icon disk +
// scenario title + supporting line). Deliberately NOT framed as named, star-rated
// customer reviews — see the testimonials reframe note in the design audit.
export type UseCaseItem = { icon: IconName; title: string; body: string; tone: HtwTone; cta?: "owner" };

// Legal Policy Center — UI chrome strings only. The document content itself
// comes from app/lib/legal/data/*.json, not the dictionaries.
export type LegalDict = {
  // doc-page chrome
  brandSub: string;        // header eyebrow label above the document title
  inThisDoc: string;       // sidebar TOC heading
  contents: string;        // drawer heading
  closeContents: string;   // drawer close-button aria-label
  backTop: string;         // back-to-top aria/title
  openMenu: string;        // mobile FAB label
  readingProgress: string; // progress-bar aria
  effective: string;
  updated: string;
  onlyLt: string;          // LT-only fallback notice
  briefLabel: string;      // callout label ("Trumpai" / "In brief")
  warnLabel: string;       // warning-callout label ("Svarbu" / "Important")
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
    getAppShort: string; // compact install CTA in the ≤1120px sticky bar
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
    ownerPrompt: string;
    ownerCta: string;
    phoneAlt: string;
    qrCaption: string; // one-liner on the white QR card ("Scan to get the app")
  };
  search: {
    placeholder: string;
    inputLabel: string; // accessible name for the hero search <input>
    where: string;
    suggestionsLabel: string; // aria-label for the focus-opened suggestion panel
    suggestCategories: string; // suggestion-panel section heading (real backend categories)
    suggestCities: string; // suggestion-panel section heading (picker cities)
    labelWhat: string; // micro-label above the hero search field (mobile) — noun, the question lives in the placeholder
    labelWhere: string; // micro-label above the hero city field (mobile)
    submit: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    all: string;
    // Generic page-intro fallback for a category landing when the backend has no
    // authored seo/meta description yet (e.g. a brand-new, un-seeded node). The
    // category `id` lets LT build the grammatically-correct genitive phrase
    // instead of interpolating the nominative name; EN ignores it.
    seoFallbackBody: (name: string, id?: string) => string;
    // Brand-suffixed <title> fallback for the same un-authored case — keeps the
    // site's "… | Naudokis.lt" convention out of the data layer.
    metaTitleFallback: (name: string, id?: string) => string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
    // Section-level empty band on the home page (S1 — no data, not a search).
    // The productive app CTA leads; retrying an empty catalog is the secondary.
    bandEmptyTitle: string;
    bandEmptyBody: string;
    bandEmptyAppCta: string; // primary — opens the app-redirect modal
    bandEmptyRetry: string; // secondary — refetches the categories query
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
  featuresHead: { eyebrow: string; title: string }; // section header over the trust-features band
  // Homepage 3-step model explainer (browse here → get the app → reserve in app)
  // — pre-empts "why can't I book here?" without opening the HIW page.
  homeSteps: {
    eyebrow: string;
    title: string;
    steps: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
  };
  // Homepage owner/supply band — truthful benefit bullets only (Stripe payouts,
  // deposit + disputes, upfront fees); never earnings figures.
  ownerBand: {
    eyebrow: string;
    title: string;
    bullets: [string, string, string];
    cta: string; // deep link into the owner journey (/kaip-tai-veikia?role=owner)
  };
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
    browseCta: string; // mid-funnel exit into the live inventory ("Browse items")
    ctaQrHint: string; // caption under the CTA-banner QR ("Scan with your phone")
    faqEyebrow: string;
    faqTitle: string;
    faq: FaqItem[]; // renter-slanted questions (shown for the renter role)
    faqOwner: FaqItem[]; // owner-side questions (payouts, fees, damage) for the owner role
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
    ownerCtaLabel: string; // foot link on the earn-framed card → owner journey
    goToSlide: (index: number) => string; // aria-label for carousel dot (0-based index)
  };
  cta: {
    title: string;
    body: string;
    phoneAlt: string;
  };
  faq: {
    eyebrow: string; // section eyebrow — the FAQ joins the sitewide header anatomy
    heading: string;
    subheading: string;
    items: FaqItem[];
  };
  footer: {
    tagline: string;
    browseHeading: string;
    allCategories: string;
    categories: FooterCategory[]; // curated category links (label + stable LT search query)
    citiesHeading: string; // city-landing links column ("Miestai" / "Cities")
    helpHeading: string;
    help: FooterLink[]; // FAQ anchor, contacts anchor, privacy, terms
    copyright: string;
    secure: string; // caption framing the payment marks ("Payments by Stripe") — bare card logos read as clutter
    socialLabel: string; // aria-label for the social-links group
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
    descOriginalNote: string; // shown on non-LT pages — owner text stays in its original language
    descMore: string; // expands the phone-width description clamp
    descLess: string;
    specsHeading: string;
    handoverHeading: string;
    mapTitle: (city: string) => string;
    pickupLabel: string;
    pickupFree: string;
    deliveryLabel: string;
    deliveryByArrangement: string;
    deliveryRadius: (km: number) => string; // "Iki N km" (the "Pristatymas" label carries the noun)
    termsHeading: string;
    reviewsHeading: string;
    reviewsEmptyTitle: string;
    reviewsEmptyBody: string;
    reviewsInApp: (count: number) => string;
    similarHeading: string; // "Similar items" cross-sell rail at the page foot
    moreItemsHeading: string; // honest rail heading when only a single sibling exists
    perDay: string;
    depositReturnable: string;
    reserve: string;
    reserveMobile: string;
    escrowNote: string;
    protectedPayments: string; // heading for the payment-protection trust strip under the reserve CTA
    loadErrorTitle: string;
    loadErrorBody: string;
    goneTitle: string; // deleted/removed listing — client soft-404 (SPA / stale) message
    goneBody: string;
    backToListings: string;
    // header actions + meta
    save: string; // "Įsiminti" header action
    newListingPill: string; // gallery "Naujas skelbimas" badge
    noPhotos: string; // caption on the empty-gallery placeholder (no photos on the wire)
    galleryAll: (count: number) => string; // "Visos N nuotr."
    galleryExpand: string; // aria-label on the single-photo hero expand chip
    galleryViewLabel: string; // lightbox dialog aria-label
    galleryClose: string; // lightbox close-button aria-label
    galleryPrev: string; // lightbox previous-photo aria-label
    galleryNext: string; // lightbox next-photo aria-label
    galleryImageError: string; // shown when a lightbox photo fails to load
    perDayShort: string; // "/ para"
    // booking panel
    chooseDates: string; // single booking-panel date affordance label
    serviceFee: string;
    serviceFeeHint: string; // single merged footnote — dates picked + fees/deposit shown in the app before confirming
    serviceFeeFree: string; // fee-row value — "Programėlėje" (shown in the app), never a fake "free"
    inAppValue: string;
    totalToday: string;
    feePolicyLabel: string; // quiet link into the terms' payments/fees section
    feePolicyHref: string; // locale-correct terms path + section anchor
    cancellationNote: (tier: string) => string; // cancellation tier line (links to the terms section)
    cancellationHref: string; // locale-correct terms path + cancellations section anchor
    // host card
    hostStatRating: string;
    hostStatReviews: string;
    hostStatListings: string;
    hostMessage: string; // "Rašyti savininkui"
    hostVerifiedNote: string;
    hostMemberSince: (year: number) => string; // tenure line, only when member_since is on the wire
    hostResponseTime: (hours: number) => string; // response line, only when avg_response_time is on the wire
    ownerMoreHeading: string; // "more from this owner" mini-rail heading
    reportListing: string; // quiet mailto report affordance
    reportSubject: (title: string, id: string) => string; // prefilled report e-mail subject
    // delivery block — copy must match the options the listing actually offers
    deliverySub: (city: string, opts: { pickup: boolean; delivery: boolean }) => string;
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
    termInsuranceTitle: string; // insurance fact tile — only when the wire attribute says included
    termInsuranceSub: string;
    mobileBookingNote: string;
  };
  common: {
    favorite: string; // aria-label on the heart button
    delivery: string; // short card badge surfacing the delivery-available flag
    perDay: string; // price unit on cards
    reviewCount: (count: number) => string; // localized, pluralized review count
    // Card badge for listings with no reviews yet. Deliberately compact ("Naujas"),
    // NOT detail.newListingPill's longer phrase: the badge + city must share one
    // meta-row line at 4-up card widths (~250px), and the long form wraps it.
    newListing: string;
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
    searchLabel: string;
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
    // Suffix-free variant of `landingTitle` for the visible <h1> and the
    // CollectionPage JSON-LD `name`. `landingTitle` keeps the " | Naudokis.lt"
    // <title> suffix, which must never render inside a heading.
    landingHeading: (parts: { category?: string; city?: string }) => string;
    landingDescription: (parts: { category?: string; city?: string }) => string;
    // City/category-aware supporting block (bottom h2 + prose) for the pSEO
    // landings, so ~100 combo pages don't all share one identical
    // Lithuania-scoped paragraph. The plain feed keeps `seoHeading`/`seoBody`.
    landingSeoHeading: (parts: { category?: string; city?: string }) => string;
    landingSeoBody: (parts: { category?: string; city?: string }) => string;
    crumbCategories: string;
    eyebrow: string; // static page eyebrow above the feed/landing H1 (header-anatomy parity)
    titleAll: string;
    titleSearch: string;
    subtitleAll: string;
    subtitleSearch: (query: string) => string;
    subtitleSearchGeneric: string; // ≤560px search subtitle — the chip row already echoes the query there
    resultCount: (count: number) => string;
    resultCountAtLeast: (count: number) => string; // "N+ …" — true total is unknowable under the client-side delivery filter
    loadMore: string; // "load more results" button
    loadingMore: string; // button label while the next page is loading
    clear: string;
    searchPlaceholder: string;
    searchLabel: string;
    sortLabel: string;
    sortRecommended: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortRatingBest: string;
    categoryLabel: string;
    allCategories: string;
    cityLabel: string;
    priceLabel: string; // client-side price-band filter
    priceAny: string; // the band list's "no price filter" option
    priceBand: (min: number | null, max: number | null) => string; // band option label ("Iki 10 €" / "€10–30" / "Nuo 60 €")
    deliveryToggle: string;
    filtersButton: string; // mobile "Filters" trigger opening the filter sheet
    filtersTitle: string; // filter sheet heading
    // Sheet apply button previews the outcome ("Show 3 results"); null while the
    // count is loading, atLeast for the client-filtered "N+" case.
    filtersApply: (count: number | null, atLeast?: boolean) => string;
    introMore: string; // expands the phone-width landing-intro clamp
    introLess: string;
    relatedLinksLabel: string; // micro-label over the below-grid internal-link chips
    backToTop: string; // floating back-to-top button label
    seoHeading: string;
    seoBody: string;
    // Zero-result empty states, split by reason (mirrors the design's L2/L3/L4).
    empty: {
      searchTitle: (query: string) => string; // L2 — keyword found nothing
      searchBody: string;
      searchAction: string;
      filterTitle: string; // L3 — active filters exclude everything
      filterTitleCity: (city: string) => string; // L3 with a city filter — echoes the city (LT locative)
      filterBody: (delivery: boolean) => string; // only suggests disabling toggles that are actually on
      filterAction: string;
      cityTitle: (city: string) => string; // empty city landing — no filters were set, so no "filters" framing
      cityBody: string;
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
    qrTitle: string; // desktop-modal hero heading over the QR ("scan to continue on your phone")
    installCta: string; // primary install button in the bridge modal (mobile-only — /go resolves a store only on phones)
    keepBrowsing: string; // explicit low-emphasis text dismiss ("keep browsing the site")
    emailSelf: string; // desktop fallback — mailto with the smart-install link prefilled
    emailSelfSubject: string;
    storesAlso: string; // mobile lead-in for the quiet store text links ("Also on:")
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
    reviewsTitle: string; // "See all reviews" → reviews-specific app-redirect modal
    reviewsBody: string;
    favoriteTitle: string;
    favoriteBody: string;
    shareTitle: string;
    shareBody: string;
    listTitle: string;
    listBody: string;
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
    invalidNote: string; // confirmed-invalid/expired code — say so instead of silently ignoring it
    benefits: [string, string, string]; // truthful value bullets (the funnel was bare headline → button)
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
    notFoundBrowse: string; // secondary CTA → listings feed (the body invites browsing)
    errorTitle: string;
    errorBody: string;
    errorAction: string; // retry CTA (calls reset())
  };
  legal: LegalDict;
};
