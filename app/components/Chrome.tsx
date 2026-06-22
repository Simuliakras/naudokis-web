"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal and the sticky app banner. Legal pages keep the modal/nav/
// footer but pass `banner={false}` to drop the sticky install banner, clearing
// the fixed-action zone for their TOC drawer / back-to-top controls.
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
