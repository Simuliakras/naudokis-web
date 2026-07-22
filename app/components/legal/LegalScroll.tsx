"use client";
// Legal — the single scroll source for a reading page. One rAF-throttled window
// scroll/resize listener computes { progress, activeId } per frame from the
// heading `ids` and shares it via context, replacing the separate listeners the
// progress bar and scroll-spy TOC (sidebar + drawer) used to each run. Emits no
// DOM, so it can wrap server-rendered children.
//
// This used to also publish `scrolledDown` for a legal-only back-to-top button.
// That button is gone: the sitewide <BackToTop> (mounted by <Chrome>) is now the
// single implementation and owns its own threshold. Don't fold it back in here —
// it has to work on every page, not just the ones with a LegalScrollProvider.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const HEADING_OFFSET = 130; // scroll-spy lead: mark a heading active a little before it
                            // reaches the sticky nav (headings' scroll-margin-top is
                            // --nk-nav-h-scrolled + 24px in legal.css).
type LegalScrollState = { progress: number; activeId: string };

const LegalScrollContext = createContext<LegalScrollState>({ progress: 0, activeId: "" });

export function useLegalScroll(): LegalScrollState {
  return useContext(LegalScrollContext);
}

export function LegalScrollProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [state, setState] = useState<LegalScrollState>({ progress: 0, activeId: ids[0] ?? "" });
  const joined = ids.join("|");

  useEffect(() => {
    const headingIds = joined ? joined.split("|") : [];
    let frame = 0;
    const compute = () => {
      frame = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const progress = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0;
      const y = window.scrollY + HEADING_OFFSET;
      let activeId = headingIds[0] ?? "";
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= y) {
          activeId = id;
        }
      }
      setState({ progress, activeId });
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(compute);
      }
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [joined]);

  return <LegalScrollContext.Provider value={state}>{children}</LegalScrollContext.Provider>;
}
