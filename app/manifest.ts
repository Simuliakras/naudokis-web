import type { MetadataRoute } from "next";

// Root web app manifest (served at /manifest.webmanifest). Single, locale-agnostic
// manifest — the marketing site is one brand; copy stays in Lithuanian (default).
// Icons live under /naudokis/ so the locale proxy (which excludes that path) never
// rewrites them. The proxy matcher also excludes manifest.webmanifest itself.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Naudokis — daiktų nuoma iš žmonių šalia",
    short_name: "Naudokis",
    description:
      "Išsinuomokite įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą iš žmonių šalia.",
    start_url: "/",
    display: "standalone",
    background_color: "#282C2D",
    theme_color: "#282C2D",
    icons: [
      { src: "/naudokis/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/naudokis/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/naudokis/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
