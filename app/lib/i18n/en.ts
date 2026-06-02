// English dictionary — full translations of the Lithuanian source copy.
import type { Dict } from "./types";

export const en: Dict = {
  meta: {
    title: "Naudokis.lt — rent items from trusted neighbours",
    description:
      "Top-quality peer-to-peer rentals from trusted neighbours in Lithuania — tools, vehicles, photo gear, leisure equipment. Rent it. Naudokis.",
    keywords: [
      "item rental", "rental", "Naudokis", "tool rental", "vehicle rental",
      "camera rental", "P2P rental", "Lithuania", "neighbour rental",
    ],
    ogLocale: "en_US",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Search",
    category: "Categories",
    contacts: "Contact",
  },
  hero: {
    badge: "Join 10,000+ neighbours in Lithuania",
    title: "Borrow what you need today.",
    body: "Top-quality rentals from trusted neighbours. From professional photo gear to leisure equipment.",
    phoneAlt: "Naudokis app",
  },
  search: {
    placeholder: "What do you need?",
    where: "Where?",
    submit: "Search",
  },
  categories: {
    eyebrow: "Discover",
    title: "Categories",
    all: "All categories",
    errorTitle: "Couldn’t load categories",
    errorSubtitle: "Something went wrong while loading categories. Check your internet connection and try again.",
    errorAction: "Try again",
    emptyTitle: "No categories found",
    emptySubtitle: (query) => `We couldn’t find any category matching “${query}”. Try another search or browse all categories.`,
    emptyAction: "Show all categories",
  },
  offers: {
    eyebrow: "Recommended",
    title: "Best offers near you",
    errorTitle: "Couldn’t load listings",
    errorSubtitle: "Something went wrong while loading listings. Check your internet connection and try again.",
    errorAction: "Try again",
    emptyTitle: "Nothing matched your search",
    emptySubtitle: (query) => `We couldn’t find any listings for “${query}”. Try another keyword or city, or clear your search.`,
    emptyAction: "Clear search",
  },
  features: [
    { icon: "Users", title: "Verified community", body: "Every user is carefully verified, ensuring the highest standards of trust in every transaction." },
    { icon: "ShieldCheck", title: "Secure payments", body: "Our platform holds the payment securely and releases it to the owner only once the deal is successfully completed." },
    { icon: "MapPin", title: "In your neighbourhood", body: "Discover useful items just across the street. Let’s strengthen the local community together." },
  ],
  testimonials: {
    eyebrow: "Reviews",
    title: "What our community says",
    quote: "“Amazing experience! I rented a Sony camera for the weekend — everything went smoothly and the owner was super helpful. I saved hundreds of euros.”",
  },
  cta: {
    title: "Download and try it today",
    body: "Top-quality rentals from trusted neighbours. From professional photo gear to leisure equipment.",
    phoneAlt: "Naudokis app",
  },
  faq: {
    heading: "Frequently asked questions",
    subheading: "Got questions? We’ve prepared answers to the doubts that come up most often.",
    items: [
      { q: "What fees apply on the Naudokis.lt rental platform?", a: "Searching and renting items is free. Owners pay only a small, transparent commission after a successful rental." },
      { q: "How do you keep rentals and payments secure?", a: "The rental payment is held and transferred to the owner only once the deal has been successfully completed." },
      { q: "What equipment or items can be rented on the platform?", a: "Everything from photo and video gear to tools, vehicles, home appliances and leisure equipment." },
      { q: "Can I find equipment to rent across all of Lithuania?", a: "Yes — handy filters and categories help you quickly find what you need in any Lithuanian city." },
      { q: "How do I set the optimal rental price for my items?", a: "The platform suggests a recommended price based on similar listings, and the final decision is yours." },
      { q: "When will the mobile app be released?", a: "The app is already available on iOS and Android — download it from the App Store or Google Play." },
    ],
  },
  footer: {
    links: ["Privacy policy", "Terms of service", "Categories", "Contact"],
  },
  listingSheet: {
    back: "Back",
    close: "Close",
    nextImage: "Show next image",
    tags: ["Cars", "Transport & trailers"],
    descriptionHeading: "Description",
    description: "A powerful, reliable pickup — perfect for hauling cargo, road trips or work. Full tank, valid technical inspection, clean interior. Pickup available in Vilnius at an agreed time.",
    specsHeading: "Specifications",
    ownerHeading: "Owner",
    ownerVerified: "Verified",
    ownerRentals: "Completed rentals",
    perDay: "per day",
    reserve: "Reserve in the app",
  },
  common: {
    favorite: "Save",
    perDay: "per day",
    reviewCount: (n) => `${n} review${n === 1 ? "" : "s"}`,
    sampleCity: "Vilnius",
    samplePrice: "€50",
  },
};
