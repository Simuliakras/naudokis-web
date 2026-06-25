"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal.
import { AppRedirect } from "./AppRedirect";

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppRedirect />
    </>
  );
}
