"use client";
// On client-side route changes the document scroll position is not reset by
// default (Next 16 ships scrollRestoration off), so every new page would open
// wherever the previous one was scrolled. This leaf resets to the top whenever
// the pathname changes — skipping the first mount (browser handles the initial
// load) and any navigation that targets an in-page anchor (#hash).
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/app/lib/motion";

export function ScrollToTop() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (window.location.hash) {
      return;
    }
    // "instant" so smooth-scroll CSS doesn't animate the jump on navigation
    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion() ? "auto" : "instant" });
  }, [pathname]);

  return null;
}
