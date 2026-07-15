// English dictionary — launch-ready user-facing copy for the localized site.
// EN style guide: "item" = the physical thing, "listing" = the ad/page,
// "listings" is the one count noun for results, and "reserve" (never "book")
// is the one verb for the conversion action.
import type { Dict } from "./types";

// One-line tile examples (Categories v2), keyed by top-level category id.
// FINAL (2026-07 bilingual content pass):
// these are direct EN equivalents.
const EN_CATEGORY_EXAMPLES: Record<string, string> = {
  transport: "Cars, trailers, scooters",
  photo_video: "Cameras, lenses, drones",
  tools_construction: "Drills, saws, demolition hammers",
  sports_leisure: "Bikes, paddleboards, skis",
  home_garden: "Lawnmowers, pressure washers, garden tools",
  electronics_tech: "Projectors, consoles, computers",
  audio_music_events: "Speakers, microphones, lighting",
  events_parties: "Tents, tables, decorations",
  clothing_accessories: "Dresses, suits, accessories",
  kids: "Strollers, car seats, toys",
  health_medical: "Crutches, wheelchairs, massagers",
  other: "Anything that doesn’t fit elsewhere",
};

export const en: Dict = {
  meta: {
    title: "Rent items in Lithuania | Naudokis.lt",
    description:
      "Find items to rent from private and business owners in Lithuania. Compare listings online, then continue your reservation request in the app.",
    // og:locale is matched against the platforms' supported-locale lists, and
    // "en_LT" is on none of them. en_GB is the closest supported English for an
    // EU audience; the page's real language is carried by <html lang> + hreflang.
    ogLocale: "en_GB",
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
    badge: "Clear profile verification signals",
    title: "Clearer item rental from search to return.",
    body: "Find an item from a private or business owner. Compare listings on the website, then use the app to see the full reservation amount, send a request, and record handover and return.",
    ownerPrompt: "Have an item you are not using?",
    ownerCta: "List it in the app",
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
    title: "Rental categories",
    all: "All categories",
    examples: (id) => EN_CATEGORY_EXAMPLES[id],
    seoFallbackBody: (name) =>
      `Browse ${name.toLowerCase()} rentals across Lithuania. Compare prices, locations and owner profiles, then continue your reservation request in the app.`,
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
    // FINAL: recency framing — "picked for you"/"popular"/
    // "nearby" had no personalization, review or geo signal behind them.
    eyebrow: "Browse",
    title: "Items to rent",
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
      "There are no listings here yet. Browse the categories or check back later.",
    bandEmptyAction: "All categories",
    bandEmptySecondary: "Open in the app",
  },
  // FINAL: mirrors the LT trust-band messaging.
  features: [
    {
      icon: "Users",
      title: "Visible verification signals",
      body: "When a user’s identity has been checked, it is shown clearly on their profile. Additional checks may be required before a reservation.",
    },
    {
      icon: "ShieldCheck",
      title: "Reservation amount before payment",
      body: "Before paying in the app, you will see the rental price, platform fee and any deposit. Additional conditions are shown separately when they apply.",
    },
    {
      icon: "ScrollText",
      title: "Help when things are unclear",
      body: "If questions or misunderstandings come up during a rental, the Naudokis team helps you understand the situation and find a clear next step.",
    },
  ],
  // FINAL: section header for the trust band.
  featuresHead: {
    eyebrow: "Why Naudokis",
    title: "Clearer terms before you reserve",
  },
  howItWorks: {
    meta: {
      title: "How item rental and listing work | Naudokis.lt",
      description:
        "Learn how to send or accept a reservation request, record handover and return, and complete a rental through Naudokis.",
    },
    eyebrow: "How it works",
    title: "Rent what you need. Earn from what you own.",
    lead: "Naudokis provides the marketplace and rental-process tools; the renter contracts directly with a private or business owner. Choose your role to see the full journey.",
    renter: {
      label: "Renter",
      lead: "From search to return, here is how to rent for a day, a weekend or a project.",
      ctaTitle: "Continue your reservation request in the app",
      ctaBody:
        "Choose dates and handover, review the full amount, then authorise payment. The request is then sent to the owner.",
      steps: [
        {
          icon: "Search",
          title: "Find and compare",
          tag: "Search",
          tone: "yellow",
          screen: "search",
          body: "Check the description, condition, location, handover options, owner status, completed checks and reviews from completed reservations.",
        },
        {
          icon: "Calendar",
          title: "Review the amount and send a request",
          tag: "Request",
          tone: "green",
          screen: "reserve",
          body: "Choose dates and handover, then check the price, fees, deposit, cancellation terms and total. Stripe authorises payment, and the owner accepts or declines the request.",
        },
        {
          icon: "Handshake",
          title: "Receive the item with a condition record",
          tag: "Handover",
          tone: "yellow",
          screen: "pickup",
          body: "At pickup or delivery, check the item’s condition and accessories. Save photos and notes in the app.",
        },
        {
          icon: "Star",
          title: "Return, complete and review",
          tag: "Completion",
          tone: "purple",
          screen: "review",
          body: "Record the condition again at return. Participants in a completed reservation can then leave a review.",
        },
      ],
    },
    owner: {
      label: "Owner",
      lead: "From listing to payout, here is how to turn idle items into income.",
      ctaTitle: "List your item in the app",
      ctaBody:
        "In the app you can list items, manage requests, message renters and receive payouts in one place.",
      steps: [
        {
          icon: "Camera",
          title: "Publish accurate terms",
          tag: "Listing",
          tone: "yellow",
          screen: "list",
          body: "Add real photos, describe condition and accessories, and set the price, deposit, delivery and cancellation terms.",
        },
        {
          icon: "BadgeCheck",
          title: "Accept or decline the request",
          tag: "Decision",
          tone: "green",
          screen: "accept",
          body: "Review the renter’s profile, dates and amounts, then decide by the deadline shown in the app.",
        },
        {
          icon: "Handshake",
          title: "Record handover and return",
          tag: "Condition",
          tone: "yellow",
          screen: "handover",
          body: "At both stages, save a record of the item’s condition, photos, notes and included accessories.",
        },
        {
          icon: "Coins",
          title: "Complete the rental and receive your payout",
          tag: "Payout",
          tone: "purple",
          screen: "payout",
          body: "Once completion and payout conditions are met, the payout is initiated. If there is a problem, submit a claim and evidence within the deadline shown in the app.",
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
        body: "Only people who completed a reservation through Naudokis can leave a review. Completed verification is also shown on profiles.",
      },
      {
        icon: "ShieldCheck",
        title: "Deposits and support",
        body: "Clear deposit, damage and evidence rules, plus dispute support, help both sides handle problems.",
      },
    ],
    browseCta: "Browse items",
    listCta: "List an item",
    faqEyebrow: "More questions?",
    faqTitle: "Common questions",
    faqSubheading:
      "Quick answers about reservations, payments, deposits and renting through the app.",
    faq: [
      {
        q: "Is browsing free?",
        a: "Yes. Searching and viewing listings on the website is free. Fees, deposit, cancellation terms and the total for a specific reservation are shown before you send a request.",
      },
      {
        q: "How are payments handled?",
        a: "Stripe processes payments. Payment is authorised when you send a request; the reservation becomes final after the owner accepts it and payment succeeds.",
      },
      {
        q: "Who is responsible for any damage to an item?",
        a: "A refundable deposit may apply, but it is not insurance or a liability cap. If there is a disagreement, both sides submit evidence and Naudokis administers the platform dispute process.",
      },
      {
        q: "Why is the reservation request sent in the app?",
        a: "The app keeps dates, the full amount, payment authorisation, the request, messages, condition records and notifications in one place. On the website you can browse and compare listings.",
      },
    ],
    // FINAL product copy: owner-side FAQ — mirrors the LT set and published policies.
    faqOwner: [
      {
        q: "When do I get paid?",
        a: "After the rental is completed and the payout conditions are met, your payout is sent through Stripe. Payouts follow the process set out in the Terms of Use.",
      },
      {
        q: "How much does listing an item cost?",
        a: "There is no upfront fee to publish an item. Platform fees for a specific reservation are shown before you accept the request.",
      },
      {
        q: "What if an item comes back damaged?",
        a: "The refundable deposit and the dispute process help: you submit evidence in the app and Naudokis administers the dispute under the rules.",
      },
      {
        q: "Do I have to accept every request?",
        a: "No. Review the renter’s profile, dates and amounts, then accept or decline the request by the deadline shown in the app.",
      },
    ],
    ctaEyebrow: "The app",
    ctaPhoneAlt: "Naudokis app",
    screen: {
      searchPlaceholder: "What do you need to rent?",
      reserveCta: "Send request",
      frozenPill: "Payment authorised",
      pickupCta: "Meet the owner",
      reviewCta: "Leave a review",
      listUpload: "Add photos",
      listPrice: "€50 / day",
      listCta: "Publish",
      acceptCta: "Accept request",
      handoverCta: "Record handover",
      // multi-day amount (≠ 1× the mock's daily price) + explicit after-fees
      // qualifier, so the illustration can't read as a fee-free gross payout
      payoutAmount: "+ €120",
      payoutLabel: "Payout sent, after fees",
      completedPill: "Completed",
    },
  },
  homeSteps: {
    eyebrow: "How it works",
    title: "How each rental works",
    lead: "Four clear stages from search or listing to return and completion.",
    steps: [
      {
        kicker: "Start",
        title: "Find or list an item",
        body: "Compare listings on the website, or list your own item in the app.",
      },
      {
        kicker: "Decision",
        title: "Send or accept a request",
        body: "The renter sees the full amount and sends a request; the owner accepts or declines it.",
      },
      {
        kicker: "Record",
        title: "Hand over and return with a record",
        body: "At both stages, record the item’s condition, photos, notes and accessories.",
      },
      {
        kicker: "Finish",
        title: "Complete the rental",
        body: "Confirm the return, provide evidence if needed, and leave a review after completion.",
      },
    ],
    ctaLabel: "See the whole process",
  },
  cta: {
    eyebrow: "The app",
    title: "Browse online. Send your request in the app.",
    body: "In the app, choose dates and handover, review the full amount and authorise payment. The request is sent to the owner; the reservation becomes final only after the owner accepts and payment succeeds. Messages, handover and return stay in one place.",
    phoneAlt: "Reservation screen in the Naudokis app",
  },
  faq: {
    eyebrow: "Questions?",
    heading: "What to know before renting",
    subheading: "Quick answers about the agreement, reservation status, checks, deposits and responsibility.",
    items: [
      {
        q: "Who enters into the rental agreement?",
        a: "The renter enters into the agreement directly with the private or business owner offering the item. Naudokis provides the marketplace, payment and rental-process tools.",
      },
      {
        q: "When does a reservation become final?",
        a: "Stripe first authorises payment and the request is sent to the owner. The reservation becomes final only after the owner accepts it and payment succeeds.",
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
        q: "What happens if an item is damaged or not returned?",
        a: "The refundable deposit and dispute process help: both sides can submit evidence in the app and Naudokis administers the dispute under the rules.",
      },
      {
        q: "Can private people and businesses list items?",
        a: "Yes. Private and business owners can list items. When an owner acts as a business, that status should be shown in the profile or reservation flow, and mandatory consumer rights apply.",
      },
      {
        q: "Why is the reservation request sent in the app?",
        a: "The app keeps dates, the full amount, payment authorisation, messages, condition records and notifications in one place.",
      },
      {
        q: "When does the owner receive a payout?",
        a: "The payout is initiated after the rental is completed and payout conditions are met. Actual transfer time depends on the payment provider and any applicable checks.",
      },
      {
        q: "Are browsing and listing free?",
        a: "There is no upfront fee to search or view listings on the website or to publish an item. Fees for a specific reservation are shown before the request is sent.",
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
      "View this item’s rental price, location and terms on Naudokis.lt, then continue the reservation request in the app.",
    seoTitle: ({ title, city }) =>
      `${title} rental${city ? ` in ${city}` : ""} | Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` in ${city}` : " in Lithuania";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `Rent ${title}${categoryText}${location} on Naudokis.lt. Review the daily price, owner profile and handover options, then continue the reservation request in the app.`;
    },
    share: "Share",
    shareCopied: "Link copied",
    shareFailed: "Couldn’t share the link. Try again.",
    verifiedOwnerPill: "Identity verified",
    galleryMore: (n) => `+${n} photo${n === 1 ? "" : "s"}`,
    descHeading: "Description",
    descOriginalNote: "Provided by the owner in their original language.",
    descMore: "Show more",
    descLess: "Show less",
    specsHeading: "Specifications",
    handoverHeading: "Item handover",
    mapTitle: (city) => `${city} on the map`,
    mapLoad: "Load the Google Maps map",
    mapNotice: "The map loads only after you choose it. Google may receive your IP address and device data.",
    mapPrivacy: "Privacy information",
    pickupLabel: "Pickup",
    pickupFree: "Free",
    deliveryLabel: "Delivery",
    deliveryByArrangement: "By arrangement",
    deliveryRadius: (km) => `Up to ${km} km`,
    deliveryPerKm: (price) => `${price} / km`,
    termsHeading: "Rental terms",
    reviewsHeading: "Reviews",
    similarHeading: "Similar items",
    moreItemsHeading: "More items to rent",
    reviewsEmptyTitle: "No reviews for this item yet",
    reviewsEmptyBody: "No reviews yet. Review the owner profile and terms before sending a request.",
    reviewsInApp: (n) => `All ${n} reviews in the app`,
    perDay: "per day",
    reserve: "Send reservation request",
    reserveMobile: "Send request",
    loadErrorTitle: "We couldn’t load this listing",
    loadErrorBody: "Check your connection and try again.",
    goneTitle: "This listing is no longer available",
    goneBody:
      "It may have been rented out or removed. Browse other listings instead.",
    backToListings: "Items to rent",
    save: "Save",
    newListingPill: "No reviews yet",
    noPhotos: "No photos",
    galleryAll: (n) => `All ${n} photos`,
    galleryExpand: "Expand photo",
    galleryViewLabel: "Photo gallery",
    galleryClose: "Close gallery",
    galleryPrev: "Previous photo",
    galleryNext: "Next photo",
    galleryImageError: "Couldn’t load this photo",
    perDayShort: "per day",
    confirmInApp: "In the app, choose dates and handover, then see fees, deposit, cancellation terms and the total before sending a request.",
    datesLabel: "Rental dates",
    datesFrom: "From",
    datesTo: "To",
    datesPlaceholder: "Choose",
    datesTriggerLabel: "Choose rental dates",
    datesPanelTitle: "Rental dates",
    datesClose: "Close calendar",
    datesClear: "Clear",
    datesApply: "Done",
    calPrevMonth: "Previous month",
    calNextMonth: "Next month",
    calDays: (n) => `${n} day${n === 1 ? "" : "s"}`,
    calLimits: (min, max) =>
      max > 0
        ? `Rent for ${min}–${max} days`
        : `Minimum rental ${min} day${min === 1 ? "" : "s"}`,
    calBooked: "Booked",
    calToday: "today",
    calSelectStart: "Pick a start date",
    calSelectEnd: "Pick an end date",
    calStartSelected: (date) => `Start: ${date}. Now pick an end date.`,
    calRangeSelected: ({ start, end, days }) => `Selected ${start}–${end}, ${days}.`,
    calBlocked: (reason, n) => {
      if (reason === "past") {
        return "Date has passed";
      }
      if (reason === "booked") {
        return "Booked";
      }
      if (reason === "tooShort") {
        return `Minimum rental is ${n} day${n === 1 ? "" : "s"}`;
      }
      if (reason === "tooLong") {
        return `Maximum rental is ${n} day${n === 1 ? "" : "s"}`;
      }
      return "There are booked days in between";
    },
    calUnknownTitle: "Couldn't check availability",
    calUnknownBody:
      "We can't see which days are taken. You'll confirm the dates and the final amount in the app.",
    calUnknownRetry: "Try again",
    calUnknownNote: "Availability not checked",
    calLoading: "Checking availability…",
    estimateRental: (days) => `Rental (${days})`,
    estimateDiscount: (percent) => `Longer-rental discount −${percent}%`,
    estimateDeposit: "Deposit (refundable)",
    bookingDepositSuffix: "deposit (refundable after a successful rental)",
    estimateFees: "This is a preliminary rental amount. Delivery, applicable fees, deposit, cancellation terms and the final total are shown in the app before you send a request.",
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
    depositTitle: (amount) => `${amount}`,
    termDepositSub: "Refundable deposit",
    durationRange: (min, max) =>
      !max || max <= min
        ? `From ${min} day${min === 1 ? "" : "s"}`
        : `${min}–${max} days`,
    termDurationSub: "Rental period",
    cancellationLabel: (tier) => {
      if (tier === "flexible") return "Flexible cancellation policy";
      if (tier === "moderate") return "Moderate cancellation policy";
      if (tier === "strict") return "Strict cancellation policy";
      return "Standard cancellation policy";
    },
    termCancelSub: "Cancellation terms",
    discountsLabel: "Longer-rental discounts",
    discountFrom: (n) => `From ${n} day${n === 1 ? "" : "s"}`,
    mobileBookingNote: "Final total in the app",
  },
  common: {
    favorite: "Save",
    delivery: "Delivery",
    perDay: "per day",
    reviewCount: (n) => `${n} review${n === 1 ? "" : "s"}`,
    photoCount: (n) => `${n} photo${n === 1 ? "" : "s"}`,
    depositAmount: (amount) => `${amount} deposit`,
    ownerLabel: "Owner",
    imageUnavailable: "Image unavailable",
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
    body: "Choose a category, compare prices, locations and owner profiles, then continue your reservation request in the app.",
    searchPlaceholder: "Search categories",
    searchLabel: "Search item rental categories",
    submit: "Search",
    emptyTitle: "No categories found",
    emptySubtitle: (query) =>
      `No categories matched “${query}”. Try a broader search.`,
    emptyAction: "Clear",
    foundCount: (n) => `${n} categor${n === 1 ? "y" : "ies"}`,
    searchItems: (query) => `Search items for “${query}”`,
    subcategoriesHeading: "Subcategories",
    seoHeading: "Item rental by category",
    seoBody:
      "Naudokis.lt covers everyday rental categories across Lithuania, including tools, transport, photo gear, electronics, home appliances, event equipment and leisure gear. Choose a category to find items nearby without buying things you only need occasionally.",
  },
  feed: {
    metaTitle: "Items to rent in Lithuania | Naudokis.lt",
    metaDescription:
      "Browse items to rent across Lithuania by category, city and price. Compare owner profiles and continue your reservation request in the app.",
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
        return `Browse ${category.toLowerCase()} rentals in ${city}. Compare owner profiles, prices and handover options, then continue your reservation request in the app.`;
      }
      if (category) {
        return `Find ${category.toLowerCase()} to rent across Lithuania. Filter rentals by city and price, then continue your reservation request in the app.`;
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
    // FINAL: static eyebrow — never duplicates the dynamic H1s.
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
    sortNewest: "Newest first",
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
    pageEmptyTitle: "This page no longer exists",
    pageEmptyBody: "The list of listings has changed, so this page is out of range. Head back to the start of the list.",
    pageEmptyAction: "Back to page 1",
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
        "Browse listings in other cities or be the first to list an item here.",
      categoryTitle: "No listings in this category yet",
      categoryBody:
        "Browse other categories or be the first to list an item here.",
      categoryActionPrimary: "List an item",
      categoryActionSecondary: "All categories",
    },
    interruptTitle: "Continue your reservation request in the app",
    interruptBody:
      "Choose dates and handover, review the full amount, authorise payment and send your request to the owner.",
    interruptCta: "Get the app",
  },
  offline: {
    title: "You’re offline",
    body: "Reconnect to load rentals and continue browsing.",
    retry: "Try again",
    timeoutTitle: "The server is taking too long",
    timeoutBody: "Your search and filters are preserved. Check your connection and try again.",
    serverTitle: "The service is temporarily unavailable",
    serverBody: "Your search and filters are preserved. Please try again in a moment.",
  },
  bridge: {
    defaultTitle: "Continue this rental request in the app",
    // FINAL: role-neutral — covers both marketplace sides.
    defaultBody:
      "Use the app to choose dates and handover, see the full amount, authorise payment and send a request to the owner.",
    qrHint: "Scan the QR code with your phone to open Naudokis.",
    qrTitle: "Scan to continue on your phone",
    installCta: "Get the app",
    storesAlso: "Also on:",
    appOpenFallback: "Didn’t open? Try again or choose your app store below.",
    retryOpen: "Try opening again",
    close: "Close",
    opensAppHint: "Opens in the app",
    googlePlayAlt: "Get it on Google Play",
    appStoreAlt: "Download on the App Store",
    reserveTitle: "Continue your reservation request in the app",
    reserveBody:
      "Choose dates and handover, review the full amount and authorise payment. The request is sent to the owner. The reservation becomes final only after the owner accepts and payment succeeds.",
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
  // DRAFT: attribution-consent copy — needs sign-off before the OneLink URL is
  // switched on in prod. Both actions must stay equally weighted.
  consent: {
    title: "Allow install and campaign measurement?",
    body: "If you agree, AppsFlyer will receive an install identifier, the campaign or referral source and, where enabled, selected app conversion events such as a completed rental and its value. AppsFlyer will not receive your name, email address, full card details, reservation ID or the item’s precise address. This is optional and does not limit your use of Naudokis.",
    privacyLink: "Privacy Policy",
    allow: "Allow AppsFlyer measurement",
    decline: "Continue without AppsFlyer measurement",
    close: "Close",
  },
  // DRAFT.
  privacyChoices: {
    trigger: "Privacy choices",
    title: "AppsFlyer attribution",
    body: "Allow AppsFlyer to connect the app installation with a campaign or referral and, where enabled, selected app conversion events.",
    statusLabel: "Current status",
    statusAllowed: "Allowed",
    statusNotAllowed: "Not allowed",
    allow: "Allow install attribution",
    withdraw: "Withdraw permission",
    scopeNote:
      "This is the AppsFlyer attribution choice made on the website. Other in-app analytics are controlled separately in the app settings.",
    privacyLink: "Privacy Policy",
    close: "Close",
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
    // FINAL: "nearby" no longer echoes the headline's line.
    lead: "Naudokis helps you rent items from private and business owners. Get the app to start.",
    rewardExplainer:
      "Your reward is credited to your account once you verify your identity in the app. The friend who invited you is rewarded after your first completed rental.",
    invalidNote:
      "This invite code is no longer valid, but you can use the app as usual.",
    // FINAL: truthful value bullets — published-policy facts only.
    benefits: [
      "Payments are processed through Stripe; deposits are shown before confirmation",
      "Owner profiles, verification badges and reviews",
      "Clear reservation, cancellation and dispute rules",
    ],
    ctaInstall: "Get the app",
    qrHint: "Scan with your phone",
    codeLabel: "Your invite code",
    codeHint:
      "Enter this code in the app after you sign up — the reward depends on the code, not on allowing measurement.",
    codeCopy: "Copy code",
    codeCopied: "Copied",
    codeCopyFailed: "Couldn’t copy. Select the code and copy it manually.",
  },
  // FINAL: account-deletion cancel bridge copy.
  cancelDeletion: {
    meta: {
      title: "Cancel account deletion — Naudokis",
      description: "Changed your mind? Cancel your account deletion and keep using Naudokis.",
    },
    title: "Keep your account?",
    body: "You can cancel account deletion within 30 days of submitting the request. Confirm below if you want to keep your account.",
    confirm: "Cancel deletion",
    successTitle: "Account deletion cancelled",
    successBody: "Your account deletion has been cancelled. You can sign in again in the app.",
    successCta: "Open the app",
    invalidTitle: "Link not valid",
    invalidBody: "This link is invalid or has expired. If you need help, email info@naudokis.lt.",
    alreadyTitle: "Link no longer valid",
    alreadyBody: "The link has already been used or the 30-day period has ended. If you cannot sign in or are unsure of the account status, email info@naudokis.lt.",
    errorTitle: "Couldn’t cancel",
    errorBody: "Something went wrong. Please try again or contact us.",
    retry: "Try again",
    correlationLabel: "Reference ID",
  },
  // DRAFT: app-handoff landings. The web never loads the record behind the link, so
  // every line describes the intent only — nothing here may imply the id exists.
  handoff: {
    meta: {
      title: "Open in the Naudokis app",
      description: "This page continues in the Naudokis app.",
    },
    kinds: {
      bookingRequest: {
        title: "Your booking request is in the app",
        body: "Accept or decline, change or cancel a booking request in the Naudokis app.",
      },
      chat: {
        title: "Continue this conversation in the app",
        body: "Messages with the owner live in the Naudokis app.",
      },
      review: {
        title: "Reviews are in the app",
        body: "Open the app to leave or read a review.",
      },
      billingDocuments: {
        title: "Billing documents are in the app",
        body: "Your payment documents are available in the Naudokis app.",
      },
      profile: {
        title: "Profiles are in the app",
        body: "Owner profiles are shown in the Naudokis app.",
      },
      myProfile: {
        title: "Your account is in the app",
        body: "Manage your account, rentals and settings in the Naudokis app.",
      },
      rewards: {
        title: "Rewards are in the app",
        body: "See your invite rewards and their status in the Naudokis app.",
      },
      resetPassword: {
        title: "Reset your password in the app",
        body: "Set a new password in the Naudokis app. This link is valid for a limited time.",
      },
      verifyEmail: {
        title: "Confirm your email in the app",
        body: "Confirm your email in the Naudokis app. This link is valid for a limited time.",
      },
    },
    openApp: "Open in the app",
    openHint: "Nothing happened? Then you don’t have the app yet — get it below.",
    installLead: "Don’t have the app? Get it free.",
    installCta: "Get the app",
    qrHint: "Scan with your phone",
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
    questionsTitle: "Questions about how this applies to your rental?",
    questionsBody:
      "Contact us by email if you have questions about a rule, payment or dispute.",
    contactCta: "Email us",
    metaDescriptionFallback:
      "Read this Naudokis legal document together with the Terms of Use and Privacy Policy.",
  },
};
