import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/app/lib/i18n/config";

const SITE_URL = "https://naudokis.lt";

// Lithuanian is served unprefixed at "/"; English lives at "/en".
const localePrefix = (locale: string) => (locale === defaultLocale ? "" : `/${locale}`);

// Static, indexable routes (bare paths). Listing-detail pages (/skelbimai/[id])
// are unbounded dynamic data and intentionally excluded.
const PATHS = ["", "/kategorijos", "/skelbimai", "/privatumo-politika", "/naudojimo-taisykles"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, `${SITE_URL}${localePrefix(l)}${path || "/"}`]),
    );
    return locales.map((locale) => ({
      url: `${SITE_URL}${localePrefix(locale)}${path || "/"}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? (locale === defaultLocale ? 1 : 0.8) : 0.6,
      alternates: { languages },
    }));
  });
}
