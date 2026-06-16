"use client";
// Legal — the single scroll source for a reading page. One rAF-throttled window
// scroll/resize listener computes { progress, activeId, scrolledDown } per frame
// from the heading `ids` and shares it via context, replacing the four separate
// listeners the progress bar, scroll-spy TOC (sidebar + drawer) and back-to-top
// used to each run. Emits no DOM, so it can wrap server-rendered children.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const HEADING_OFFSET = 130; // scroll-spy lead: mark a heading active a little before it
                            // reaches the sticky nav (headings' scroll-margin-top is
                            // --nk-nav-h-scrolled + 24px in legal.css).
const TO_TOP_AFTER = 600; // px scrolled before the back-to-top button shows

type LegalScrollState = { progress: number; activeId: string; scrolledDown: boolean };

const LegalScrollContext = createContext<LegalScrollState>({ progress: 0, activeId: "", scrolledDown: false });

export function useLegalScroll(): LegalScrollState {
  return useContext(LegalScrollContext);
}

export function LegalScrollProvider({ ids, children }: { ids: string[]; children: ReactNode }) {
  const [state, setState] = useState<LegalScrollState>({ progress: 0, activeId: ids[0] ?? "", scrolledDown: false });
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
      setState({ progress, activeId, scrolledDown: window.scrollY > TO_TOP_AFTER });
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
