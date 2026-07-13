// Loader for legal documents. INVARIANT: import this only from Server
// Components — never from a "use client" module. That keeps the ~740 KB of
// document JSON out of client bundles. Each doc is pulled via a template-literal
// dynamic import, so the bundler emits one chunk per file and a statically
// rendered page only carries its own document. `server-only` makes a breach a build
// error rather than a silently fat bundle.
import "server-only";
import type { Locale } from "@/app/lib/i18n/config";
import { getLegalDocMeta } from "./manifest";
import type { LegalDocument } from "./types";

export type LoadedDoc = {
  doc: LegalDocument;
  usedLang: Locale; // the language actually rendered (may differ from requested)
  fellBack: boolean; // true when EN was requested but only LT exists
};

export async function getLegalDoc(slug: string, locale: Locale): Promise<LoadedDoc | null> {
  const info = getLegalDocMeta(slug);
  if (!info) {
    return null;
  }
  // LT-only docs always render LT; otherwise honour the requested locale.
  const wantLang: Locale = info.hasEn ? locale : "lt";
  try {
    const mod = await import(`./data/${slug}.${wantLang}.json`);
    return { doc: mod.default as LegalDocument, usedLang: wantLang, fellBack: wantLang !== locale };
  } catch (err) {
    // The manifest says this doc exists, so a failed import is a real
    // manifest↔file mismatch (or corrupt JSON) — surface it, then fall back to
    // the canonical LT file so the page still renders.
    console.error(`[legal] failed to load ${slug}.${wantLang}.json, falling back to LT`, err);
    const fallback = await import(`./data/${slug}.lt.json`);
    return { doc: fallback.default as LegalDocument, usedLang: "lt", fellBack: locale !== "lt" };
  }
}
