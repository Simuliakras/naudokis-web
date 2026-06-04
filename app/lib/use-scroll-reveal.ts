// Reveals `.nk-reveal` elements on scroll by toggling `.nk-in` once they enter
// the viewport. Shared by the homepage and the standalone screens so the
// reveal thresholds stay in one place.
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
    document.querySelectorAll(".nk-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
