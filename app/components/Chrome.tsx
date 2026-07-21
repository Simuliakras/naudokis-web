"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal.
import dynamic from "next/dynamic";
import { BackToTop } from "./BackToTop";

const AppRedirect = dynamic(() => import("./AppRedirect").then((m) => m.AppRedirect), {
  ssr: false,
});

// The install-attribution prompt: opened from any install CTA that finds no stored
// choice. Mounted here so every page has it (see app/lib/consent.ts).
const ConsentSheet = dynamic(() => import("./ConsentSheet").then((m) => m.ConsentSheet), {
  ssr: false,
});

export function Chrome({ children, backToTop = true }: { children: React.ReactNode; backToTop?: boolean }) {
  return (
    <>
      {children}
      <AppRedirect />
      <ConsentSheet />
      <BackToTop enabled={backToTop} />
    </>
  );
}
