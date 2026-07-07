// English dictionary — launch-ready user-facing copy for the localized site.
// EN style guide: "item" = the physical thing, "listing" = the ad/page,
// "listings" is the one count noun for results, and "reserve" (never "book")
// is the one verb for the conversion action.
import type { Dict } from "./types";

export const en: Dict = {
  meta: {
    title: "Item rental in Lithuania | Naudokis.lt",
    description:
      "Rent tools, vehicles, cameras and more from private or business owners in Lithuania. Compare online, then choose dates and reserve in the Naudokis app.",
    ogLocale: "en_US",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Search",
    category: "Categories",
    listings: "Items to rent",
    howItWorks: "How it works",
    getApp: "Get the app",
    getAppShort: "Get app",
    language: "Language",
    languageNames: { lt: "Lietuvių", en: "English" },
    primary: "Primary navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    badge: "Item rental from people and businesses across Lithuania",
    // DRAFT (marketing sign-off): de-calqued — the LT-mirroring phrasing parsed
    // as an obligation ("you need to rent").
    title: "Rent what you need, from people nearby.",
    // DRAFT (marketing sign-off): tightened — mirrors the LT trim.
    body: "Rent tools, vehicles, cameras or leisure gear only when you need them. Browse online, then complete your booking and payment in the Naudokis app.",
    ownerPrompt: "Have idle items or run a rental business?",
    ownerCta: "List an item and earn",
    phoneAlt: "Item rental listings in the Naudokis app",
  },
  search: {
    // Short enough to never clip at the 320px floor; inputLabel keeps the full name.
    placeholder: "What do you need?",
    inputLabel: "Search items to rent",
    where: "Where?",
    suggestionsLabel: "Search suggestions",
    suggestCategories: "Categories",
    suggestCities: "Cities",
    labelWhat: "Item",
    labelWhere: "City",
    submit: "Search",
  },
  categories: {
    eyebrow: "Browse",
    title: "Popular rental categories",
    all: "All categories",
    seoFallbackBody: (name) =>
      `Browse ${name.toLowerCase()} rentals across Lithuania. Compare prices, locations, owner profiles and continue your booking in the app.`,
    metaTitleFallback: (name) => `${name} rental in Lithuania | Naudokis.lt`,
    errorTitle: "We couldn’t load categories",
    errorSubtitle:
      "We couldn’t show categories right now. Check your connection and try again.",
    errorAction: "Try again",
    emptyTitle: "No categories found",
    emptySubtitle: (query) =>
      `No categories matched “${query}”. Try a broader search or browse all categories.`,
    emptyAction: "Show all categories",
    bandEmptyTitle: "No categories yet",
    bandEmptyBody:
      "Categories will be updated shortly. Refresh the page or check back later.",
    bandEmptyAppCta: "Open in the app",
    bandEmptyRetry: "Refresh",
  },
  offers: {
    // DRAFT (marketing sign-off): recency framing — "picked for you"/"popular"/
    // "nearby" had no personalization, review or geo signal behind them.
    eyebrow: "Browse",
    title: "The latest items to rent",
    all: "All items",
    errorTitle: "We couldn’t load listings",
    errorSubtitle:
      "We couldn’t show rentals right now. Check your connection and try again.",
    errorAction: "Try again",
    emptyTitle: "No listings match this search",
    emptySubtitle: (query) =>
      `No listings matched “${query}”. Try another keyword or city, or clear your search.`,
    emptyAction: "Clear search",
    bandEmptyTitle: "No listings yet",
    bandEmptyBody:
      "New items are added all the time. Check back later or start with the categories.",
    bandEmptyAction: "All categories",
    bandEmptySecondary: "Open in the app",
  },
  features: [
    {
      icon: "Users",
      title: "More context before you book",
      body: "Profile verification badges, reviews from previous rentals and clear terms help you choose.",
    },
    {
      icon: "ShieldCheck",
      title: "Payments processed by Stripe",
      body: "The final rental price, platform fees and any refundable deposit are shown before you confirm payment.",
    },
    {
      icon: "ScrollText",
      title: "Clear rules and support",
      body: "Booking, handover, cancellation, damage and dispute rules are kept in one place for both sides.",
    },
  ],
  // DRAFT (marketing sign-off): section header for the trust band.
  featuresHead: {
    eyebrow: "Why Naudokis",
    title: "Transparent rentals for both sides",
  },
  howItWorks: {
    meta: {
      title: "How item rental and listing work | Naudokis.lt",
      description:
        "Learn how to rent or list an item on Naudokis: search, booking, payment, handover, return and owner payout.",
    },
    eyebrow: "How it works",
    title: "Rent what you need. Earn from what you own.",
    lead: "Naudokis connects people who need an item for a short time with owners ready to rent it out. Choose your role to see the full journey.",
    renter: {
      label: "Renter",
      lead: "From search to return, here is how to rent for a day, a weekend or a project.",
      ctaTitle: "Ready to reserve? Continue in the app",
      ctaBody:
        "Choose dates, message the owner, confirm any deposit and pay securely in one place.",
      steps: [
        {
          icon: "Search",
          title: "Find an item nearby",
          tag: "Fast",
          tone: "yellow",
          screen: "search",
          body: "Browse rental offers and filter by city, category or price. Searching and viewing listings is free.",
        },
        {
          icon: "Calendar",
          title: "Reserve securely in the app",
          tag: "Protected",
          tone: "green",
          screen: "reserve",
          body: "Choose dates, review the final price and deposit, and pay in the app through Stripe.",
        },
        {
          icon: "Handshake",
          title: "Pick up and inspect",
          tag: "Nearby",
          tone: "yellow",
          screen: "pickup",
          body: "Meet at the agreed place, check the item and use it for the booked time.",
        },
        {
          icon: "Star",
          title: "Return and review",
          tag: "Complete",
          tone: "purple",
          screen: "review",
          body: "Return the item, complete the rental and leave a review to help the next renter.",
        },
      ],
    },
    owner: {
      label: "Owner",
      lead: "From listing to payout, here is how to turn idle items into income.",
      ctaTitle: "Ready to rent it out? List your item in the app",
      ctaBody:
        "In the app you can list items, manage requests, message renters and receive payouts in one place.",
      steps: [
        {
          icon: "Camera",
          title: "Create a clear listing",
          tag: "Easy",
          tone: "yellow",
          screen: "list",
          body: "Add photos, describe what is included and set your price and deposit.",
        },
        {
          icon: "BadgeCheck",
          title: "Approve the booking",
          tag: "Approved",
          tone: "green",
          screen: "accept",
          body: "Review the request, confirm availability and keep messages in the app.",
        },
        {
          icon: "Handshake",
          title: "Hand over with confidence",
          tag: "Handed over",
          tone: "yellow",
          screen: "handover",
          body: "Meet at the agreed time, check the condition and hand over the item. Deposits and dispute support help protect both sides.",
        },
        {
          icon: "Coins",
          title: "Get paid",
          tag: "Paid out",
          tone: "purple",
          screen: "payout",
          body: "After the rental is completed and payout conditions are met, your payout is sent. Any platform fees are shown in advance.",
        },
      ],
    },
    trustEyebrow: "Trust on both sides",
    trustTitle: "Clear, protected rentals for people and businesses",
    trust: [
      {
        icon: "CreditCard",
        title: "Payments processed by Stripe",
        body: "The payment amount, platform fees and any refundable deposit are shown before confirmation.",
      },
      {
        icon: "Users",
        title: "Profiles, verification and reviews",
        body: "Visible profile signals and reviews from previous rentals help both sides decide before meeting.",
      },
      {
        icon: "ShieldCheck",
        title: "Deposits and support",
        body: "Clear deposit, damage and evidence rules, plus dispute support, help both sides handle problems.",
      },
    ],
    browseCta: "Browse items",
    faqEyebrow: "More questions?",
    faqTitle: "Common questions",
    faqSubheading:
      "Quick answers about reservations, payments, deposits and renting through the app.",
    faq: [
      {
        q: "Is browsing free?",
        a: "Yes. Searching and viewing listings on the website is free. Any fees and deposit for a specific booking are shown in the app before you confirm.",
      },
      {
        q: "How are payments protected?",
        a: "In-app payments are processed by Stripe. The rental price, applicable fees and refundable deposit are shown before confirmation; payouts follow the conditions in the Terms of Use.",
      },
      {
        q: "Who is responsible for any damage to an item?",
        a: "A refundable deposit may apply, but it is not insurance or a liability cap. If there is a disagreement, both sides submit evidence and Naudokis administers the platform dispute process.",
      },
      {
        q: "Why do I have to reserve in the app?",
        a: "Dates, final amounts, payments, messages, bookings and notifications are managed in the app. On the website you can browse and compare listings.",
      },
    ],
    // DRAFT (marketing/legal sign-off): owner-side FAQ — mirrors the LT set.
    faqOwner: [
      {
        q: "When do I get paid?",
        a: "After the rental is completed and the payout conditions are met, your payout is sent through Stripe. Payouts follow the process set out in the Terms of Use.",
      },
      {
        q: "How much does listing an item cost?",
        a: "Listing an item is free. Any platform fees for a specific booking are shown upfront, before confirmation.",
      },
      {
        q: "What if an item comes back damaged?",
        a: "The refundable deposit and the dispute process help: you submit evidence in the app and Naudokis administers the dispute under the rules.",
      },
      {
        q: "Do I have to accept every request?",
        a: "No — you confirm or decline booking requests in the app, and you can message the renter first.",
      },
    ],
    ctaPhoneAlt: "Naudokis app",
    screen: {
      searchPlaceholder: "What do you need to rent?",
      reserveCta: "Reserve",
      frozenPill: "Held",
      pickupCta: "Meet the owner",
      reviewCta: "Leave a review",
      listUpload: "Add photos",
      listPrice: "€50 / day",
      listCta: "Publish",
      acceptCta: "Confirm booking",
      handoverCta: "Hand over item",
      // multi-day amount (≠ 1× the mock's daily price) + explicit after-fees
      // qualifier, so the illustration can't read as a fee-free gross payout
      payoutAmount: "+ €120",
      payoutLabel: "Payout sent, after fees",
      completedPill: "Completed",
    },
  },
  // Copy is illustrative — review with marketing before launch.
  homeSteps: {
    eyebrow: "How it works",
    title: "It all comes down to three steps",
    lead: "Whether you're renting or lending, you're set up in just a few minutes.",
    toggleAria: "Choose whether you're renting or lending",
    roles: {
      renter: {
        label: "Renting",
        steps: [
          {
            kicker: "Search",
            title: "Discover",
            body: "Search thousands of items nearby and find exactly what you need.",
          },
          {
            kicker: "Secure",
            title: "Reserve",
            body: "Pick your dates and reserve. Payment is held until the rental goes through.",
          },
          {
            kicker: "Ready",
            title: "Use it",
            body: "Pick it up, use it and return it. No commitments, no purchases.",
          },
        ],
      },
      owner: {
        label: "Lending",
        steps: [
          {
            kicker: "Listing",
            title: "List it",
            body: "Photograph your item and list it in minutes. You set the price.",
          },
          {
            kicker: "Request",
            title: "Accept",
            body: "Get a booking and confirm it. The deposit is held safely in the app.",
          },
          {
            kicker: "Payout",
            title: "Earn",
            body: "Hand over the item and get paid. Idle gear starts earning.",
          },
        ],
      },
    },
    ctaLabel: "See the whole process",
  },
  cta: {
    title: "Find it online. Reserve it in the app.",
    body: "Choose dates, review the final price and deposit, message the owner, pay through Stripe and manage the rental in one place.",
    phoneAlt: "Booking screen in the Naudokis app",
  },
  faq: {
    eyebrow: "Questions?",
    heading: "Frequently asked questions",
    subheading:
      "Quick answers about prices, reservations, deposits, payments and renting through the app.",
    items: [
      {
        q: "Is browsing free?",
        a: "Yes. Searching and viewing listings on the website is free. Any fees and deposit for a specific booking are shown in the app before you confirm.",
      },
      {
        q: "How are payments protected?",
        a: "Payments are processed by Stripe. The rental price, applicable platform fees and refundable deposit are shown before confirmation; payouts follow the conditions in the Terms of Use.",
      },
      {
        q: "What can I rent on Naudokis?",
        a: "Popular categories include tools, photo and video gear, transport, electronics, home appliances, event equipment and leisure gear.",
      },
      {
        q: "Can I rent items across Lithuania?",
        a: "Yes. Search, categories and city filters help you find items in Vilnius, Kaunas, Klaipėda and other cities.",
      },
      {
        q: "How do owners set prices?",
        a: "Owners can compare similar rental offers and use recommendations, while staying in control of the final price and deposit.",
      },
      {
        q: "Can private people and businesses list items?",
        a: "Yes. Private and business owners can list items. When an owner acts as a business, that status should be shown in the profile or booking flow, and mandatory consumer rights apply.",
      },
      {
        q: "Why do reservations happen in the app?",
        a: "The app keeps dates, messages, payments, deposits, notifications and reviews together in one secure place.",
      },
    ],
  },
  footer: {
    tagline: "Item rental from private and business owners across Lithuania.",
    // content-descriptive column head (matches LT "Daiktų kategorijos"; "Browse"
    // already labels the home categories eyebrow — one word must not name two nav tiers)
    browseHeading: "Item categories",
    citiesHeading: "Cities",
    cityLink: (city) => `Rentals in ${city}`,
    // Labels match the canonical backend/tile category names (name_en) so the same
    // categoryId reads identically in the footer and the discovery grids.
    categories: [
      { label: "Transport", categoryId: "transport" },
      { label: "Photo & Video", categoryId: "photo_video" },
      { label: "Tools & Construction", categoryId: "tools_construction" },
      { label: "Sports & Leisure", categoryId: "sports_leisure" },
      { label: "Home & Garden", categoryId: "home_garden" },
      { label: "Electronics & Tech", categoryId: "electronics_tech" },
      { label: "Audio, Music & Event Tech", categoryId: "audio_music_events" },
      { label: "Events & Parties", categoryId: "events_parties" },
      { label: "Clothing & Accessories", categoryId: "clothing_accessories" },
      { label: "Kids", categoryId: "kids" },
    ],
    helpHeading: "Help & policies",
    help: [
      { label: "How it works", href: "/kaip-tai-veikia" },
      { label: "Privacy policy", href: "/privatumo-politika" },
      { label: "Terms of use", href: "/naudojimosi-salygos" },
      { label: "Account deletion", href: "/paskyros-trynimas" },
    ],
    copyright: "© 2026 Naudokis.lt. All rights reserved.",
    socialLabel: "Social media",
  },
  detail: {
    metaFallbackTitle: "Item rental | Naudokis.lt",
    metaFallbackTitleForId: (readableId) =>
      `${readableId} rental | Naudokis.lt`,
    metaFallbackDescription:
      "View this item’s rental price, location and terms on Naudokis.lt, then choose dates and confirm the final booking amount in the app.",
    seoTitle: ({ title, city }) =>
      `${title} rental${city ? ` in ${city}` : ""} | Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` in ${city}` : " in Lithuania";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `Rent ${title}${categoryText}${location} on Naudokis.lt. Review the daily price, owner profile and handover options, then choose dates and confirm the final amount in the app.`;
    },
    share: "Share",
    shareCopied: "Link copied",
    verifiedOwnerPill: "Verified identity",
    galleryMore: (n) => `+${n} photo${n === 1 ? "" : "s"}`,
    descHeading: "Description",
    descOriginalNote: "Provided by the owner in their original language.",
    descMore: "Show more",
    descLess: "Show less",
    specsHeading: "Specifications",
    handoverHeading: "Item handover",
    mapTitle: (city) => `${city} on the map`,
    pickupLabel: "Pickup",
    pickupFree: "Free",
    deliveryLabel: "Delivery",
    deliveryByArrangement: "By arrangement",
    deliveryRadius: (km) => `Up to ${km} km`,
    termsHeading: "Rental terms",
    reviewsHeading: "Reviews",
    similarHeading: "Similar items",
    moreItemsHeading: "More items to rent",
    reviewsEmptyTitle: "No reviews for this item yet",
    reviewsEmptyBody: "Be the first to rent it and help others decide.",
    reviewsInApp: (n) => `All ${n} reviews in the app`,
    perDay: "per day",
    reserve: "Reserve in the app",
    reserveMobile: "Reserve",
    loadErrorTitle: "We couldn’t load this listing",
    loadErrorBody: "Check your connection and try again.",
    goneTitle: "This listing is no longer available",
    goneBody:
      "It may have been rented out or removed. Browse other listings instead.",
    backToListings: "Items to rent",
    save: "Save",
    newListingPill: "New listing",
    noPhotos: "No photos",
    galleryAll: (n) => `All ${n} photos`,
    galleryExpand: "Expand photo",
    galleryViewLabel: "Photo gallery",
    galleryClose: "Close gallery",
    galleryPrev: "Previous photo",
    galleryNext: "Next photo",
    galleryImageError: "Couldn’t load this photo",
    perDayShort: "per day",
    confirmInApp: "You’ll confirm dates and the final price in the app.",
    hostStatRating: "Rating",
    hostStatReviews: "Reviews",
    hostStatListings: "Items",
    hostMessage: "Message owner",
    hostMemberSince: (label) => `Member since ${label}`,
    hostResponseTime: (hours) =>
      hours <= 1
        ? "Responds within an hour"
        : `Responds within ~${Math.ceil(hours)} hours`,
    deliverySub: (city, opts) => {
      const where = city ? ` in ${city}` : "";
      if (opts.delivery && !opts.pickup) return `Arrange delivery${where}.`;
      if (!opts.delivery) return `Pick up for free${where}.`;
      return `Pick up for free or arrange delivery${where}.`;
    },
    deliveryZone: "≈20 km zone",
    deliveryZoneKm: (km) => `≈${km} km zone`,
    termRentSub: "Rental price per day",
    depositNone: "No deposit",
    termDepositSub: "Refundable deposit",
    durationRange: (min, max) =>
      !max || max <= min
        ? `From ${min} day${min === 1 ? "" : "s"}`
        : `${min}–${max} days`,
    termDurationSub: "Rental period",
    cancellationLabel: (tier) => {
      if (tier === "flexible") return "Flexible";
      if (tier === "moderate") return "Moderate";
      if (tier === "strict") return "Strict";
      return "Standard";
    },
    termCancelSub: "Cancellation policy",
    termInsuranceTitle: "Insurance included",
    termInsuranceSub: "As listed by the owner",
    mobileBookingNote: "Price — in the app",
  },
  common: {
    favorite: "Save",
    delivery: "Delivery",
    perDay: "per day",
    reviewCount: (n) => `${n} review${n === 1 ? "" : "s"}`,
    newListing: "New",
    breadcrumbHome: "Home",
    breadcrumbLabel: "Breadcrumb",
    skipToContent: "Skip to content",
    loading: "Loading…",
  },
  categoriesPage: {
    metaTitle: "Item rental categories in Lithuania | Naudokis.lt",
    metaDescription:
      "Browse rental categories on Naudokis.lt, from tools and transport to cameras, electronics, home gear and leisure equipment.",
    crumb: "Categories",
    eyebrow: "Browse",
    title: "All rental categories",
    body: "Choose a category to discover items nearby, compare prices and continue your reservation in the app.",
    searchPlaceholder: "Search categories",
    searchLabel: "Search item rental categories",
    submit: "Search",
    emptyTitle: "No categories found",
    emptySubtitle: (query) =>
      `No categories matched “${query}”. Try a broader search.`,
    emptyAction: "Clear",
    foundCount: (n) => `${n} categor${n === 1 ? "y" : "ies"}`,
    searchItems: (query) => `Search items for “${query}”`,
    seoHeading: "Item rental by category",
    seoBody:
      "Naudokis.lt covers everyday rental categories across Lithuania, including tools, transport, photo gear, electronics, home appliances, event equipment and leisure gear. Choose a category to find items nearby without buying things you only need occasionally.",
  },
  feed: {
    metaTitle: "Items to rent in Lithuania | Naudokis.lt",
    metaDescription:
      "Browse items to rent across Lithuania by category, city and price. Find trusted owners nearby and reserve securely in the Naudokis app.",
    // EN uses the plain category title and city name (no grammatical inflection).
    categorySeoLabel: (_id, fallback) => fallback,
    landingTitle: ({ category, city }) => {
      if (category && city)
        return `${category} rental in ${city} | Naudokis.lt`;
      if (category) return `${category} rental | Naudokis.lt`;
      return `Items to rent in ${city} | Naudokis.lt`;
    },
    landingHeading: ({ category, city }) => {
      if (category && city) return `${category} rental in ${city}`;
      if (category) return `${category} rental`;
      return `Items to rent in ${city}`;
    },
    landingDescription: ({ category, city }) => {
      if (category && city) {
        return `Browse ${category.toLowerCase()} rentals in ${city}. Find trusted owners nearby, compare prices and reserve in the Naudokis app.`;
      }
      if (category) {
        return `Find ${category.toLowerCase()} to rent across Lithuania. Filter rentals by city and price, then reserve in the Naudokis app.`;
      }
      return `Browse item rentals in ${city}: tools, vehicles, photo gear, electronics and leisure equipment from trusted owners nearby.`;
    },
    landingSeoHeading: ({ category, city }) => {
      if (category && city) return `${category} rental in ${city}`;
      if (city) return `Item rental in ${city}`;
      if (category) return `${category} rental in Lithuania`;
      return "Item rental in Lithuania";
    },
    landingSeoBody: ({ category, city }) => {
      const where = city ? `in ${city}` : "across Lithuania";
      const what = category ? category.toLowerCase() : "items";
      return `Naudokis.lt connects people and businesses that need ${what} for a short time with trusted private and business owners ${where}. Browse by category, city or price, then manage dates, messages, the final amount and payment in the app.`;
    },
    crumbCategories: "Categories",
    // DRAFT (marketing sign-off): static eyebrow — never duplicates the dynamic H1s.
    eyebrow: "Rentals across Lithuania",
    titleAll: "Items to rent",
    titleSearch: "Search results",
    subtitleAll: "Browse available rentals across Lithuania.",
    subtitleSearch: (q) => `Results for “${q}” across Lithuania.`,
    subtitleSearchGeneric: "Search results across Lithuania.",
    resultCount: (n) => `${n} listing${n === 1 ? "" : "s"}`,
    resultCountAtLeast: (n) => `${n}+ listings`,
    loadMore: "Show more listings",
    loadingMore: "Loading more…",
    clear: "Clear",
    searchPlaceholder: "What do you need to rent?",
    searchLabel: "Search items to rent",
    sortLabel: "Sort",
    sortRecommended: "Recommended",
    sortPriceAsc: "Lowest price",
    sortPriceDesc: "Highest price",
    sortRatingBest: "Best rated",
    categoryLabel: "Category",
    allCategories: "All categories",
    cityLabel: "City",
    priceLabel: "Price",
    priceAny: "Any price",
    priceBand: (min, max) => {
      if (min === null) return `Up to €${max}`;
      if (max === null) return `€${min}+`;
      return `€${min}–${max}`;
    },
    deliveryToggle: "Delivery available",
    filtersButton: "Filters",
    filtersTitle: "Filters",
    filtersApply: (n, atLeast) =>
      n === null
        ? "Show results"
        : `Show ${n}${atLeast ? "+" : ""} result${n === 1 ? "" : "s"}`,
    introMore: "Show more",
    introLess: "Show less",
    relatedLinksLabel: "Popular searches",
    backToTop: "Back to top",
    seoHeading: "Item rental in Lithuania",
    seoBody:
      "Naudokis.lt connects people and businesses that need items for a short time with private and business owners across Lithuania. Browse by category, city or price, then manage dates, messages, the final amount and payment in the app.",
    empty: {
      searchTitle: (q) => `No listings found for “${q}”`,
      searchBody:
        "Try a different keyword, choose another city or clear your search.",
      searchAction: "Clear search",
      filterTitle: "No listings match these filters",
      filterTitleCity: (city) => `No listings match these filters in ${city}`,
      filterBody: (delivery) =>
        delivery
          ? "Try another city, choose a wider category or turn off delivery."
          : "Try another city or choose a wider category.",
      filterAction: "Clear filters",
      cityTitle: (city) => `No listings in ${city} yet`,
      cityBody:
        "Explore other categories or list an item and be one of the first owners here.",
      categoryTitle: "No listings in this category yet",
      categoryBody:
        "Explore other categories or list an item and be one of the first owners here.",
      categoryActionPrimary: "List an item",
      categoryActionSecondary: "All categories",
    },
    interruptTitle: "Reserve securely in the app",
    interruptBody:
      "Choose dates, message owners, review the final amount and pay through Stripe in one place.",
    interruptCta: "Get the app",
  },
  offline: {
    title: "You’re offline",
    body: "Reconnect to load rentals and continue browsing.",
    retry: "Try again",
  },
  bridge: {
    defaultTitle: "Get Naudokis to continue in the app",
    // DRAFT (marketing sign-off): role-neutral — covers both marketplace sides.
    defaultBody:
      "In the app you can rent items nearby — choose dates, see the final price and pay through Stripe — or list your own items and get paid.",
    qrHint: "Scan the QR code with your phone to open Naudokis.",
    qrTitle: "Scan to continue on your phone",
    installCta: "Get the app",
    keepBrowsing: "Keep browsing the site",
    emailSelf: "Email yourself the link",
    emailSelfSubject: "Your Naudokis app link",
    storesAlso: "Also on:",
    close: "Close",
    opensAppHint: "Opens in the app",
    googlePlayAlt: "Get it on Google Play",
    appStoreAlt: "Download on the App Store",
    reserveTitle: "Reserve in the app",
    reserveBody:
      "Choose dates, review the final price, applicable fees and deposit, then confirm your booking in the app.",
    contactTitle: "Message the owner in the app",
    contactBody:
      "Keep rental messages and booking details together in Naudokis.",
    reviewsTitle: "Read all reviews in the app",
    reviewsBody:
      "All verified rental reviews are available in the Naudokis app.",
    favoriteTitle: "Save this item in the app",
    favoriteBody: "Saved items live in your Naudokis account.",
    shareTitle: "Open this item in the app",
    shareBody: "Download Naudokis to open this item on your phone.",
    listTitle: "List your item in the app",
    listBody: "Add photos, describe the item, set the price and deposit, and manage requests in one place.",
  },
  invite: {
    meta: {
      title: "You’ve been invited to Naudokis — get the app",
      description:
        "A friend invited you to try Naudokis — rent items from trusted people nearby. Get the app to start.",
    },
    eyebrow: "Invitation",
    titleValid: (amount) =>
      `You’ve been invited to Naudokis! Get ${amount} on your first rental.`,
    titleUnknown: "You’ve been invited to Naudokis.",
    titleGeneric: "Rent items from people nearby.",
    // DRAFT (marketing sign-off): "nearby" no longer echoes the headline's line.
    lead: "Naudokis is trusted item rental from private and business owners. Get the app to start.",
    rewardExplainer:
      "Your reward is credited to your account once you verify your identity in the app. The friend who invited you is rewarded after your first completed rental.",
    invalidNote:
      "This invite code is no longer valid, but you can use the app as usual.",
    // DRAFT (marketing sign-off): truthful value bullets — already-claimed facts only.
    benefits: [
      "Payments and deposits handled securely through Stripe",
      "Verified owner profiles and reviews",
      "Clear booking, cancellation and dispute rules",
    ],
    ctaInstall: "Get the app",
    qrHint: "Scan with your phone",
    codeLabel: "Your invite code",
  },
  // DRAFT (marketing sign-off): account-deletion cancel bridge copy.
  cancelDeletion: {
    meta: {
      title: "Cancel account deletion — Naudokis",
      description: "Changed your mind? Cancel your account deletion and keep using Naudokis.",
    },
    title: "Keep your account?",
    body: "You asked to delete your Naudokis account. To keep it, confirm below before the grace period ends.",
    confirm: "Cancel deletion",
    successTitle: "Account deletion canceled",
    successBody: "Your account is safe. You can log in again in the app.",
    successCta: "Open the app",
    invalidTitle: "Link not valid",
    invalidBody: "This link is invalid or has expired. Contact us if you need help.",
    alreadyTitle: "Link no longer valid",
    alreadyBody: "This link is no longer valid — the deletion was already processed or canceled.",
    errorTitle: "Couldn’t cancel",
    errorBody: "Something went wrong. Please try again or contact us.",
    retry: "Try again",
    correlationLabel: "Reference ID",
  },
  cityPicker: {
    heading: "Choose a city",
    all: "All cities",
  },
  errors: {
    notFoundTitle: "We couldn’t find that page",
    notFoundBody:
      "The address may be wrong or the page may have moved. Go home or keep browsing rentals.",
    notFoundAction: "Go home",
    notFoundBrowse: "Browse rentals",
    errorTitle: "We couldn’t load this page",
    errorBody:
      "Please try again. If the problem continues, come back a little later.",
    errorAction: "Try again",
  },
  legal: {
    brandSub: "Legal center",
    contents: "Contents",
    closeContents: "Close contents",
    backTop: "Back to top",
    readingProgress: "Reading progress",
    effective: "Effective",
    updated: "Updated",
    onlyLt:
      "This document is currently published in Lithuanian only. Showing the Lithuanian text.",
    briefLabel: "In brief",
    warnLabel: "Important",
    anchorLabel: "Link to this section",
    relatedHeading: "Related documents",
    docTermsTitle: "Terms of Use",
    docPrivacyTitle: "Privacy Policy",
    docDeleteTitle: "Account & Data Deletion",
    hubTitle: "Legal Center",
    hubLead: "All published Naudokis legal documents in one place.",
    questionsTitle: "Questions about this document?",
    questionsBody:
      "Contact us by email if you have questions about this document.",
    contactCta: "Email us",
    metaDescriptionFallback:
      "Read this Naudokis legal document together with the Terms of Use and Privacy Policy.",
  },
};
