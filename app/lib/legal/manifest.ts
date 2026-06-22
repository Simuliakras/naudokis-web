// Legal manifest access + URL mapping. Small + pure, so safe to import from both
// server and client modules (it never pulls in the heavy per-document JSON).
import type { Locale } from "@/app/lib/i18n/config";
import { localePrefix } from "@/app/lib/i18n/config";
import manifestData from "./data/manifest.json";
import { truncate } from "./format";
import type { LegalManifest, LegalDocMeta } from "./types";

const MANIFEST = manifestData as LegalManifest;

export function getLegalDocMeta(id: string): LegalDocMeta | undefined {
  return MANIFEST.docs.find((d) => d.id === id);
}

// The two legal documents keep their pretty top-level LT/EN routes.
export const CANONICAL_PATHS: Record<string, string> = {
  "privacy-policy": "/privatumo-politika",
  "terms-of-use": "/naudojimosi-salygos",
  "account-deletion": "/paskyros-trynimas",
};

// In-app, locale-correct path for a document id. Only the canonical docs have
// real routes; any other id (e.g. a retired sub-document) resolves to undefined
// so callers can render it as plain text rather than link to a 404.
export function legalHref(docId: string, locale: Locale): string | undefined {
  const path = CANONICAL_PATHS[docId];
  return path ? `${localePrefix(locale)}${path}` : undefined;
}

// A doc's blurb in the requested locale, falling back to LT.
export function localizedBlurb(doc: LegalDocMeta, locale: Locale): string {
  return doc.blurb[locale] || doc.blurb.lt;
}

// Short meta description for a doc, from its manifest blurb (locale → LT
// fallback), truncated at ~160 chars. Falls back to the provided default.
export function legalBlurbDescription(docId: string, locale: Locale, fallback: string): string {
  const info = getLegalDocMeta(docId);
  const blurb = info ? localizedBlurb(info, locale) : "";
  if (!blurb) {
    return fallback;
  }
  return truncate(blurb, 160);
}
