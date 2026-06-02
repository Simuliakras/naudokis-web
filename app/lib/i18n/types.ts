// The translation contract. Both dictionaries must satisfy `Dict`, so adding a
// string here forces both locales to provide it (compile-time safety).
import type { IconName } from "@/app/components/ui";

export type FaqItem = { q: string; a: string };
export type FeatureItem = { icon: IconName; title: string; body: string };

export type Dict = {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogLocale: string; // e.g. "lt_LT" / "en_US"
    ogImageAlt: string;
  };
  nav: {
    search: string;
    category: string;
    contacts: string;
  };
  hero: {
    badge: string;
    title: string;
    body: string;
    phoneAlt: string;
  };
  search: {
    placeholder: string;
    where: string;
    submit: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    all: string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
  };
  offers: {
    eyebrow: string;
    title: string;
    errorTitle: string;
    errorSubtitle: string;
    errorAction: string;
    emptyTitle: string;
    emptySubtitle: (query: string) => string;
    emptyAction: string;
  };
  features: [FeatureItem, FeatureItem, FeatureItem];
  testimonials: {
    eyebrow: string;
    title: string;
    quote: string;
  };
  cta: {
    title: string;
    body: string;
    phoneAlt: string;
  };
  faq: {
    heading: string;
    subheading: string;
    items: FaqItem[];
  };
  footer: {
    links: string[];
  };
  listingSheet: {
    back: string;
    close: string;
    nextImage: string; // gallery "show next image" control label
    tags: string[];
    descriptionHeading: string;
    description: string;
    specsHeading: string; // attributes section heading
    ownerHeading: string; // owner section heading
    ownerVerified: string; // verified-owner badge label
    ownerRentals: string; // label for completed-rentals count, rendered "<label>: <n>"
    perDay: string;
    reserve: string;
  };
  common: {
    favorite: string; // aria-label on the heart button
    perDay: string; // price unit on cards
    reviewCount: (count: number) => string; // localized, pluralized review count
    sampleCity: string; // sample listing city
    samplePrice: string; // sample listing price
  };
};
