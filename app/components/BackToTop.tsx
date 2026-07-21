"use client";
// Floating back-to-top control, mounted site-wide by <Chrome>.
//
// Was feed-only until it moved here. No page needs to opt in: the 900px scroll
// threshold IS the "is this page long enough" test, so short pages never show it
// without anyone maintaining a list. `enabled` exists for screens that own the
// bottom-right corner outright and would collide.
import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";
import { Icon } from "./ui";
import { prefersReducedMotion } from "@/app/lib/motion";

export function BackToTop({ enabled = true }: { enabled?: boolean }) {
  const { dict } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  if (!enabled || !show) {
    return null;
  }
  return (
    <button type="button" className="nk-round nk-round--solid nk-backtotop" aria-label={dict.common.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}>
      <Icon name="ArrowUp" size={22} stroke={2.2} color="var(--nk-text)" />
    </button>
  );
}
