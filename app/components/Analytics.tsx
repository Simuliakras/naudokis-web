"use client";
// Plausible loader. It is cookieless and stores no identifiers, so it is not gated
// on the attribution choice (that choice governs AppsFlyer — see app/lib/consent.ts).
//
// It is, however, kept off the token-bearing account-action pages entirely. The
// script reports `location.href`, which on those pages contains a single-use token
// that authorizes a real account action; Plausible's own page exclusion is
// server-side, so it would still receive the URL first. Not loading it is the only
// way to guarantee the token never leaves the browser.
import Script from "next/script";
import { usePathname } from "next/navigation";
import { isTokenizedPath } from "@/app/lib/app-links";

export function Analytics({ domain, src }: { domain: string; src: string }) {
  const pathname = usePathname();
  if (isTokenizedPath(pathname)) {
    return null;
  }
  return <Script defer data-domain={domain} src={src} strategy="afterInteractive" />;
}
