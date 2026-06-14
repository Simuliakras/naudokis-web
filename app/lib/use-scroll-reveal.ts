// Reveals `.nk-reveal` elements on scroll by toggling `.nk-in` once they enter
// the viewport. Shared by the homepage and the standalone screens so the
// reveal thresholds stay in one place. A MutationObserver picks up elements
// mounted after the initial scan (e.g. feed cards arriving with query data).
import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("nk-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    const observeAll = (root: ParentNode) => {
      root.querySelectorAll(".nk-reveal:not(.nk-in)").forEach((el) => io.observe(el));
    };
    observeAll(document);
    // Reveal targets can mount anywhere (feed/category cards arriving with query
    // data), so the watch is intentionally body-wide; the per-mutation work is a
    // cheap querySelectorAll over the added subtree only.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) {
            return;
          }
          if (n.matches(".nk-reveal:not(.nk-in)")) {
            io.observe(n);
          }
          observeAll(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); };
  }, []);
}
