"use client";
// Site chrome for Locked-mode pages: renders the page body plus the shared
// app-redirect modal.
import dynamic from "next/dynamic";

const AppRedirect = dynamic(() => import("./AppRedirect").then((m) => m.AppRedirect), {
  ssr: false,
});

export function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AppRedirect />
    </>
  );
}
