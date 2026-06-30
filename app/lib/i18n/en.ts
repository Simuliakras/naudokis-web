// English dictionary — launch-ready user-facing copy for the localized site.
import type { Dict } from "./types";

export const en: Dict = {
  meta: {
    title: "Naudokis.lt — trusted item rental in Lithuania",
    description:
      "Rent tools, transport, cameras, electronics and leisure gear from people nearby. Browse on the web, then reserve securely in the Naudokis app.",
    ogLocale: "en_US",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Search",
    category: "Categories",
    listings: "Items to rent",
    howItWorks: "How it works",
    getApp: "Get the app",
    language: "Language",
    languageNames: { lt: "Lietuvių", en: "English" },
    primary: "Primary navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    badge: "Trusted item rentals across Lithuania",
    title: "Rent the things you need from people nearby.",
    body: "Find tools, transport, cameras, electronics and leisure gear without buying them. Browse on the web, then reserve, message and pay securely in the Naudokis app.",
    phoneAlt: "Naudokis app",
  },
  search: {
    placeholder: "What do you need to rent?",
    inputLabel: "Search items to rent",
    where: "Where?",
    labelWhat: "What?",
    labelWhere: "City",
    submit: "Search",
  },
  categories: {
    eyebrow: "Browse",
    title: "Popular rental categories",
    all: "All categories",
    seoFallbackBody: (name) =>
      `Rent ${name} from trusted local owners across Lithuania.`,
    metaTitleFallback: (name) => `${name} | Naudokis.lt`,
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
    bandEmptyAction: "Refresh",
    bandEmptySecondary: "Open in the app",
  },
  offers: {
    eyebrow: "Picked for you",
    title: "Popular items to rent nearby",
    all: "All items",
    errorTitle: "We couldn’t load rentals",
    errorSubtitle:
      "We couldn’t show rentals right now. Check your connection and try again.",
    errorAction: "Try again",
    emptyTitle: "No rentals match this search",
    emptySubtitle: (query) =>
      `No rentals matched “${query}”. Try another keyword or city, or clear your search.`,
    emptyAction: "Clear search",
    bandEmptyTitle: "No rentals yet",
    bandEmptyBody:
      "New items are added all the time. Check back later or start with the categories.",
    bandEmptyAction: "All categories",
    bandEmptySecondary: "Open in the app",
  },
  features: [
    {
      icon: "Users",
      title: "People you can trust",
      body: "Profiles, checks and reviews help you choose who to rent from before you reserve.",
    },
    {
      icon: "ShieldCheck",
      title: "Protected in-app payments",
      body: "Your payment is held securely and released to the owner after a successful rental.",
    },
    {
      icon: "MapPin",
      title: "Nearby items, less ownership",
      body: "Get what you need in your city without buying, storing or waiting for things you only use occasionally.",
    },
  ],
  howItWorks: {
    meta: {
      title: "How it works — Naudokis.lt",
      description:
        "See how Naudokis works for renters and owners — from search to return, and from listing to payout.",
    },
    eyebrow: "How it works",
    title: "Rent what you need. Earn from what you own.",
    lead: "Naudokis connects renters who need items for a short time with owners who want unused things to earn. Choose a side and see the full journey.",
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
          body: "Browse rental offers and filter by city, date or price. Browsing is always free.",
        },
        {
          icon: "Calendar",
          title: "Reserve securely in the app",
          tag: "Protected",
          tone: "green",
          screen: "reserve",
          body: "Choose dates and reserve in the app. Payment is held securely until the rental is completed.",
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
          tone: "purple",
          screen: "list",
          body: "Add photos, describe what is included and set your price and deposit.",
        },
        {
          icon: "BadgeCheck",
          title: "Approve the booking",
          tag: "Protected",
          tone: "green",
          screen: "accept",
          body: "Review the request, confirm availability and keep messages in the app.",
        },
        {
          icon: "Handshake",
          title: "Hand over with confidence",
          tag: "Protected",
          tone: "green",
          screen: "handover",
          body: "Meet at the agreed time, check the condition and hand over the item. Deposits and dispute support help protect both sides.",
        },
        {
          icon: "Coins",
          title: "Get paid",
          tag: "Earn",
          tone: "purple",
          screen: "payout",
          body: "After the rental is completed, your payout is sent to you. Commission is shown before you confirm.",
        },
      ],
    },
    trustEyebrow: "Trust on both sides",
    trustTitle: "Built for safer rentals between people",
    trust: [
      {
        icon: "Snowflake",
        title: "Protected payments",
        body: "Rental payments are held securely and released after a successful rental.",
      },
      {
        icon: "Users",
        title: "Profiles, checks and reviews",
        body: "Trust signals help renters and owners make better decisions before they meet.",
      },
      {
        icon: "ShieldCheck",
        title: "Deposits and support",
        body: "Clear rules, refundable deposits and dispute support help protect both sides.",
      },
    ],
    faqEyebrow: "More questions?",
    faqTitle: "Common questions",
    faq: [
      {
        q: "Is browsing free?",
        a: "Yes. Browsing, searching and viewing rental offers is always free. Owners pay commission only after a successful rental.",
      },
      {
        q: "How are payments protected?",
        a: "At reservation, the rental payment is held securely and released to the owner after the rental is completed under the agreed terms.",
      },
      {
        q: "Who is responsible for any damage to an item?",
        a: "A refundable deposit may apply before the rental. If there is a disagreement, the Naudokis team helps collect information and resolve the dispute.",
      },
      {
        q: "Why do I have to reserve in the app?",
        a: "Protected payments, messaging, reservation management and notifications all happen in the app. On the website you can browse and discover freely.",
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
      payoutAmount: "+ €50",
      payoutLabel: "Payout sent",
      completedPill: "Completed",
    },
  },
  // NOTE: reframed from placeholder customer "reviews" to honest, non-attributed
  // use-case cards (no invented names / stars). Copy is illustrative — review with
  // marketing before launch.
  useCases: {
    eyebrow: "Everyday uses",
    title: "Use more. Own less.",
    items: [
      {
        icon: "Camera",
        tone: "purple",
        title: "Gear for a short project",
        body: "Rent a camera, lens or light kit for the weekend instead of buying equipment you rarely use.",
      },
      {
        icon: "Wrench",
        tone: "yellow",
        title: "Tools that can earn",
        body: "Put idle tools to work between projects. Payments, deposits and messages are handled in the app.",
      },
      {
        icon: "Coins",
        tone: "green",
        title: "Rent before you buy",
        body: "Need something once or want to test it first? Find one nearby and avoid a purchase you may not need.",
      },
    ],
    goToSlide: (i) => `Show example ${i + 1}`,
  },
  cta: {
    title: "Get the app to finish your rental",
    body: "Choose dates, message the owner, confirm the deposit, pay securely and manage your rental in one place.",
    phoneAlt: "Naudokis app",
  },
  faq: {
    heading: "Frequently asked questions",
    subheading:
      "Quick answers about prices, reservations, deposits, payments and renting through the app.",
    items: [
      {
        q: "Is browsing free?",
        a: "Yes. Browsing, searching and viewing rental offers is free. Owners pay a commission only after a successful rental.",
      },
      {
        q: "How are payments protected?",
        a: "The rental payment is held securely and released to the owner after the rental is completed under the agreed terms.",
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
        q: "Why do reservations happen in the app?",
        a: "The app keeps dates, messages, payments, deposits, notifications and reviews together in one secure place.",
      },
    ],
  },
  footer: {
    tagline: "Item rental from trusted people across Lithuania.",
    browseHeading: "Browse",
    allCategories: "All categories",
    categories: [
      { label: "Vehicles", q: "transportas" },
      { label: "Photo & video gear", q: "foto" },
      { label: "Tools & construction", q: "įrankiai" },
      { label: "Leisure & sport", q: "sportas" },
      { label: "Home appliances", q: "buitinė technika" },
      { label: "Electronics", q: "elektronika" },
    ],
    helpHeading: "Help",
    help: [
      { label: "Privacy policy", href: "/privatumo-politika" },
      { label: "Terms of use", href: "/naudojimosi-salygos" },
      { label: "Account deletion", href: "/paskyros-trynimas" },
    ],
    copyright: "© 2026 Naudokis.lt. All rights reserved.",
    secure: "Protected payments",
    socialLabel: "Social media",
  },
  detail: {
    metaFallbackTitle: "Item rental — Naudokis.lt",
    metaFallbackTitleForId: (readableId) =>
      `${readableId} rental — Naudokis.lt`,
    metaFallbackDescription:
      "View this item rental on Naudokis.lt and reserve it in the app.",
    seoTitle: ({ title, city }) =>
      `${title} rental${city ? ` in ${city}` : ""} — Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` in ${city}` : " in Lithuania";
      const categoryText = category ? ` ${category.toLowerCase()}` : "";
      return `Rent ${title}${categoryText}${location} on Naudokis.lt. Review the daily price, owner details, handover options and complete your reservation securely in the app.`;
    },
    share: "Share",
    shareCopied: "Link copied",
    verifiedOwnerPill: "Verified owner",
    galleryMore: (n) => `+${n} photos`,
    descHeading: "Description",
    specsHeading: "Specifications",
    ownerHeading: "Item owner",
    ownerVerified: "Verified",
    ownerNewMember: "New owner",
    ownerListings: (n) => `${n} item${n === 1 ? "" : "s"}`,
    contact: "Message owner",
    handoverHeading: "Item handover",
    mapTitle: (city) => `${city} on the map`,
    pickupLabel: "Pickup",
    pickupFree: "Free",
    deliveryLabel: "Delivery",
    deliveryByArrangement: "By arrangement",
    deliveryRadius: (km) => `Delivery up to ${km} km`,
    termsHeading: "Rental terms",
    reviewsHeading: "Reviews",
    similarHeading: "Similar items",
    reviewsEmptyTitle: "No reviews for this item yet",
    reviewsEmptyBody: "Be the first to rent it and help others decide.",
    reviewsInApp: (n) => `All ${n} reviews in the app`,
    perDay: "/ day",
    depositReturnable: "Deposit (refundable)",
    reserve: "Reserve in the app",
    reserveMobile: "Open app",
    appOnlyNote:
      "Choose dates, message the owner, confirm the deposit and pay securely in the app.",
    escrowNote: "Payment is held securely until the rental is complete",
    loadErrorTitle: "We couldn’t load this listing",
    loadErrorBody: "Check your connection and try again.",
    backToListings: "Items to rent",
    save: "Save",
    newListingPill: "New item",
    galleryAll: (n) => `All ${n} photos`,
    galleryViewLabel: "Photo gallery",
    galleryClose: "Close gallery",
    galleryPrev: "Previous photo",
    galleryNext: "Next photo",
    perDayShort: "/ day",
    dateFrom: "From",
    dateTo: "To",
    dateInApp: "Choose in the app",
    chooseDates: "Choose dates",
    pricePerDayLine: "Rental price per day",
    serviceFee: "Renter service fee",
    serviceFeeHint:
      "Renters pay no service fee on Naudokis. You pay the rental price shown by the owner, plus any refundable deposit shown before booking.",
    serviceFeeFree: "No fee",
    inAppValue: "Shown in the app",
    totalToday: "Due today",
    cancellationNote: (tier) => {
      if (tier === "flexible") return "Flexible cancellation";
      if (tier === "moderate") return "Moderate cancellation";
      if (tier === "strict") return "Strict cancellation";
      return "Cancellation per policy";
    },
    hostStatRating: "Rating",
    hostStatReviews: "Reviews",
    hostStatListings: "Items",
    hostStatStatus: "Status",
    hostMessage: "Message owner",
    hostVerifiedNote: "Identity and phone number verified",
    deliverySub: (city) =>
      `Pick up for free or arrange delivery${city ? " in " + city : ""}.`,
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
    mobileBookingNote: "Reservation in the app",
  },
  common: {
    favorite: "Save",
    perDay: "/ day",
    reviewCount: (n) => `${n} review${n === 1 ? "" : "s"}`,
    newListing: "New",
    sampleCity: "Vilnius",
    samplePrice: "€50",
    breadcrumbHome: "Home",
    breadcrumbLabel: "Breadcrumb",
    skipToContent: "Skip to content",
    loading: "Loading…",
  },
  categoriesPage: {
    metaTitle: "Rental categories — Naudokis.lt",
    metaDescription:
      "Browse rental categories on Naudokis.lt, from tools and transport to cameras, electronics, home gear and leisure equipment.",
    crumb: "Categories",
    eyebrow: "Browse",
    title: "All rental categories",
    body: "Choose a category to discover items nearby, compare prices and continue your reservation in the app.",
    searchPlaceholder: "Search categories",
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
    landingDescription: ({ category, city }) => {
      if (category && city) {
        return `Browse ${category.toLowerCase()} rentals in ${city}. Find trusted owners nearby, compare prices and reserve in the Naudokis app.`;
      }
      if (category) {
        return `Find ${category.toLowerCase()} to rent across Lithuania. Filter rentals by city and price, then reserve in the Naudokis app.`;
      }
      return `Browse item rentals in ${city}: tools, vehicles, photo gear, electronics and leisure equipment from trusted owners nearby.`;
    },
    crumbCategories: "Categories",
    titleAll: "Items to rent",
    titleSearch: "Search results",
    subtitleAll: "Browse available rentals across Lithuania.",
    subtitleSearch: (q) => `Results for “${q}” across Lithuania.`,
    resultCount: (n) => `${n} rental${n === 1 ? "" : "s"}`,
    loadMore: "Show more rentals",
    loadingMore: "Loading more…",
    clear: "Clear",
    searchPlaceholder: "Search rentals",
    sortLabel: "Sort",
    sortRecommended: "Recommended",
    sortPriceAsc: "Lowest price",
    sortPriceDesc: "Highest price",
    sortRatingBest: "Best rated",
    categoryLabel: "Category",
    allCategories: "All categories",
    cityLabel: "City",
    deliveryToggle: "Delivery available",
    seoHeading: "Item rental in Lithuania",
    seoBody:
      "Naudokis.lt connects people who need items for a short time with trusted owners across Lithuania. Browse, search and filter rentals by category, city or price right in your browser. Finish the reservation, messaging and protected payment in the Naudokis app.",
    empty: {
      searchTitle: (q) => `No rentals found for “${q}”`,
      searchBody:
        "Try a different keyword, choose another city or clear your search.",
      searchAction: "Clear search",
      filterTitle: "No rentals match these filters",
      filterTitleCity: (city) => `No rentals match these filters in ${city}`,
      filterBody:
        "Try another city, choose a wider category or turn off delivery.",
      filterAction: "Clear filters",
      categoryTitle: "No rentals in this category yet",
      categoryBody:
        "Explore other categories or list an item and be one of the first owners here.",
      categoryActionPrimary: "List an item",
      categoryActionSecondary: "All categories",
    },
    interruptTitle: "Reserve securely in the app",
    interruptBody:
      "Choose dates, message owners, manage deposits and pay securely in one place.",
    interruptCta: "Get the app",
  },
  offline: {
    title: "You’re offline",
    body: "Reconnect to load rentals and continue browsing.",
    retry: "Try again",
  },
  bridge: {
    defaultTitle: "Continue in Naudokis",
    defaultBody:
      "Reservations, messages, payments, deposits and reviews are managed securely in the app.",
    qrHint: "Scan the QR code with your phone to open Naudokis.",
    installCta: "Get the app",
    close: "Close",
    opensAppHint: "Opens in the app",
    googlePlayAlt: "Get it on Google Play",
    appStoreAlt: "Download on the App Store",
    reserveTitle: "Reserve in the app",
    reserveBody:
      "Choose dates, review the final price and complete your reservation securely in the app.",
    datesTitle: "Choose dates in the app",
    datesBody: "Availability and final pricing are shown in Naudokis.",
    contactTitle: "Message the owner in the app",
    contactBody:
      "Keep rental messages and booking details together in Naudokis.",
    favoriteTitle: "Save this item in the app",
    favoriteBody: "Saved items live in your Naudokis account.",
    shareTitle: "Open this item in the app",
    shareBody: "Download Naudokis to open this item on your phone.",
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
    titleGeneric: "Get the Naudokis app.",
    lead: "Naudokis is item rental from trusted people nearby. Get the app to start.",
    rewardExplainer:
      "Your reward is credited to your account once you verify your identity in the app. The friend who invited you is rewarded after your first completed rental.",
    ctaInstall: "Get the app",
    qrHint: "Scan with your phone",
    codeLabel: "Your invite code",
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
    errorTitle: "We couldn’t load this page",
    errorBody:
      "Please try again. If the problem continues, come back a little later.",
    errorAction: "Try again",
  },
  legal: {
    brandSub: "Legal center",
    inThisDoc: "In this document",
    contents: "Contents",
    backTop: "Back to top",
    openMenu: "Sections",
    readingProgress: "Reading progress",
    effective: "Effective",
    updated: "Updated",
    onlyLt:
      "This document is currently published in Lithuanian only. Showing the Lithuanian text.",
    briefLabel: "In brief",
    anchorLabel: "Link to this section",
    relatedHeading: "Related documents",
    docTermsTitle: "Terms of Use",
    docPrivacyTitle: "Privacy Policy",
    questionsTitle: "Questions about this document?",
    questionsBody:
      "Contact us by email if you have questions about this document.",
    contactCta: "Email us",
    metaDescriptionFallback:
      "Read this Naudokis legal document together with the Terms of Use and Privacy Policy.",
  },
};
