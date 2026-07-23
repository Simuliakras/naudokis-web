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

// Unaccented search aliases per top-level category id (Kategorijos directory) —
// matched folded, alongside the title and sub names.
// DRAFT (2026-07): EN aliases pending marketing sign-off.
const EN_CATEGORY_SYNONYMS: Record<string, string> = {
  transport: "cars vehicles",
  photo_video: "photo cameras",
  tools_construction: "tools repair diy",
  sports_leisure: "sports outdoors hiking",
  home_garden: "garden yard lawnmower",
  electronics_tech: "computers gadgets",
  audio_music_events: "audio sound music dj",
  events_parties: "parties weddings birthdays",
  clothing_accessories: "clothes fashion",
  kids: "children babies",
  health_medical: "care rehabilitation",
  other: "misc",
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
    badge: "Renting between verified users",
    title: "Clearer item rental – from search to return.",
    body: "Find an item from a private or business owner. Compare listings on the website, then use the app to review the final amount, send a reservation request, and record the handover and return of the item.",
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
    eyebrow: "Discover",
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
    eyebrow: "Choose",
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
    title: "Rent what you need. Earn from what you already own.",
    lead: "Naudokis connects renters with private and business owners and provides the tools for a smooth rental process. The rental agreement is made directly between the parties. Choose your role and see how the whole process works.",
    renter: {
      label: "Renter",
      lead: "From search to return – four clear steps to rent an item for a day, a weekend or a project.",
      ctaTitle: "Reserve the item in the app",
      ctaBody:
        "Choose your rental dates and handover method, review the final amount, then authorise payment. The request is then sent to the owner.",
      steps: [
        {
          icon: "Search",
          title: "Discover and compare",
          tag: "Search",
          tone: "yellow",
          screen: "search",
          body: "Check the item’s description, condition, location and handover options. Weigh up the owner’s profile, their completed checks and reviews from earlier rentals.",
        },
        {
          icon: "Calendar",
          title: "Choose your terms and send a request",
          tag: "Request",
          tone: "green",
          screen: "reserve",
          body: "Choose your rental dates and handover method, then review the final amount, the deposit and the cancellation terms. Once you authorise payment, the request is sent to the owner.",
        },
        {
          icon: "Handshake",
          title: "Receive it and record the condition",
          tag: "Handover",
          tone: "yellow",
          screen: "pickup",
          body: "At pickup or delivery, check the item’s condition, what it comes with and its accessories. Save photos and notes in the app.",
        },
        {
          icon: "Star",
          title: "Return and complete the rental",
          tag: "Completion",
          tone: "purple",
          screen: "review",
          body: "Record the item’s condition again at return, confirm the return, and leave a review once the rental is complete.",
        },
      ],
      // ⚠️ DRAFT (2026-07-22): renter-side guarantees, mirroring the LT copy.
      // Deadlines and conditions are quoted from the Terms of Use (§6–§9).
      trust: [
        {
          icon: "CreditCard",
          title: "Payment is taken only once the reservation is confirmed",
          body: "The rental price, platform fees and the deposit are shown before you send the request. Payment is only authorised at first, and taken once the owner accepts the request.",
        },
        {
          icon: "Users",
          title: "You know who you rent from",
          body: "Owner profiles show identity and other profile verifications, along with reviews from earlier rentals. Only people who completed a reservation through Naudokis can leave a review.",
        },
        {
          icon: "ShieldCheck",
          title: "Deposit and cancellation terms – upfront",
          body: "You see the deposit-return and cancellation terms before you send the request. If no justified claim is filed within the deadline, the deposit is returned. Cancelled before handover, it is returned in full.",
        },
      ],
    },
    owner: {
      label: "Owner",
      lead: "From listing to payout – four clear steps to help you turn idle items into income.",
      ctaTitle: "List your item in the app",
      ctaBody:
        "In the app you can list items, manage requests, message renters and receive payouts in one place.",
      steps: [
        {
          icon: "Camera",
          title: "List your item on clear terms",
          tag: "Listing",
          tone: "yellow",
          screen: "list",
          body: "Add clear photos, describe the item’s condition and what it comes with, and set the price, deposit, handover methods and cancellation terms.",
        },
        {
          icon: "BadgeCheck",
          title: "Review and respond to the request",
          tag: "Request",
          tone: "green",
          screen: "accept",
          body: "Review the renter’s profile, the rental dates and the final amount. Accept or decline the request by the deadline shown.",
        },
        {
          icon: "Handshake",
          title: "Record handover and return",
          tag: "Handover",
          tone: "yellow",
          screen: "handover",
          body: "When you hand the item over and when you take it back, record its condition, what it comes with, photos and notes in the app.",
        },
        {
          icon: "Coins",
          title: "Complete the rental and receive your payout",
          tag: "Payout",
          tone: "purple",
          screen: "payout",
          body: "Once the return is confirmed and the payout conditions are met, the payout is initiated. If a problem comes up, submit a claim and evidence within the deadline shown in the app.",
        },
      ],
      // ⚠️ DRAFT (2026-07-22): owner-side guarantees, mirroring the LT copy.
      trust: [
        {
          icon: "Coins",
          title: "You see the fees before you accept a request",
          body: "You can publish a listing with no upfront fee. The platform fees that apply to a specific reservation are shown clearly before you accept the request.",
        },
        {
          icon: "BadgeCheck",
          title: "You decide who to rent to",
          body: "Before you decide, you can see the renter’s profile, their identity verification, the rental dates and the final amount. You can accept or decline any request.",
        },
        {
          icon: "ShieldCheck",
          title: "Condition records and a clear claims process",
          body: "Handover and return records are saved in the app. If you notice damage, file a claim with initial evidence within 24 hours of the confirmed return.",
        },
      ],
    },
    trustEyebrow: "Trust at every stage",
    trustTitle: "Clearer rentals for both sides",
    browseCta: "Find an item",
    listCta: "List your item",
    faqEyebrow: "More questions?",
    faqTitle: "Common questions",
    faqSubheading:
      "Clear answers about reservations, payment, cancellation, deposits and returning the item.",
    faqOwnerSubheading:
      "Clear answers about listings, requests, payouts, claims and renting out as a business.",
    // ⚠️ DRAFT (2026-07-22): renter-side questions — authorisation vs. confirmation,
    // cancellation, deposits, handover records, late return, checks. No invented
    // numbers: every deadline and formula is quoted from the Terms (§6, §7, §8, §9).
    faq: [
      {
        q: "When is the reservation confirmed, and when is payment taken?",
        a: "When you send a request, the amount is only authorised – the reservation is not yet confirmed. It is confirmed once the owner accepts the request and payment goes through. The rental amount and the deposit are taken at that point.",
      },
      {
        q: "Which cancellation terms apply to a reservation?",
        a: "Every listing carries one of three cancellation policies. Flexible – the full rental price is refunded if you cancel at least 24 hours ahead. Moderate – the full price is refunded if you cancel at least 5 days ahead, and 50% with 1–4 days left. Strict – 50% is refunded if you cancel at least 14 days ahead. Moderate applies unless the listing says otherwise. Clearly disclosed non-refundable fees are not returned, and the deposit comes back in full on a reservation cancelled before handover.",
        link: { label: "Cancellation terms", href: "/naudojimosi-salygos" },
      },
      {
        q: "How does the deposit work, and what am I liable for?",
        a: "The deposit is usually taken together with the reservation payment once the owner accepts the request. It is returned after the reservation ends if no justified claim is filed within the set period. The deposit is not insurance and does not cap your liability – a justified claim can come to more than the deposit.",
      },
      {
        q: "How should I record the handover and return of the item?",
        a: "When you collect and return the item, check its condition, what it comes with, its accessories, any visible defects and, where applicable, the serial number. Save clear photos or video in the app and flag anything that does not match. These records can become important evidence if a claim is examined.",
      },
      {
        q: "What happens if I return the item late?",
        a: "For each started 24-hour period of delay, a fee of two days’ rental price may apply. There is no free grace period. The total cannot exceed the lower of two limits: seven days’ rental price, or the item’s replacement value stated in the listing. The exact formula and the maximum possible amount are shown before you confirm payment.",
      },
      {
        q: "What do checks confirm — and what don’t they guarantee?",
        a: "For some features, users have to confirm their email, phone number or identity. The payment service provider may also run its own payment and compliance checks. These checks do not assess an item’s condition and do not guarantee the outcome of a rental. Naudokis does not physically inspect every item or handover, so review the listing, the owner’s profile and the item itself before renting.",
      },
    ],
    // ⚠️ DRAFT (2026-07-22): owner-side questions — fees, accepting requests, payouts
    // and holds, evidence deadlines, renter cancellations, business obligations.
    // Same rule as the renter set: no invented numbers, only the Terms’ own wording.
    faqOwner: [
      {
        q: "How much does listing an item cost?",
        a: "You can publish a listing with no upfront fee. Platform fees for a specific reservation are shown before you accept the request. Any change to those fees applies only to future reservations.",
      },
      {
        q: "Do I have to accept every request?",
        a: "No. Before you decide, review the renter’s profile, the rental dates and the final amount. Accept or decline the request by the deadline shown. If you do not respond in time, the request lapses and the renter’s payment is not taken.",
      },
      {
        q: "When is a payout initiated, and why can it be held?",
        a: "A payout is initiated once the reservation is properly completed, the payment has finally settled, and there is no active dispute or refund, or any account, compliance or tax restriction. If one side confirms the return and the other files no justified claim within 3 calendar days, the reservation completes automatically. How long the transfer takes depends on the payment service provider, the bank and any checks.",
      },
      {
        q: "How long do I have to file a damage claim?",
        a: "File your damage claim and initial evidence within 24 hours of the confirmed return. If the return was not confirmed, the deadline runs from the scheduled return time. The renter normally has 7 calendar days to respond with their own evidence.",
        link: { label: "Deposits and damage", href: "/naudojimosi-salygos" },
      },
      {
        q: "What happens if the renter cancels?",
        a: "The cancellation policy chosen for the listing applies – flexible, moderate or strict. If you chose no policy, moderate applies. The share of the rental price refunded to the renter is calculated according to that policy, and the deposit is returned in full on a reservation cancelled before handover.",
      },
      {
        q: "What should I know if I rent out as a business?",
        a: "When you rent out as a business, you are yourself responsible for the consumer protection, product safety, tax, VAT, invoicing and accounting obligations that apply to you. Business status is shown on your profile and during the reservation. You may need to confirm your business details, right of representation, tax details and consent to invoices being issued in your name. If the required information is missing, publishing listings, accepting requests or payouts may be restricted.",
      },
    ],
    ctaEyebrow: "The app",
    ctaPhoneAlt: "Naudokis app",
    // DRAFT — English rendering of the app's own Lithuanian screen labels. The
    // shipped app is Lithuanian; these are the marketing-site equivalents and
    // need sign-off before launch.
    screen: {
      item: "Bosch rotary hammer",
      itemCat: "Tools",
      itemPrice: "€18/day",
      dates: "March 12 – 15",
      days: "3 days",
      renter: "Marius K.",
      renterInitial: "M",
      rentLabel: "Rental total",
      rentValue: "€54",
      feeLabel: "Platform fee",
      feeValue: "− €5.40",
      payoutLabel: "Your payout",
      payoutValue: "€48.60",
      photosLabel: "Photos",
      addPhoto: "Add",
      conditionLabel: "Item condition",
      conditionGood: "Good",
      conditionWorn: "Light wear",
      conditionDamaged: "Damaged",
      confirm: "Confirm",
      search: {
        title: "Search",
        placeholder: "What are you looking for?",
        catsLabel: "Item categories",
        cats: ["Tools", "Vehicles", "Electronics", "Sports gear", "Events"],
      },
      reserve: {
        title: "Rental request",
        rentalLabel: "Rental details",
        cancelLabel: "Cancellation",
        cancelValue: "Flexible",
        handoffLabel: "Handover",
        pickup: "Pick-up",
        delivery: "Delivery",
        feesLabel: "Payment summary",
        rentRow: "Rental × 3 days",
        deliveryValue: "€5",
        depositLabel: "Deposit",
        depositValue: "€50",
        totalLabel: "Total",
        totalValue: "€109",
        cta: "Reserve payment · €109",
      },
      pickup: {
        title: "Item handover",
        intro: "Record the condition — it protects both sides.",
        photoCount: "0 / 8",
        camera: "Take photo",
        gallery: "From gallery",
        goodHint: "No visible defects",
      },
      review: {
        title: "Review",
        prompt: "Share your experience",
        placeholder: "Write a review…",
        cta: "Submit review",
      },
      list: {
        title: "New listing",
        heading: "Upload photos of your item",
        body: "Add up to 10 clear photos. The first one is the listing's main photo.",
        photoCount: "3 / 10",
        cover: "Cover",
        cta: "Continue",
      },
      accept: {
        title: "Request review",
        renterLabel: "Renter",
        rating: "4.9",
        rentals: "· 12 rentals",
        earningsLabel: "Payout",
        reject: "Decline",
        accept: "Accept",
      },
      handover: {
        title: "Item return",
        intro: "Compare the condition with the handover record.",
        photoCount: "2 / 8",
        goodHint: "Returned in order",
      },
      payout: {
        title: "Rental completion",
        meta: "March 12–15 · 3 days · Marius K.",
        amount: "+ €48.60",
        rateLabel: "Rate the renter",
      },
    },
  },
  homeSteps: {
    eyebrow: "How it works",
    title: "A rental from start to finish",
    lead: "Four clear stages – from finding an item or posting a listing to return and completion.",
    steps: [
      {
        kicker: "Search",
        title: "Find or offer an item",
        body: "Compare rental listings on the website, or post a listing for your own item in the app.",
      },
      {
        kicker: "Request",
        title: "Send or accept a request",
        body: "The renter reviews the final amount and sends a reservation request; the owner confirms or declines it.",
      },
      {
        kicker: "Handover",
        title: "Record the handover and return",
        body: "When handing the item over and taking it back, record its condition, photos, notes and what it comes with.",
      },
      {
        kicker: "Completion",
        title: "Confirm the end of the rental",
        body: "Confirm the return, attach evidence if needed, and leave a review once the rental is complete.",
      },
    ],
    ctaLabel: "See the full process",
  },
  cta: {
    eyebrow: "The app",
    title: "Browse online. Send your request in the app.",
    body: "In the app, choose your rental dates and handover method, review the final amount and authorise payment. The request is sent to the owner, and the reservation is confirmed once they accept it and payment succeeds. Manage messages, handover and return in one place.",
    phoneAlt: "Reservation screen in the Naudokis app",
  },
  faq: {
    eyebrow: "Questions?",
    heading: "What to know before renting",
    subheading:
      "Quick answers about the agreement, confirmation, price, cancellation, deposits and checks.",
    // Ordered by renter anxiety, not company narrative: who am I dealing with → when
    // am I committed → what does it cost → what if it goes wrong. Every answer ends on
    // a concrete outcome, a timing condition or a policy link. Wording tracks the Terms
    // (§4, §6, §7, §9) — note the "generally" hedges: the Terms don't promise a single
    // outcome for cancellations, so neither does this copy.
    items: [
      {
        q: "Who am I renting from?",
        a: "You rent directly from a private or business owner. Naudokis provides the tools for searching, reserving, paying, handover and dispute handling, but is generally not the owner of the item or a party to the rental agreement.",
      },
      {
        q: "When is my reservation confirmed?",
        a: "Your reservation is confirmed only once the owner accepts the request and payment goes through. A payment authorisation on its own does not mean the reservation is confirmed.",
      },
      {
        q: "What will I pay?",
        a: "The owner sets the rental price and the deposit, and Naudokis may add clearly disclosed platform and other fees. Before you pay, the app shows the rental price, any delivery fee, other fees, the deposit, the cancellation terms and the total.",
      },
      {
        q: "What happens if someone cancels?",
        a: "It depends on who cancels and when. If you cancel before the owner accepts, the payment is generally not taken — the authorisation is released or the amount is refunded through Stripe. If the reservation is already confirmed, the cancellation terms shown before payment apply, alongside your statutory consumer rights. If the owner cancels before handover, a full refund is generally initiated.",
        link: { label: "Cancellation terms", href: "/naudojimosi-salygos" },
      },
      {
        q: "What happens if an item is damaged, late or not returned?",
        a: "Both sides can submit photos, messages and other evidence. The deposit can cover a justified claim, but it is not insurance and does not cap the renter's liability. The owner has 24 hours from the confirmed return to file a claim, and the renter has 7 days to respond.",
        link: { label: "Deposits and damage", href: "/naudojimosi-salygos" },
      },
      {
        q: "What do profile checks mean?",
        a: "Profile badges show which checks have been completed. They do not confirm an item's condition, provide insurance or guarantee the transaction, so review the profile, the listing and the applicable terms before you reserve.",
      },
      {
        q: "Can I search across Lithuania?",
        a: "Yes, you can search anywhere in Lithuania. How much is on offer depends on the city and the category, so in some places the choice may still be limited.",
        link: { label: "Browse categories", href: "/nuoma" },
      },
      {
        q: "What can I do on the website and in the app?",
        a: "On the website you can search and compare listings. In the app you pick dates and a handover method, see the full amount, send the request, pay, message the owner, and keep a record of handover and return.",
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
    copyright: ({ year, legalName }) =>
      `© ${year} ${legalName}. All rights reserved.`,
    socialLabel: "Social media",
    paymentLabel: "Accepted payment methods",
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
    mapNotice:
      "The map loads only after you choose it. Google may receive your IP address and device data.",
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
    reviewsEmptyBody:
      "No reviews yet. Review the owner profile and terms before sending a request.",
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
    noReviewsYet: "No reviews yet",
    noPhotos: "No photos",
    galleryAll: (n) => `All ${n} photos`,
    galleryExpand: "Expand photo",
    galleryViewLabel: "Photo gallery",
    galleryClose: "Close gallery",
    galleryPrev: "Previous photo",
    galleryNext: "Next photo",
    galleryImageError: "Couldn’t load this photo",
    galleryCounter: (index, total) => `Photo ${index} of ${total}`,
    // DRAFT — marketing sign-off pending (booking-panel trust rows + CTA note)
    ratingLinkLabel: ({ rating, count }) =>
      `Rated ${rating} out of 5, ${count} review${count === 1 ? "" : "s"} — go to reviews`,
    trustDepositRest: "deposit, refunded after the rental",
    reserveNote:
      "You won't be charged yet — the amount is only reserved until the owner confirms",
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
    calRangeSelected: ({ start, end, days }) =>
      `Selected ${start}–${end}, ${days}.`,
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
    termCancelLabel: "Cancellation terms",
    termCancelTitle: (tier) => {
      if (tier === "flexible") return "Free cancellation until 24 h before";
      if (tier === "strict") return "50% refund if cancelled 14+ days ahead";
      return "Free cancellation up to 5 days before";
    },
    termCancelDetail: (tier) => {
      if (tier === "flexible") return null;
      if (tier === "moderate") return "50% refund when 1–4 days remain";
      return "No refund after that";
    },
    trustCancellation: (tier) => {
      if (tier === "flexible")
        return "Free cancellation until 24 h before the rental";
      if (tier === "strict") return "50% refund if cancelled 14+ days ahead";
      return "Free cancellation up to 5 days before the rental";
    },
    discountsLabel: "Longer-rental discounts",
    discountFrom: (n) => `From ${n} day${n === 1 ? "" : "s"}`,
    perDayAbbr: "/ day",
    discountsHintIdle: "Applied automatically based on rental length",
    discountsHintBelow: ({ days, minDays }) =>
      `${days} day${days === 1 ? "" : "s"} selected — discounts start at ${minDays} days`,
    discountsHintActive: ({ days, percent }) =>
      `Your ${days}-day rental gets −${percent}% off`,
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
    loading: "Loading…",
    backToTop: "Back to top",
  },
  categoriesPage: {
    metaTitle: "Item rental categories in Lithuania | Naudokis.lt",
    metaDescription:
      "Browse rental categories on Naudokis.lt, from tools and transport to cameras, electronics, home gear and leisure equipment.",
    crumb: "Categories",
    eyebrow: "Browse",
    title: "All rental categories",
    // DRAFT (2026-07 Kategorijos v2 directory): EN copy pending marketing sign-off.
    body: "Pick a category or go straight to a subcategory — each one opens as a full listings feed with filters.",
    searchPlaceholder: "Search categories or subcategories",
    searchLabel: "Search rental categories and subcategories",
    emptyTitle: "No categories found",
    emptySubtitle: (query) =>
      `No categories or subcategories matched “${query}”. Try a broader search.`,
    emptyAction: "Show all categories",
    countLabel: (cats, subs) =>
      `${cats} categor${cats === 1 ? "y" : "ies"} · ${subs} subcategor${subs === 1 ? "y" : "ies"}`,
    subCount: (n) => `${n} subcategor${n === 1 ? "y" : "ies"}`,
    moreCount: (n) => `${n} more subcategor${n === 1 ? "y" : "ies"}`,
    showLess: "Show less",
    popularHeading: "Popular right now",
    allListingsLabel: (title) => `All “${title}” listings`,
    gridHeading: "Categories and subcategories",
    synonyms: (id) => EN_CATEGORY_SYNONYMS[id],
    searchItems: (query) => `Search items for “${query}”`,
    seoHeading: "Item rental by category",
    seoBody:
      "Naudokis.lt covers everyday rental categories across Lithuania, including tools, transport, photo gear, electronics, home appliances, event equipment and leisure gear. Choose a category or a specific subcategory to find items nearby without buying things you only need occasionally.",
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
    subtitleAll:
      "Compare prices, locations, handover options and owner profiles across Lithuania.",
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
    priceRangeAria: "Price range",
    priceMinAria: "Minimum price",
    priceMaxAria: "Maximum price",
    priceDone: "Done",
    dateLabel: "Dates",
    dateAny: "Any dates",
    dateBand: (from, to) => (from === to ? from : `${from}–${to}`),
    datePanelTitle: "Rental dates",
    datePrevMonth: "Previous month",
    dateNextMonth: "Next month",
    dateToday: "today",
    dateSelectStart: "Pick a start date",
    dateSelectEnd: "Pick an end date",
    dateWindowHint: (max) => `Up to ${max} days`,
    dateDays: (n) => `${n} day${n === 1 ? "" : "s"}`,
    dateStartSelected: (date) => `Start: ${date}. Now pick an end date.`,
    dateRangeSelected: ({ start, end, days }) =>
      `Selected ${start}–${end}, ${days}.`,
    dateBlocked: (reason, n) => {
      if (reason === "past") {
        return "Date has passed";
      }
      if (reason === "tooLong") {
        return `Longest window is ${n} day${n === 1 ? "" : "s"}`;
      }
      return "Unavailable date";
    },
    deliveryToggle: "Delivery available",
    depositToggle: "No deposit",
    depositUpTo: (max) => `Deposit up to €${max}`,
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
    pageEmptyBody:
      "The list of listings has changed, so this page is out of range. Head back to the start of the list.",
    pageEmptyAction: "Back to page 1",
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
  },
  offline: {
    title: "You’re offline",
    body: "Reconnect to load rentals and continue browsing.",
    retry: "Try again",
    timeoutTitle: "The server is taking too long",
    timeoutBody:
      "Your search and filters are preserved. Check your connection and try again.",
    serverTitle: "The service is temporarily unavailable",
    serverBody:
      "Your search and filters are preserved. Please try again in a moment.",
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
    storesDivider: "Also on",
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
    listBody:
      "Add photos, describe the condition and what is included, set the price and deposit. You approve each request.",
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
      description:
        "Changed your mind? Cancel your account deletion and keep using Naudokis.",
    },
    title: "Keep your account?",
    body: "You can cancel account deletion within 30 days of submitting the request. Confirm below if you want to keep your account.",
    confirm: "Cancel deletion",
    successTitle: "Account deletion cancelled",
    successBody:
      "Your account deletion has been cancelled. You can sign in again in the app.",
    successCta: "Open the app",
    invalidTitle: "Link not valid",
    invalidBody:
      "This link is invalid or has expired. If you need help, email info@naudokis.lt.",
    alreadyTitle: "Link no longer valid",
    alreadyBody:
      "The link has already been used or the 30-day period has ended. If you cannot sign in or are unsure of the account status, email info@naudokis.lt.",
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
    openHint:
      "Nothing happened? Then you don’t have the app yet — get it below.",
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
