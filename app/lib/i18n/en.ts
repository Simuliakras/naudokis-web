// English dictionary — launch-ready user-facing copy for the localized site.
// EN style guide: "item" = the physical thing, "listing" = the ad/page,
// "listings" is the one count noun for results, and "reserve" (never "book")
// is the one verb for the conversion action.
import type { Dict } from "./types";

export const en: Dict = {
  meta: {
    title: "Item rental in Lithuania | Naudokis.lt",
    description:
      "Find tools, vehicles, cameras and other items to rent from private and business owners in Lithuania. Compare online, then choose dates and reserve in the Naudokis app.",
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
    badge: "Item rental from private and business owners across Lithuania",
    // DRAFT (marketing sign-off): de-calqued — the LT-mirroring phrasing parsed
    // as an obligation ("you need to rent").
    title: "Need it for a day? Rent it instead of buying.",
    // DRAFT (marketing sign-off): tightened — mirrors the LT trim.
    body: "Find tools, vehicles, cameras or leisure gear from owners in Lithuania. Compare online, then confirm dates, final amount and payment in the Naudokis app.",
    ownerPrompt: "Have an item sitting idle?",
    ownerCta: "List it for rent",
    phoneAlt: "Item rental listings in the Naudokis app",
  },
  search: {
    // Short enough to never clip at the 320px floor; inputLabel keeps the full name.
    placeholder: "What would you like to rent?",
    inputLabel: "Search items to rent",
    where: "Where?",
    labelWhat: "Item",
    labelWhere: "City",
    submit: "Search",
  },
  categories: {
    eyebrow: "Browse",
    title: "Popular rental categories",
    all: "All categories",
    seoFallbackBody: (name) =>
      `Browse ${name.toLowerCase()} rentals across Lithuania. Compare prices, locations, owner profiles and continue your reservation in the app.`,
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
  // DRAFT (marketing sign-off): mirrors the new LT trust-band messaging.
  features: [
    {
      icon: "Users",
      title: "A community you can trust",
      body: "Both renters and owners verify their identity, so every rental starts with more confidence.",
    },
    {
      icon: "ShieldCheck",
      title: "No surprise fees",
      body: "The full amount is shown before you pay: rent, platform fee and deposit — no side deals in messages.",
    },
    {
      icon: "ScrollText",
      title: "Help when things are unclear",
      body: "If questions or misunderstandings come up during a rental, the Naudokis team helps you understand the situation and find a clear next step.",
    },
  ],
  // DRAFT (marketing sign-off): section header for the trust band.
  featuresHead: {
    eyebrow: "Why Naudokis",
    title: "Rentals that don't feel risky",
  },
  howItWorks: {
    meta: {
      title: "How item rental and listing work | Naudokis.lt",
      description:
        "Learn how to rent or list an item on Naudokis: search, reservation, payment, handover, return and owner payout.",
    },
    eyebrow: "How it works",
    title: "Rent what you need. Earn from what you own.",
    lead: "Naudokis connects people who need an item for a short time with owners ready to rent it out. Choose your role to see the full journey.",
    renter: {
      label: "Renter",
      lead: "From search to return, here is how to rent for a day, a weekend or a project.",
      ctaTitle: "Ready to reserve? Continue in the app",
      ctaBody:
        "Choose dates, message the owner, review any deposit and pay through Stripe in one place.",
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
          title: "Reserve in the app",
          tag: "In-app",
          tone: "green",
          screen: "reserve",
          body: "Choose dates, review the final amount, fees and deposit, and pay in the app through Stripe.",
        },
        {
          icon: "Handshake",
          title: "Pick up and inspect",
          tag: "Nearby",
          tone: "yellow",
          screen: "pickup",
          body: "Meet at the agreed place, check the item and use it for the agreed rental period.",
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
          title: "Approve the reservation",
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
          body: "Meet at the agreed time, check the condition and hand over the item. Deposits and evidence rules give both sides a clear process if something goes wrong.",
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
    trustTitle: "Clear rentals for people and businesses",
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
        a: "Yes. Searching and viewing listings on the website is free. Any fees and deposit for a specific reservation are shown in the app before you confirm.",
      },
      {
        q: "How are payments handled?",
        a: "In-app payments are processed by Stripe. The rental price, applicable fees and refundable deposit are shown before confirmation; payouts follow the conditions in the Terms of Use.",
      },
      {
        q: "Who is responsible for any damage to an item?",
        a: "A refundable deposit may apply, but it is not insurance or a liability cap. If there is a disagreement, both sides submit evidence and Naudokis administers the platform dispute process.",
      },
      {
        q: "Why do I have to reserve in the app?",
        a: "Dates, final amounts, payments, messages, reservations and notifications are managed in the app. On the website you can browse and compare listings.",
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
        a: "Listing an item is free. Any platform fees for a specific reservation are shown upfront, before confirmation.",
      },
      {
        q: "What if an item comes back damaged?",
        a: "The refundable deposit and the dispute process help: you submit evidence in the app and Naudokis administers the dispute under the rules.",
      },
      {
        q: "Do I have to accept every request?",
        a: "No — you confirm or decline reservation requests in the app, and you can message the renter first.",
      },
    ],
    ctaEyebrow: "The app",
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
      acceptCta: "Confirm reservation",
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
    title: "How each rental works",
    lead: "Three clear steps from search or listing to handover and return.",
    steps: [
      {
        kicker: "Start",
        title: "Find or list an item",
        body: "Browse items nearby, or list your own in just a few minutes.",
      },
      {
        kicker: "Clear",
        title: "Set the terms",
        body: "Dates, price, fees and deposit are shown before confirmation in the app.",
      },
      {
        kicker: "Ready",
        title: "Use it",
        body: "Pick it up and use it — or hand yours over and receive a payout after completion.",
      },
    ],
    ctaLabel: "See the whole process",
  },
  cta: {
    eyebrow: "The app",
    title: "Browse online. Reserve in the app.",
    body: "In the app you can choose dates, review the final amount, fees, deposit and cancellation terms, message the owner, pay through Stripe and manage the rental in one place.",
    phoneAlt: "Reservation screen in the Naudokis app",
  },
  faq: {
    eyebrow: "Questions?",
    heading: "What to know before renting",
    subheading:
      "Quick answers about prices, reservations, deposits, payments and renting through the app.",
    items: [
      {
        q: "Is browsing free?",
        a: "Yes. Searching and viewing listings on the website is free. Any fees and deposit for a specific reservation are shown in the app before you confirm.",
      },
      {
        q: "How are payments handled?",
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
        a: "Yes. Private and business owners can list items. When an owner acts as a business, that status should be shown in the profile or reservation flow, and mandatory consumer rights apply.",
      },
      {
        q: "Why do reservations happen in the app?",
        a: "Messages, dates, payment details, deposits, notifications and reviews stay together in the app.",
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
      "View this item’s rental price, location and terms on Naudokis.lt, then choose dates and confirm the final amount in the app.",
    seoTitle: ({ title, city }) =>
      `${title} rental${city ? ` in ${city}` : ""} | Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` in ${city}` : " in Lithuania";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `Rent ${title}${categoryText}${location} on Naudokis.lt. Review the daily price, owner profile and handover options, then choose dates and confirm the final amount in the app.`;
    },
    share: "Share",
    shareCopied: "Link copied",
    verifiedOwnerPill: "Identity checked",
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
    reviewsEmptyBody: "No reviews yet. Review the owner profile and terms before reserving.",
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
    confirmInApp: "Dates, fees, deposit and the final amount are shown before you pay in the app.",
    hostStatRating: "Rating",
    hostStatReviews: "Reviews",
    hostStatListings: "Items",
    hostMessage: "Ask the owner",
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
    termDepositSub: "Refundable if claim-free",
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
    termInsuranceTitle: "Insurance noted by owner",
    termInsuranceSub: "Details in listing terms",
    mobileBookingNote: "Final amount in the app",
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
    body: "Choose a category, compare prices, locations and owner profiles, then complete your reservation in the app.",
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
      "Browse items to rent across Lithuania by category, city and price. Compare owner profiles and reserve in the Naudokis app.",
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
        return `Browse ${category.toLowerCase()} rentals in ${city}. Compare owner profiles, prices and handover options, then reserve in the Naudokis app.`;
      }
      if (category) {
        return `Find ${category.toLowerCase()} to rent across Lithuania. Filter rentals by city and price, then reserve in the Naudokis app.`;
      }
      return `Browse item rentals in ${city}: tools, vehicles, photo gear, electronics and leisure equipment from private and business owners nearby.`;
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
      return `Naudokis.lt connects people and businesses that need ${what} for a short time with private and business owners ${where}. Browse by category, city or price, then manage dates, messages, the final amount and payment in the app.`;
    },
    crumbCategories: "Categories",
    // DRAFT (marketing sign-off): static eyebrow — never duplicates the dynamic H1s.
    eyebrow: "Rentals across Lithuania",
    titleAll: "Items to rent",
    titleSearch: "Search results",
    subtitleAll: "Compare prices, locations, handover options and owner profiles across Lithuania.",
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
    sortRecommended: "Relevant first",
    sortPriceAsc: "Lowest price",
    sortPriceDesc: "Highest price",
    sortRatingBest: "Highest rated",
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
    paginationLabel: "Rental listing pages",
    previousPage: "Previous page",
    nextPage: "Next page",
    pageStatus: (page, totalPages) => `Page ${page} of ${totalPages}`,
    pageStatusShort: (page) => `Page ${page}`,
    insightsEyebrow: "Local rental",
    insightsHeading: ({ category, city }) => {
      const where = city ? `in ${city}` : "in Lithuania";
      const what = category ? category.toLowerCase() : "item";
      return `What to know about ${what} rental ${where}`;
    },
    insightsInventory: (count, { category, city }) => {
      const where = city ? `in ${city}` : "in Lithuania";
      const what = category ? `${category.toLowerCase()} listing${count === 1 ? "" : "s"}` : `rental listing${count === 1 ? "" : "s"}`;
      return `Currently showing ${count} ${what} ${where}; new items appear as owners publish listings.`;
    },
    insightsPriceRange: (minCents, maxCents) => {
      const min = Math.round(minCents / 100);
      const max = Math.round(maxCents / 100);
      return min === max
        ? `Listings visible on this page are around €${min} per day.`
        : `Listings visible on this page range from €${min} to €${max} per day.`;
    },
    insightsNeighborhoods: (neighborhoods) => `Visible neighborhoods and areas: ${neighborhoods.join(", ")}.`,
    insightsUseCases: ({ category, city }) => {
      const what = category ? category.toLowerCase() : "items";
      const where = city ? `in ${city}` : "in Lithuania";
      return `Common use cases include a short project, weekend trip, event, repair job or one-off need where renting ${what} ${where} is easier than buying.`;
    },
    insightsChecks:
      "Before reserving, check what is included, item condition, rental duration, cancellation terms, handover location and whether extra accessories are needed.",
    insightsDeposit:
      "Deposit expectations depend on the specific item value and owner terms; the deposit is shown before you confirm the reservation in the app.",
    insightsPickupDelivery: (hasDelivery) =>
      hasDelivery
        ? "Pickup and delivery depend on the listing: some visible offers can be arranged with delivery, while others are picked up at an agreed location."
        : "Pickup at an agreed location is the most common handover method; if delivery matters, use the delivery filter or review the listing terms.",
    insightsSubcategories: (subcategories) => `Popular related subcategories: ${subcategories.join(", ")}.`,
    insightsTrust:
      "Before reserving, review the owner profile, verification badges, reviews, deposit and handover terms.",
    insightsCta:
      "Compare listings on the website, then confirm dates, messages, final amount and payment in the app.",
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
        "Explore other categories or list an item to help start this category.",
      categoryTitle: "No listings in this category yet",
      categoryBody:
        "Explore other categories or list an item to help start this category.",
      categoryActionPrimary: "List an item",
      categoryActionSecondary: "All categories",
    },
    interruptTitle: "Reserve in the app with the final amount shown first",
    interruptBody:
      "Choose dates, message owners, review fees, deposit and the final amount, then pay through Stripe.",
    interruptCta: "Get the app",
  },
  offline: {
    title: "You’re offline",
    body: "Reconnect to load rentals and continue browsing.",
    retry: "Try again",
  },
  bridge: {
    defaultTitle: "Continue this rental in the app",
    // DRAFT (marketing sign-off): role-neutral — covers both marketplace sides.
    defaultBody:
      "Use the app to choose dates, message the owner, see fees, deposit and the final amount, then pay through Stripe.",
    qrHint: "Scan the QR code with your phone to open Naudokis.",
    qrTitle: "Scan to continue on your phone",
    installCta: "Get the app",
    keepBrowsing: "Keep browsing",
    emailSelf: "Email yourself the link",
    emailSelfSubject: "Your Naudokis app link",
    storesAlso: "Also on:",
    close: "Close",
    opensAppHint: "Opens in the app",
    googlePlayAlt: "Get it on Google Play",
    appStoreAlt: "Download on the App Store",
    reserveTitle: "Reserve in the app",
    reserveBody:
      "Choose dates, review the final amount, fees, deposit and cancellation terms, then confirm your reservation in the app.",
    contactTitle: "Ask the owner in the app",
    contactBody:
      "Messages, dates and reservation details stay together in Naudokis.",
    reviewsTitle: "Read all reviews in the app",
    reviewsBody:
      "All verified rental reviews are available in the Naudokis app.",
    favoriteTitle: "Save this item in the app",
    favoriteBody: "Saved items are kept in your Naudokis account.",
    shareTitle: "Open this item in the app",
    shareBody: "Download Naudokis to open this item on your phone.",
    listTitle: "List your item for rent",
    listBody: "Add photos, describe the condition and what is included, set the price and deposit. You approve each request.",
  },
  invite: {
    meta: {
      title: "You’ve been invited to Naudokis — get the app",
      description:
        "A friend invited you to try Naudokis — rent items from private and business owners. Get the app to start.",
    },
    eyebrow: "Invitation",
    titleValid: (amount) =>
      `You’ve been invited to Naudokis! Get ${amount} on your first rental.`,
    titleUnknown: "You’ve been invited to Naudokis.",
    titleGeneric: "Rent items from people and businesses nearby.",
    // DRAFT (marketing sign-off): "nearby" no longer echoes the headline's line.
    lead: "Naudokis helps you rent items from private and business owners. Get the app to start.",
    rewardExplainer:
      "Your reward is credited to your account once you verify your identity in the app. The friend who invited you is rewarded after your first completed rental.",
    invalidNote:
      "This invite code is no longer valid, but you can use the app as usual.",
    // DRAFT (marketing sign-off): truthful value bullets — already-claimed facts only.
    benefits: [
      "Payments are processed through Stripe; deposits are shown before confirmation",
      "Owner profiles, verification badges and reviews",
      "Clear reservation, cancellation and dispute rules",
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
    successBody: "Your account deletion has been canceled. You can log in again in the app.",
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
    brandSub: "Rules & privacy",
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
    hubTitle: "Rules & privacy",
    hubLead: "The main Naudokis rules, privacy information and account data controls in one place.",
    questionsTitle: "Questions about how this applies to your rental?",
    questionsBody:
      "Contact us by email if you have questions about a rule, payment or dispute.",
    contactCta: "Email us",
    metaDescriptionFallback:
      "Read this Naudokis legal document together with the Terms of Use and Privacy Policy.",
  },
};
