"use client";
// The one scroll-to-top control on the site, mounted sitewide by <Chrome>.
//
// No page opts in: the 600px threshold IS the "is this page long enough" test,
// so short pages never show it without anyone maintaining a list. The button is
// always mounted and fades via the .is-on class — `visibility: hidden` in the
// resting state (globals.css) is what keeps it out of the Tab order, which an
// opacity-only fade would not. Collision with the bottom-fixed BARS (the listing
// reserve bar, the consent bar) is handled in CSS through --nk-bars-h, as is
// stacking above legal's TOC FAB; the footer is handled here, because "is the
// footer on screen" is not something CSS can ask.
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";
import { Icon } from "./ui";
import { prefersReducedMotion } from "@/app/lib/motion";

const SHOW_AFTER = 600; // px scrolled before the button appears

export function BackToTop() {
  const { dict } = useI18n();
  const [show, setShow] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  // One effect for both halves of "should this be visible": they share a lifecycle
  // and neither can run without the other's answer.
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      setShow(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(compute);
      }
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Yield to the footer: floating chrome must not sit on the footer's own
    // controls (the mobile sitemap accordion rows land exactly under this corner).
    // The -20% bottom inset means "the footer has reached the top 80% of the
    // viewport", i.e. it is properly on screen rather than one pixel into it.
    // <Chrome> mounts per screen, so this element is never stale across a
    // navigation — the effect re-runs and re-queries with the new page's footer.
    const footer = document.querySelector("footer");
    let observer: IntersectionObserver | undefined;
    if (footer && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), {
        rootMargin: "0px 0px -20% 0px",
      });
      observer.observe(footer);
    }

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <button type="button"
      className={"nk-backtotop" + (show && !footerInView ? " is-on" : "")}
      title={dict.common.backToTop}
      aria-label={dict.common.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}>
      <Icon name="ArrowUp" size={20} stroke={2} />
    </button>
  );
}
