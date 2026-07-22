// Legal manifest access + URL mapping. Small + pure, so safe to import from both
// server and client modules (it never pulls in the heavy per-document JSON).
import type { Locale } from "@/app/lib/i18n/config";
import { localePath } from "@/app/lib/i18n/config";
import manifestData from "./data/manifest.json";
import { truncate } from "./format";
import type { LegalManifest, LegalDocMeta } from "./types";

const MANIFEST = manifestData as LegalManifest;

export function getLegalDocMeta(id: string): LegalDocMeta | undefined {
  return MANIFEST.docs.find((d) => d.id === id);
}

// The only published legal-document routes are Terms and Privacy. Account
// deletion remains a separate functional page and is linked directly by the
// footer rather than being presented as another legal policy.
export const CANONICAL_PATHS: Record<string, string> = {
  "privacy-policy": "/privatumo-politika",
  "terms-of-use": "/naudojimosi-salygos",
};

// In-app, locale-correct path for a published document id.
export function legalHref(docId: string, locale: Locale): string | undefined {
  const path = CANONICAL_PATHS[docId];
  // localePath, not a raw prefix: the English legal routes are localized too
  // ("/en/terms-of-service"), so concatenating would emit a legacy URL.
  return path ? localePath(locale, path) : undefined;
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
