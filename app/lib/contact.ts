// Single source of truth for Naudokis contact details. These are brand
// constants (not translatable copy), so they live here rather than in the
// dictionaries — shared by the marketing footer and the legal pages.
export const CONTACT_EMAIL = "info@naudokis.lt";
export const CONTACT_PRIVACY_EMAIL = "privacy@naudokis.lt";
export const CONTACT_PHONE = "+370 643 49559";

// `tel:`-safe form of CONTACT_PHONE (no spaces).
export const CONTACT_PHONE_TEL = "tel:" + CONTACT_PHONE.replace(/\s+/g, "");

// Official brand profiles (social, App Store, Google Play) emitted as schema.org
// `sameAs` on the Organization node so search engines can reconcile the entity.
// Empty until real URLs exist — `organizationJsonLd` only emits `sameAs` when this
// is non-empty, so no placeholder/wrong URLs ever reach the markup.
export const SOCIAL_LINKS: string[] = [];
