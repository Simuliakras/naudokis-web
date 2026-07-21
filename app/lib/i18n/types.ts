// The translation contract. Both dictionaries must satisfy `Dict`, so adding a
// string here forces both locales to provide it (compile-time safety).
import type { IconName } from "@/app/components/ui";
import type { CancellationTier } from "@/app/lib/listing-view";

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
// The app-only screens the backend links to from transactional email. Each one is
// a first-party handoff page here (the web has no login), keyed by its URL segment.
export type HandoffKind =
  | "bookingRequest"
  | "chat"
  | "review"
  | "billingDocuments"
  | "profile"
  | "myProfile"
  | "rewards"
  | "resetPassword"
  | "verifyEmail";

export type FooterLink = { label: string; href: string };
// A footer category link: localized display `label` + stable backend category id.
export type FooterCategory = { label: string; categoryId: string };
// Homepage "Kaip tai veikia" numbered-stepper band (handoff Option 1a). One step
// = an uppercase kicker word + heading + supporting line. The icon, tone and step
// number are positional design constants held in the component, so the dictionary
// carries strings only.
export type HomeStep = { kicker: string; title: string; body: string };

// Legal documents — UI chrome strings only. The document content itself
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
  // Homepage numbered-stepper band. One fixed, role-neutral set of four steps
  // that speaks to both renting and lending; icons/tones/numbers are
  // component-side constants.
  homeSteps: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: [HomeStep, HomeStep, HomeStep, HomeStep];
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
    // Rights notice. Names the LEGAL entity, not the domain: a copyright notice
    // asserts who owns the rights, and "Naudokis.lt" is a brand, not a legal
    // person. Both values are injected — the year from the build (see
    // COPYRIGHT_YEAR in contact.ts) and the name from the same brand constant the
    // Organization JSON-LD publishes — so only the sentence is translated here.
    copyright: (parts: { year: string; legalName: string }) => string;
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
    shareFailed: string;
    verifiedOwnerPill: string;
    galleryMore: (count: number) => string;
    descHeading: string;
    descOriginalNote: string; // shown on non-LT pages — owner text stays in its original language
    descMore: string; // expands the phone-width description clamp
    descLess: string;
    specsHeading: string;
    handoverHeading: string;
    mapTitle: (city: string) => string;
    mapLoad: string;
    mapNotice: string;
    mapPrivacy: string;
    pickupLabel: string;
    pickupFree: string;
    deliveryLabel: string;
    deliveryByArrangement: string;
    deliveryRadius: (km: number) => string; // "Iki N km" (the "Pristatymas" label carries the noun)
    deliveryPerKm: (price: string) => string; // delivery-row badge (omitted when the wire carries no per-km price)
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
    newListingPill: string; // factual gallery badge for a listing with no reviews
    noReviewsYet: string; // header-meta star-slot label when ratingCount is 0 (the booking card just omits its rating link)
    noPhotos: string; // caption on the empty-gallery placeholder (no photos on the wire)
    galleryAll: (count: number) => string; // "Visos N nuotr."
    galleryExpand: string; // aria-label on the single-photo hero expand chip
    galleryViewLabel: string; // lightbox dialog aria-label
    galleryClose: string; // lightbox close-button aria-label
    galleryPrev: string; // lightbox previous-photo aria-label
    galleryNext: string; // lightbox next-photo aria-label
    galleryImageError: string; // shown when a lightbox photo fails to load
    // booking panel
    ratingLinkLabel: (parts: { rating: string; count: number }) => string; // aria-label on the "4,9 · 24" reviews link
    // Empty-state trust rows (no dates picked)
    trustDepositRest: string; // refund condition after the bold amount the component renders first
    reserveNote: string; // under the CTA — nothing is charged until the owner confirms
    // date-range picker
    //
    // Copy rule, and it is not negotiable: this calendar may say a day is TAKEN. It
    // may never say a day is FREE. The availability endpoint tells us what is booked;
    // "not booked" is not the same fact as "available" (the owner may decline, and
    // when the endpoint fails we know nothing at all). So there is a `calBooked`
    // label and deliberately no "available" one — an unbooked day is simply
    // unlabelled and selectable.
    datesFrom: string; // "Nuo"
    datesTo: string; // "Iki"
    datesPlaceholder: string; // empty-field text — "Pasirinkite"
    datesTriggerLabel: string; // trigger aria-label
    datesPanelTitle: string; // sheet heading + popover aria-label
    datesClose: string;
    datesClear: string;
    datesApply: string;
    calPrevMonth: string;
    calNextMonth: string;
    calDays: (n: number) => string; // "3 dienos" — LT plural
    calLimits: (min: number, max: number) => string; // rental-length hint under the grid
    calBooked: string; // legend + the disabled-cell suffix. The ONLY state label.
    calToday: string; // aria suffix for today's cell
    calSelectStart: string; // prompt while no start is picked
    calSelectEnd: string; // prompt while picking the end
    calStartSelected: (date: string) => string; // live-region announcement
    calRangeSelected: (parts: { start: string; end: string; days: string }) => string;
    // Why a day cannot be picked — used both as the cell's aria suffix and as the
    // live-region message when a keyboard user presses Enter on a disabled cell.
    calBlocked: (reason: "past" | "booked" | "tooShort" | "tooLong" | "spansBooked", n: number) => string;
    // Availability could not be read. Not optional chrome: with no "available"
    // affordance, an unknown grid is visually identical to an all-free one, so the
    // banner is the only thing standing between the user and a false impression.
    calUnknownTitle: string;
    calUnknownBody: string;
    calUnknownRetry: string;
    calUnknownNote: string; // short form, shown under the trigger
    calLoading: string;
    // (no rental-estimate breakdown — the booking card states facts only; pricing
    // math is the app's job)
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
    depositTitle: (amount: string) => string;
    termDepositSub: string;
    durationRange: (min: number, max: number) => string; // rental length, e.g. "1–30 dienų"
    termDurationSub: string;
    // Cancellation copy states the ACTUAL per-tier terms, not the tier's name. The
    // thresholds (24 h / 5 d / 1–4 d / 14 d) hard-mirror Terms of Use §9 — if the
    // legal doc changes, every cancellation entry here changes in lockstep (see the
    // Cancellation policy banner in listing-view.ts).
    termCancelLabel: string; // fact-card eyebrow above the rule — "Rezervacijos atšaukimo sąlygos"
    termCancelTitle: (tier: CancellationTier) => string; // fact-card headline: the tier's key rule
    termCancelDetail: (tier: CancellationTier) => string | null; // fact-card line under the rule: the tier's remaining nuance; null when the rule stands alone (flexible)
    trustCancellation: (tier: CancellationTier) => string; // booking-panel trust row one-liner
    // longer-rental discount ladder (Terms section) — subtotal never a total
    discountsLabel: string; // card title, "Nuolaidos ilgesnei nuomai"
    discountFrom: (minDays: number) => string; // per-tier threshold, "Nuo 7 dienų"
    // Tightest per-day unit, for every cramped surface on this page: the tier
    // cells (a 160px box), the fixed mobile bar, the terms fact card and the
    // app-redirect modal's item row. `perDay` above stays the roomy prose form
    // and is used ONLY by the booking panel's price header.
    perDayAbbr: string;
    // The ladder's live hint line. Raw numbers, not preformatted strings: the LT
    // below-hint governs the GENITIVE for the threshold ("nuolaida nuo 3 dienų"),
    // which nominative-only calDays cannot produce — each locale declines internally.
    discountsHintIdle: string; // no dates picked
    discountsHintBelow: (parts: { days: number; minDays: number }) => string;
    discountsHintActive: (parts: { days: number; percent: number }) => string;
    mobileBookingNote: string;
  };
  common: {
    favorite: string; // aria-label on the heart button
    delivery: string; // short card badge surfacing the delivery-available flag
    perDay: string; // price unit on cards
    reviewCount: (count: number) => string; // localized, pluralized review count
    photoCount: (count: number) => string; // SR label on the card's photo-count chip
    // Card deposit badge — states the AMOUNT the renter leaves and nothing more.
    // Never frame it as protection or insurance: the Terms disclaim both. `amount` is
    // a pre-formatted currency string ("50 €" / "€50") from formatPrice, not a number.
    depositAmount: (amount: string) => string;
    // SR-only prefix on the card's owner row — the avatar is decorative, so a bare
    // name between the location and the price needs its role stated.
    ownerLabel: string;
    imageUnavailable: string;
    breadcrumbHome: string; // breadcrumb root label
    breadcrumbLabel: string; // accessible name for the breadcrumb <nav> landmark
    loading: string; // SR-only status announced while a list/page is loading
    backToTop: string; // floating back-to-top button — sitewide, mounted by <Chrome>
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
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
    countLabel: (cats: number, subs: number) => string; // live "N categories · M subcategories" (aria-live)
    subCount: (n: number) => string; // per-card count line under the title
    moreCount: (n: number) => string; // collapsed expander label ("N more…")
    showLess: string; // expanded expander label
    popularHeading: string; // "Popular right now" eyebrow above the pill row
    allListingsLabel: (title: string) => string; // aria-label on the card's arrow link
    gridHeading: string; // sr-only h2 above the directory grid
    // Unaccented search aliases per top-level category id — matched alongside the
    // title and sub names so type-in words like "remontas" reach the category.
    synonyms: (id: string) => string | undefined;
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
    resultCountAtLeast: (count: number) => string; // "N+ …" while the backend cursor has another page
    loadMore: string; // "load more results" button
    loadingMore: string; // button label while the next page is loading
    clear: string;
    searchPlaceholder: string;
    searchLabel: string;
    sortLabel: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortRatingBest: string;
    categoryLabel: string;
    allCategories: string;
    cityLabel: string;
    priceLabel: string;
    priceAny: string; // the slider's "no price filter" state (trigger label when fully open)
    priceBand: (min: number | null, max: number | null) => string; // chip + trigger label ("Iki 10 €" / "€10–30" / "Nuo 60 €")
    // Dual-thumb price slider: the group label, the two thumb/input labels, and the
    // desktop popover's close/apply button.
    priceRangeAria: string;
    priceMinAria: string;
    priceMaxAria: string;
    priceDone: string;
    // Calendar date-range filter (feed). Mirrors the price-filter keys — a control
    // label, an "any" placeholder and an active-range band — plus the calendar grid's
    // own copy (feed-owned; the booking calendar keeps its dict.detail set). The grid's
    // clear button reuses `feed.clear`, and it never shows an Apply button (the sheet
    // owns it) or a booked/loading state (the feed reads no per-listing availability).
    dateLabel: string; // pill label / sheet group heading + aria prefix
    dateAny: string; // pill label when no date filter is set
    dateBand: (from: string, to: string) => string; // chip + active pill label (from===to → single day)
    datePanelTitle: string; // popover + sheet-group aria-label
    datePrevMonth: string;
    dateNextMonth: string;
    dateToday: string; // aria suffix on today's cell
    dateSelectStart: string;
    dateSelectEnd: string;
    dateWindowHint: (max: number) => string; // hint under the grid once a start is picked
    dateDays: (n: number) => string; // "3 dienos" — LT plural
    dateStartSelected: (date: string) => string; // live-region
    dateRangeSelected: (parts: { start: string; end: string; days: string }) => string;
    dateBlocked: (reason: "past" | "booked" | "tooShort" | "tooLong" | "spansBooked", n: number) => string;
    deliveryToggle: string;
    depositToggle: string; // "no deposit" toggle + its chip label
    depositUpTo: (max: number) => string; // chip label for a deep-linked ?deposit=<euros> ceiling
    filtersButton: string; // mobile "Filters" trigger opening the filter sheet
    filtersTitle: string; // filter sheet heading
    // Sheet apply button previews the outcome ("Show 3 results"); null while the
    // count is loading, atLeast while another backend page exists.
    filtersApply: (count: number | null, atLeast?: boolean) => string;
    introMore: string; // expands the phone-width landing-intro clamp
    introLess: string;
    relatedLinksLabel: string; // micro-label over the below-grid internal-link chips
    paginationLabel: string;
    previousPage: string;
    nextPage: string;
    pageStatus: (page: number, totalPages: number) => string;
    pageStatusShort: (page: number) => string;
    // ?page beyond the last page (stale link / shrunken inventory) — an honest
    // dead-end state instead of a filter-blame message + "Page 2 of 1" pager
    pageEmptyTitle: string;
    pageEmptyBody: string;
    pageEmptyAction: string;
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
  };
  // Offline / no-connection empty state (L6) — shared by the feed and categories.
  offline: {
    title: string;
    body: string;
    retry: string;
    timeoutTitle: string;
    timeoutBody: string;
    serverTitle: string;
    serverBody: string;
  };
  // Locked-mode "Bridge": transactional actions open the app-redirect modal.
  bridge: {
    defaultTitle: string;
    defaultBody: string;
    qrHint: string;
    qrTitle: string; // desktop-modal hero heading over the QR ("scan to continue on your phone")
    installCta: string; // primary install button in the bridge modal (mobile-only — /go resolves a store only on phones)
    // Two positions, two strings — one value cannot serve both. `storesAlso` is an
    // inline lead-in immediately before the store links, so it ends in a colon and
    // may be a sentence fragment; `storesDivider` stands alone as a centred rule
    // label, so it has to read as a complete label on its own.
    storesAlso: string; // inline lead-in ("Also on:")
    storesDivider: string; // standalone divider label, no trailing colon ("Also on")
    appOpenFallback: string;
    retryOpen: string;
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
  // Install-attribution consent prompt. Shown only when someone acts on an install
  // CTA with no stored choice. `allow` and `decline` must stay equally plain and
  // equally weighted — no "accept all", no nudge (see components/ConsentSheet.tsx).
  consent: {
    title: string;
    body: string; // names AppsFlyer and says plainly that it's optional
    privacyLink: string;
    allow: string;
    decline: string;
    close: string;
  };
  // Footer "Privacy choices" — permanent access to the same choice, plus withdrawal.
  // scopeNote must keep this scoped to the WEBSITE: the app has its own setting.
  privacyChoices: {
    trigger: string; // footer link label
    title: string;
    body: string;
    statusLabel: string;
    statusAllowed: string;
    statusNotAllowed: string;
    allow: string;
    withdraw: string;
    scopeNote: string;
    privacyLink: string;
    close: string;
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
    // The code is entered in-app after signup. This path always works and never
    // depends on attribution consent — it is the reward's real guarantee, not a
    // degraded fallback, so it is stated plainly rather than hidden.
    codeHint: string;
    codeCopy: string; // copy-to-clipboard action
    codeCopied: string; // confirmation after copying
    codeCopyFailed: string;
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
    alreadyTitle: string; // 409 — already processed or cancelled
    alreadyBody: string;
    errorTitle: string; // network / 5xx — retryable
    errorBody: string;
    retry: string;
    correlationLabel: string; // label before the copyable support correlation id
  };
  // App-handoff landings for the paths the backend puts in transactional emails
  // (/booking-request/…, /chat/…, /review/…, /billing-documents/…, /my-profile,
  // /rewards, /reset-password, /verify-email, /profile/…). These are intent-matched
  // screens, NOT the authenticated resource: the web never fetches the record, so
  // copy must describe the intent without ever implying the id exists.
  handoff: {
    meta: { title: string; description: string };
    kinds: Record<HandoffKind, { title: string; body: string }>;
    openApp: string; // primary — the naudokis:// deep link
    openHint: string; // "nothing happened?" explainer under the primary action
    installLead: string; // lead-in above the store badges
    installCta: string; // generic install (runs the attribution choice)
    qrHint: string;
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
