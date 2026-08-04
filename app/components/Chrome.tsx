"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal.
//
// The three dynamic(ssr:false) children below all import components/overlays.css,
// and that dynamism is load-bearing beyond the JS: Next hoists a lazily-imported
// component's CSS into the route's render-blocking <link> set as soon as ANY import
// of it is static. Making one of these a plain import puts ~14 KB of modal/banner
// CSS back in front of first paint on every route. BackToTop is deliberately NOT
// one of them — see overlays.css for why its CSS stays in globals.css.
import dynamic from "next/dynamic";
import { BackToTop } from "./BackToTop";
import { GA_ENABLED } from "@/app/lib/analytics";

const AppRedirect = dynamic(() => import("./AppRedirect").then((m) => m.AppRedirect), {
  ssr: false,
});

// The install-attribution prompt: opened from any install CTA that finds no stored
// choice. Mounted here so every page has it (see app/lib/consent.ts).
const ConsentSheet = dynamic(() => import("./ConsentSheet").then((m) => m.ConsentSheet), {
  ssr: false,
});

// The analytics (Google Analytics) consent banner: shows once while no choice is
// stored. ssr:false keeps it out of the SSR HTML and the LCP path.
const ConsentBanner = dynamic(() => import("./ConsentBanner").then((m) => m.ConsentBanner), {
  ssr: false,
});

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppRedirect />
      <ConsentSheet />
      {/* GA_ENABLED is a build-time constant (NEXT_PUBLIC_GA_ID), so an unconfigured
          build drops the import entirely rather than shipping a chunk that renders
          null — which is what "no id, no banner" is supposed to mean. */}
      {GA_ENABLED && <ConsentBanner />}
      <BackToTop />
    </>
  );
}
