"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal and the sticky app banner. Legal pages opt out (no
// redirect UI per spec) by simply not wrapping their content in <Chrome/>.
import { AppRedirect } from "./AppRedirect";
import { StickyAppBanner } from "./StickyAppBanner";

export function Chrome({ children, banner = true }: { children: React.ReactNode; banner?: boolean }) {
  return (
    <>
      {children}
      <AppRedirect />
      {banner && <StickyAppBanner />}
    </>
  );
}
