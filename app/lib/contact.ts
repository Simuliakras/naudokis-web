// Single source of truth for Naudokis contact details. These are brand
// constants (not translatable copy), so they live here rather than in the
// dictionaries — shared by the marketing footer and the legal pages.
export const CONTACT_EMAIL = "info@naudokis.lt";
export const CONTACT_PRIVACY_EMAIL = "privacy@naudokis.lt";
export const CONTACT_PHONE = "+370 643 49559";

// `tel:`-safe form of CONTACT_PHONE (no spaces).
export const CONTACT_PHONE_TEL = "tel:" + CONTACT_PHONE.replace(/\s+/g, "");
