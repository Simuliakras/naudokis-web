// English dictionary — launch-ready user-facing copy for the localized site.
import type { Dict } from "./types";

export const en: Dict = {
  meta: {
    title: "Item rental in Lithuania from people and businesses | Naudokis.lt",
    description:
      "Rent tools, vehicles, cameras and more from private or business owners in Lithuania. Compare online, then choose dates and book in the Naudokis app.",
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
    badge: "Item rental from people and businesses across Lithuania",
    title: "Find the item you need to rent nearby.",
    body: "Rent tools, vehicles, cameras, electronics and leisure gear only when you need them. Browse online, then manage dates, messages, the final price and payment in the Naudokis app.",
    ownerPrompt: "Have idle items or run a rental business?",
    ownerCta: "List an item and earn",
    phoneAlt: "Item rental listings in the Naudokis app",
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
      title: "More context before you book",
      body: "Profile verification badges, reviews from previous rentals and clear terms help you choose.",
    },
    {
      icon: "ShieldCheck",
      title: "Payments processed by Stripe",
      body: "The final rental price, platform fees and any refundable deposit are shown before you confirm payment.",
    },
    {
      icon: "MapPin",
      title: "Clear rules and support",
      body: "Booking, handover, cancellation, damage and dispute rules are kept in one place for both sides.",
    },
  ],
  howItWorks: {
    meta: {
      title: "How item rental and listing work | Naudokis.lt",
      description:
        "Learn how to rent or list an item on Naudokis: search, booking, payment, handover, return and owner payout.",
    },
    eyebrow: "How it works",
    title: "Rent what you need. Earn from what you own.",
    lead: "Naudokis connects people and businesses that need an item for a short time with private or business owners ready to rent it out. Choose your role to see the full journey.",
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
          tone: "purple",
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
          tone: "green",
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
    trustTitle: "Clearer rentals for private and business users",
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
    faqEyebrow: "More questions?",
    faqTitle: "Common questions",
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
    title: "Find it online. Book it in the app.",
    body: "Choose dates, review the final price and deposit, message the owner, pay through Stripe and manage the rental in one place.",
    phoneAlt: "Booking screen in the Naudokis app",
  },
  faq: {
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
    browseHeading: "Browse",
    allCategories: "All categories",
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
    metaFallbackTitle: "Item rental — Naudokis.lt",
    metaFallbackTitleForId: (readableId) =>
      `${readableId} rental — Naudokis.lt`,
    metaFallbackDescription:
      "View this item’s rental price, location and terms on Naudokis.lt, then choose dates and confirm the final booking amount in the app.",
    seoTitle: ({ title, city }) =>
      `${title} rental${city ? ` in ${city}` : ""} — Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` in ${city}` : " in Lithuania";
      const categoryText = category ? ` ${category.toLowerCase()}` : "";
      return `Rent ${title}${categoryText}${location} on Naudokis.lt. Review the daily price, owner profile and handover options, then choose dates and confirm the final amount in the app.`;
    },
    share: "Share",
    shareCopied: "Link copied",
    verifiedOwnerPill: "Verified profile",
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
    depositReturnable: "Deposit (refundable)",
    reserve: "Reserve in the app",
    reserveMobile: "Reserve",
    escrowNote: "Naudokis administers payments and refunds through Stripe under the applicable terms",
    protectedPayments: "Protected payments",
    loadErrorTitle: "We couldn’t load this listing",
    loadErrorBody: "Check your connection and try again.",
    goneTitle: "This listing is no longer available",
    goneBody:
      "It may have been rented out or removed. Browse other rentals instead.",
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
    galleryImageError: "Couldn't load this photo",
    perDayShort: "per day",
    chooseDates: "Choose dates",
    serviceFee: "Platform fees",
    serviceFeeHint:
      "You’ll choose dates in the app — any fees, delivery charge and refundable deposit are shown there before you confirm.",
    serviceFeeFree: "In the app",
    inAppValue: "In the app",
    totalToday: "Final amount",
    feePolicyLabel: "Fee policy — in the Terms of Use",
    feePolicyHref: "/naudojimosi-salygos#10-payments-fees-and-stripe",
    cancellationNote: (tier) => {
      if (tier === "flexible") return "Flexible cancellation";
      if (tier === "moderate") return "Moderate cancellation";
      if (tier === "strict") return "Strict cancellation";
      return "Cancellation per policy";
    },
    cancellationHref:
      "/naudojimosi-salygos#12-cancellations-refunds-and-the-right-of-withdrawal",
    hostStatRating: "Rating",
    hostStatReviews: "Reviews",
    hostStatListings: "Items",
    hostMessage: "Message owner",
    hostVerifiedNote: "Naudokis has verified some details on this profile",
    hostMemberSince: (year) => `Member since ${year}`,
    hostResponseTime: (hours) =>
      hours <= 1
        ? "Responds within an hour"
        : `Responds within ~${Math.ceil(hours)} hours`,
    ownerMoreHeading: "More from this owner",
    reportListing: "Report this listing",
    reportSubject: (title, id) => `Report listing: ${title} (${id})`,
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
    titleAll: "Items to rent",
    titleSearch: "Search results",
    subtitleAll: "Browse available rentals across Lithuania.",
    subtitleSearch: (q) => `Results for “${q}” across Lithuania.`,
    resultCount: (n) => `${n} rental${n === 1 ? "" : "s"}`,
    resultCountAtLeast: (n) => `${n}+ rentals`,
    loadMore: "Show more rentals",
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
    deliveryToggle: "Delivery available",
    filtersButton: "Filters",
    filtersTitle: "Filters",
    filtersApply: "Show results",
    backToTop: "Back to top",
    seoHeading: "Item rental in Lithuania",
    seoBody:
      "Naudokis.lt connects people and businesses that need items for a short time with private and business owners across Lithuania. Browse by category, city or price, then manage dates, messages, the final amount and payment in the app.",
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
    defaultBody:
      "Choose dates, see the final price and deposit, message the owner, pay through Stripe and manage your booking in the app.",
    qrHint: "Scan the QR code with your phone to open Naudokis.",
    installCta: "Get the app",
    close: "Close",
    opensAppHint: "Opens in the app",
    googlePlayAlt: "Get it on Google Play",
    appStoreAlt: "Download on the App Store",
    reserveTitle: "Reserve in the app",
    reserveBody:
      "Choose dates, review the final price, applicable fees and deposit, then confirm your booking in the app.",
    datesTitle: "Choose dates in the app",
    datesBody: "Availability and final pricing are shown in Naudokis.",
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
    notFoundBrowse: "Browse rentals",
    errorTitle: "We couldn’t load this page",
    errorBody:
      "Please try again. If the problem continues, come back a little later.",
    errorAction: "Try again",
  },
  legal: {
    brandSub: "Legal center",
    inThisDoc: "In this document",
    contents: "Contents",
    closeContents: "Close contents",
    backTop: "Back to top",
    openMenu: "Sections",
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
    questionsTitle: "Questions about this document?",
    questionsBody:
      "Contact us by email if you have questions about this document.",
    contactCta: "Email us",
    metaDescriptionFallback:
      "Read this Naudokis legal document together with the Terms of Use and Privacy Policy.",
  },
};
