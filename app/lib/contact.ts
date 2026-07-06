// Single source of truth for Naudokis contact details. These are brand
// constants (not translatable copy), so they live here rather than in the
// dictionaries — shared by the marketing footer and the legal pages.
export const CONTACT_EMAIL = "info@naudokis.lt";
export const CONTACT_PRIVACY_EMAIL = "privacy@naudokis.lt";
export const CONTACT_PHONE = "+370 643 49559";

// `tel:`-safe form of CONTACT_PHONE (no spaces).
export const CONTACT_PHONE_TEL = "tel:" + CONTACT_PHONE.replace(/\s+/g, "");

// Native app store listings — the production URLs the previous site already
// linked to. Used by the SoftwareApplication JSON-LD (app-launch signal) and the
// deep-link fallback page. APP_STORE_ID also drives the iOS Safari Smart App
// Banner (`itunes` metadata in the root layout) — one source for both.
export const APP_STORE_ID = "6753683957";
export const APP_STORE_URL = `https://apps.apple.com/lt/app/naudokis/id${APP_STORE_ID}`;
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.naudokis.naudokis";

// The OS-sniffing smart-install URL the static QR encodes (see
// scripts/generate-install-qr.mjs) — canonical absolute form for share/email links.
export const SMART_INSTALL_URL = "https://www.naudokis.lt/go";

// Official brand profiles emitted as schema.org `sameAs` on the Organization node
// and rendered in the footer. Only real brand URLs belong here.
export const SOCIAL_PROFILES = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61581076403677",
    icon: "Facebook",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/naudokis/",
    icon: "Linkedin",
  },
] as const;

export const SOCIAL_LINKS: string[] = SOCIAL_PROFILES.map((profile) => profile.href);
