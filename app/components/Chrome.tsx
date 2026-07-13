"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal.
import dynamic from "next/dynamic";

const AppRedirect = dynamic(() => import("./AppRedirect").then((m) => m.AppRedirect), {
  ssr: false,
});

// The install-attribution prompt: opened from any install CTA that finds no stored
// choice. Mounted here so every page has it (see app/lib/consent.ts).
const ConsentSheet = dynamic(() => import("./ConsentSheet").then((m) => m.ConsentSheet), {
  ssr: false,
});

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppRedirect />
      <ConsentSheet />
    </>
  );
}
