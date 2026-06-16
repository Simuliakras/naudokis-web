// ============================================================================
// MOCK FIXTURES — local-only sample data for design/screenshot work.
// Used ONLY when NEXT_PUBLIC_USE_MOCK=1 (see api.ts USE_MOCK); production hits
// the real backend. Content mirrors the design bundle's sample data so rendered
// pages line up with the design screenshots. Do NOT present as authoritative.
// ============================================================================

export type MockCategory = { id: string; name_lt: string; name_en: string; icon_name: string };

// Mirrors the backend's top-level taxonomy (GET /listings/categories): same ids,
// names and icon_name values, in display_order — so mock and live render alike.
export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "tools_construction", name_lt: "Įrankiai ir statyba", name_en: "Tools & Construction", icon_name: "wrench" },
  { id: "home_garden", name_lt: "Namai ir sodas", name_en: "Home & Garden", icon_name: "home" },
  { id: "transport", name_lt: "Transportas", name_en: "Transport", icon_name: "car" },
  { id: "photo_video", name_lt: "Fotografija ir video", name_en: "Photo & Video", icon_name: "camera" },
  { id: "audio_music_events", name_lt: "Garsas, muzika ir renginių technika", name_en: "Audio, Music & Event Tech", icon_name: "speaker" },
  { id: "electronics_tech", name_lt: "Elektronika ir technologijos", name_en: "Electronics & Tech", icon_name: "laptop" },
  { id: "sports_leisure", name_lt: "Sportas ir laisvalaikis", name_en: "Sports & Leisure", icon_name: "dumbbell" },
  { id: "events_parties", name_lt: "Renginiai ir šventės", name_en: "Events & Parties", icon_name: "party-popper" },
  { id: "clothing_accessories", name_lt: "Drabužiai ir aksesuarai", name_en: "Clothing & Accessories", icon_name: "shirt" },
  { id: "kids", name_lt: "Vaikams", name_en: "Kids", icon_name: "baby" },
  { id: "health_medical", name_lt: "Sveikata ir medicininė įranga", name_en: "Health & Medical Equipment", icon_name: "heart-pulse" },
  { id: "other", name_lt: "Kita", name_en: "Other", icon_name: "more-horizontal" },
];

export type MockListing = {
  id: string;
  title_lt: string;
  title_en: string;
  city: string;
  price_per_day_cents: number;
  rating_average: number;
  rating_count: number;
  category: string; // category id
  hasDelivery: boolean;
};

// First four match the home "Geriausi pasiūlymai" row (sections.jsx OFFERS).
export const MOCK_LISTINGS: MockListing[] = [
  { id: "dodge-ram-2016", title_lt: "Dodge RAM 2016", title_en: "Dodge RAM 2016", city: "Vilnius", price_per_day_cents: 5000, rating_average: 4.8, rating_count: 52, category: "transport", hasDelivery: false },
  { id: "sony-a7-iii", title_lt: "Sony A7 III", title_en: "Sony A7 III", city: "Kaunas", price_per_day_cents: 2500, rating_average: 4.9, rating_count: 38, category: "photo_video", hasDelivery: true },
  { id: "bosch-perforatorius", title_lt: "Bosch perforatorius", title_en: "Bosch rotary hammer", city: "Klaipėda", price_per_day_cents: 1200, rating_average: 4.7, rating_count: 21, category: "tools_construction", hasDelivery: true },
  { id: "sup-irklente", title_lt: "SUP irklentė", title_en: "SUP paddleboard", city: "Palanga", price_per_day_cents: 1800, rating_average: 5.0, rating_count: 64, category: "sports_leisure", hasDelivery: false },
  { id: "dji-mavic-3", title_lt: "DJI Mavic 3 dronas", title_en: "DJI Mavic 3 drone", city: "Vilnius", price_per_day_cents: 3500, rating_average: 4.9, rating_count: 27, category: "photo_video", hasDelivery: true },
  { id: "karcher-plovykla", title_lt: "Kärcher aukšto slėgio plovykla", title_en: "Kärcher pressure washer", city: "Kaunas", price_per_day_cents: 1500, rating_average: 4.6, rating_count: 19, category: "tools_construction", hasDelivery: true },
  { id: "stalo-tenisas", title_lt: "Stalo teniso stalas", title_en: "Table tennis table", city: "Šiauliai", price_per_day_cents: 1000, rating_average: 4.8, rating_count: 12, category: "sports_leisure", hasDelivery: false },
  { id: "epson-projektorius", title_lt: "Projektorius Epson", title_en: "Epson projector", city: "Vilnius", price_per_day_cents: 2000, rating_average: 4.7, rating_count: 33, category: "electronics_tech", hasDelivery: true },
  { id: "iskylos-palapine", title_lt: "Iškylos palapinė 4 vietų", title_en: "4-person camping tent", city: "Klaipėda", price_per_day_cents: 800, rating_average: 4.9, rating_count: 41, category: "sports_leisure", hasDelivery: false },
];

export type MockAttribute = { id: string; name_lt: string; name_en: string; value_lt: string; value_en: string };

export type MockOwner = {
  name: string;
  is_business: boolean;
  verified: boolean;
  completed_rentals: number;
  rating_average: number;
  rating_count: number;
};

export type MockReview = {
  name: string;
  date_lt: string;
  date_en: string;
  stars: number;
  text_lt: string;
  text_en: string;
};

export type MockDetailExtra = {
  description_lt: string;
  description_en: string;
  attributes: MockAttribute[];
  owner: MockOwner;
  reviews: MockReview[];
};

// Shared description + spec set applied to every mock listing detail. Enough to
// populate the listing-detail spec grid, tags and owner panel for the design pass.
export const MOCK_DETAIL_EXTRA: MockDetailExtra = {
  description_lt:
    "Tvarkingas, prižiūrėtas ir nuomai paruoštas daiktas. Komplektacija patikrinta prieš kiekvieną perdavimą, todėl tinka tiek savaitgalio planams, tiek rimtesniems projektams. Atsiimti galima Vilniuje arba susitarus dėl pristatymo.",
  description_en:
    "Clean, well-maintained item prepared for rental. The full kit is checked before every handover, making it suitable for weekend plans as well as more serious projects. Pickup is available in Vilnius, with delivery by arrangement.",
  attributes: [
    { id: "condition", name_lt: "Būklė", name_en: "Condition", value_lt: "Puiki", value_en: "Excellent" },
    { id: "deposit", name_lt: "Užstatas", name_en: "Deposit", value_lt: "100 €", value_en: "€100" },
    { id: "min-days", name_lt: "Min. nuoma", name_en: "Min. rental", value_lt: "1 diena", value_en: "1 day" },
    { id: "delivery", name_lt: "Pristatymas", name_en: "Delivery", value_lt: "Galimas", value_en: "Available" },
  ],
  owner: {
    name: "Eglė J.",
    is_business: false,
    verified: true,
    completed_rentals: 48,
    rating_average: 4.9,
    rating_count: 52,
  },
  reviews: [
    { name: "Greta M.", date_lt: "prieš 2 sav.", date_en: "2 weeks ago", stars: 5, text_lt: "Daiktas atitiko aprašymą, viskas veikė nepriekaištingai. Savininkė atsakė greitai, perdavimas buvo aiškus ir punktualus.", text_en: "The item matched the description and worked perfectly. The owner replied quickly, and the handover was clear and punctual." },
    { name: "Tomas K.", date_lt: "prieš mėnesį", date_en: "a month ago", stars: 5, text_lt: "Pilna komplektacija, gera būklė ir paprastas susitarimas dėl grąžinimo. Tikrai nuomočiausi dar kartą.", text_en: "Full kit, good condition and an easy return arrangement. I would definitely rent again." },
    { name: "Ieva P.", date_lt: "prieš 2 mėn.", date_en: "2 months ago", stars: 4, text_lt: "Patogus atsiėmimas ir aiškios sąlygos. Viskas vyko sklandžiai nuo rezervacijos iki grąžinimo.", text_en: "Convenient pickup and clear terms. Everything went smoothly from reservation to return." },
  ],
};
