import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/app/lib/i18n/config";

const SITE_URL = "https://naudokis.lt";

// Lithuanian is served unprefixed at "/"; English lives at "/en".
const localePath = (locale: string) => (locale === defaultLocale ? "/" : `/${locale}`);

const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}${localePath(l)}`]));

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    changeFrequency: "weekly",
    priority: locale === defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
