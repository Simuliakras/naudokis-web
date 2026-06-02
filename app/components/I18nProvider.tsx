"use client";
// Bridges the active locale into the client component tree. The dictionary is
// derived from `locale` on the client so its function members (e.g. templated
// strings) never have to cross the server→client serialization boundary.
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/app/lib/i18n/config";
import type { Dict } from "@/app/lib/i18n/types";
import { getDictionary } from "@/app/lib/i18n/dictionaries";

type I18n = { locale: Locale; dict: Dict };

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<I18n>(() => ({ locale, dict: getDictionary(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
