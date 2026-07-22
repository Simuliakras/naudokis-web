"use client";
// The one scroll-to-top control on the site, mounted sitewide by <Chrome>.
//
// No page opts in: the 600px threshold IS the "is this page long enough" test,
// so short pages never show it without anyone maintaining a list. The button is
// always mounted and fades via the .is-on class — `visibility: hidden` in the
// resting state (globals.css) is what keeps it out of the Tab order, which an
// opacity-only fade would not. Collision with the other bottom-right floats
// (listing detail's .nk-mbar, legal's .nk-lg-fab-toc) is handled in CSS.
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";
import { Icon } from "./ui";
import { prefersReducedMotion } from "@/app/lib/motion";

const SHOW_AFTER = 600; // px scrolled before the button appears

export function BackToTop() {
  const { dict } = useI18n();
  const [show, setShow] = useState(false);

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
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button type="button"
      className={"nk-backtotop" + (show ? " is-on" : "")}
      title={dict.common.backToTop}
      aria-label={dict.common.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}>
      <Icon name="ArrowUp" size={20} stroke={2} />
    </button>
  );
}
