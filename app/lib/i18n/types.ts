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
// Homepage "Kaip tai veikia" numbered-stepper band (handoff Option 1a). One step
// = an uppercase kicker word + heading + supporting line. The icon, tone and step
// number are positional design constants held in the component, so the dictionary
// carries strings only.
export type HomeStep = { kicker: string; title: string; body: string };

// Legal Policy Center — UI chrome strings only. The document content itself
// comes from app/lib/legal/data/*.json, not the dictionaries.
export type LegalDict = {
  // doc-page chrome
  brandSub: string;        // header eyebrow label above the document title
  contents: string;        // ONE name for the TOC everywhere: sidebar heading, FAB label, drawer heading
  closeContents: string;   // drawer close-button aria-label
  backTop: string;         // back-to-top aria/title
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
  docDeleteTitle: string;  // sibling-link label → Account & Data Deletion
  hubTitle: string;        // /teisine legal-hub H1
  hubLead: string;         // /teisine lede + meta description
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
  };
  search: {
    placeholder: string;
    inputLabel: string; // accessible name for the hero search <input>
    where: string;
    labelWhat: string; // micro-label above the hero search field (mobile) — noun, the question lives in the placeholder
    labelWhere: string; // micro-label above the hero city field (mobile)
    submit: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    all: string;
    // One-line examples for the v2 tile ("Automobiliai, priekabos, paspirtukai"),
    // keyed by top-level category id like feed.categorySeoLabel — titles come
    // from the backend, but these curated lines are authored copy. Undefined for
    // an unknown id → the card simply omits the line.
    examples: (id: string) => string | undefined;
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
    browseCta: string; // renter mid-funnel exit into the live inventory ("Browse items")
    listCta: string; // owner mid-funnel CTA ("List an item") — listing lives in the app, opens the list-flow bridge modal
    faqEyebrow: string;
    faqTitle: string;
    faqSubheading: string;
    faq: FaqItem[]; // renter-slanted questions (shown for the renter role)
    faqOwner: FaqItem[]; // owner-side questions (payouts, fees, damage) for the owner role
    ctaEyebrow: string;
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
  // Homepage numbered-stepper band. One fixed, role-neutral set of three steps
  // that speaks to both renting and lending; icons/tones/numbers are
  // component-side constants.
  homeSteps: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: [HomeStep, HomeStep, HomeStep];
    ctaLabel: string; // funnel exit into the full /kaip-tai-veikia walkthrough
  };
  cta: {
    eyebrow: string;
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
    categories: FooterCategory[]; // curated category links (label + stable LT search query)
    citiesHeading: string; // city-landing links column ("Miestai" / "Cities")
    // Descriptive anchor text for a city-landing link — reinforces the target
    // page's own keyword ("Nuoma Vilniuje" / "Rentals in Vilnius") instead of a
    // bare city name. LT applies the locative case; EN keeps the nominative.
    cityLink: (city: string) => string;
    helpHeading: string;
    help: FooterLink[]; // FAQ anchor, contacts anchor, privacy, terms
    copyright: string;
    socialLabel: string; // aria-label for the social-links group
  };
  detail: {
    metaFallbackTitle: string;
    metaFallbackTitleForId: (readableId: string) => string;
    metaFallbackDescription: string;
    // SEO <title> / description for a single listing. `city` is the raw city name
    // (LT locative applied inside the dictionary); `category` is the listing's
    // primary category name. Both already include the " | Naudokis.lt" suffix.
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
    reserve: string;
    reserveMobile: string;
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
    perDayShort: string; // "/ diena"
    // booking panel
    confirmInApp: string; // one-line reassurance — dates + final price confirmed in the app
    // host card
    hostStatRating: string;
    hostStatReviews: string;
    hostStatListings: string;
    hostMessage: string; // "Rašyti savininkui"
    hostMemberSince: (label: string) => string; // tenure line; label is a pre-localized "month year"
    hostResponseTime: (hours: number) => string; // response line, only when avg_response_time is on the wire
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
    paginationLabel: string;
    previousPage: string;
    nextPage: string;
    pageStatus: (page: number, totalPages: number) => string;
    pageStatusShort: (page: number) => string;
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
    storesAlso: string; // mobile lead-in for the quiet store text links ("Also on:")
    close: string;
    opensAppHint: string; // affordance hint on locked CTAs ("Opens in the app")
    googlePlayAlt: string; // store-badge image alt / button accessible name
    appStoreAlt: string;
    reserveTitle: string;
    reserveBody: string;
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
  // Account-deletion cancel bridge (/cancel-deletion) — the desktop / no-app path
  // for a GDPR-critical action. The ?token in the URL authorizes a public backend
  // call; the page confirms, then reports success / invalid / already-processed /
  // transient-error honestly (a hard delete is irreversible, so never dead-end).
  cancelDeletion: {
    meta: { title: string; description: string };
    title: string; // confirm-card heading
    body: string; // confirm-card explainer
    confirm: string; // primary action — POSTs the token
    successTitle: string;
    successBody: string;
    successCta: string; // → open the app / home
    invalidTitle: string; // 400 — bad / expired / tampered link
    invalidBody: string;
    alreadyTitle: string; // 409 — already processed or canceled
    alreadyBody: string;
    errorTitle: string; // network / 5xx — retryable
    errorBody: string;
    retry: string;
    correlationLabel: string; // label before the copyable support correlation id
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
