// Single source of truth for Naudokis contact details. These are brand
// constants (not translatable copy), so they live here rather than in the
// dictionaries — shared by the marketing footer and the legal pages.

// Registered trading entity. Published two ways that must never disagree: the
// Organization JSON-LD (legalName / identifier, app/lib/seo.ts) and the visible
// footer line. Structured data has to mirror what the page states, and an
// operating entity is exactly the sort of claim that must not drift between the
// two — hence one definition rather than a literal in each place.
export const LEGAL_NAME = "MB Naudokis";
export const COMPANY_CODE = "307423504";

// Year in the footer rights notice. Injected by next.config.ts `env` so the SAME
// literal is inlined into the server and client bundles: the Footer renders
// inside "use client" screens (feed, categories, status…), so computing the year
// at render time would print the build year in the prerendered HTML and the
// current year during hydration — a mismatch that would persist all year, not
// just over New Year. The fallback only runs outside a Next build (unit tests).
export const COPYRIGHT_YEAR = process.env.BUILD_YEAR ?? String(new Date().getFullYear());

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

// Canonical origin — the one definition of where this site lives. It lives here, in
// the leaf constants module, so client components (the /invite QR needs an absolute
// URL) can import it without pulling the whole SEO module graph into the bundle.
// app/lib/seo.ts re-exports it as SITE_URL.
export const SITE_ORIGIN = "https://www.naudokis.lt";

// The OS-sniffing smart-install URL the static QR encodes (see
// scripts/generate-install-qr.mjs) — canonical absolute form for share/email links.
export const SMART_INSTALL_URL = `${SITE_ORIGIN}/go`;

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
