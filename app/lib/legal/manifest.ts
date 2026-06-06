// Legal manifest access + URL mapping. Small + pure, so safe to import from both
// server and client modules (it never pulls in the heavy per-document JSON).
import type { Locale } from "@/app/lib/i18n/config";
import { localePrefix } from "@/app/lib/i18n/config";
import manifestData from "./data/manifest.json";
import { truncate } from "./format";
import type { LegalManifest, LegalDocMeta } from "./types";

const MANIFEST = manifestData as LegalManifest;

export function getLegalManifest(): LegalManifest {
  return MANIFEST;
}

export function getLegalDocMeta(id: string): LegalDocMeta | undefined {
  return MANIFEST.docs.find((d) => d.id === id);
}

// The two primary documents keep their pretty top-level LT/EN routes; everything
// else lives under the Policy Center hub at /teisine/<id>.
export const CANONICAL_PATHS: Record<string, string> = {
  "privacy-policy": "/privatumo-politika",
  "terms-of-use": "/naudojimo-taisykles",
};

// Documents that are NOT reachable under /teisine/[slug] (they have their own
// dedicated routes) — used to exclude them from generateStaticParams.
export const CANONICAL_IDS = Object.keys(CANONICAL_PATHS);

// In-app, locale-correct path for a document id. Canonical docs resolve to their
// pretty route; all others to /teisine/<id>.
export function legalHref(docId: string, locale: Locale): string {
  const path = CANONICAL_PATHS[docId] ?? `/teisine/${docId}`;
  return `${localePrefix(locale)}${path}`;
}

// Locale-correct href for a doc, honouring its hasEn flag: LT-only docs always
// link to the LT URL so the link never lands on a missing translation.
export function docHref(doc: LegalDocMeta, locale: Locale): string {
  return legalHref(doc.id, doc.hasEn ? locale : "lt");
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
