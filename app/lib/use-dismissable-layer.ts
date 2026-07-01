// Shared "open layer" plumbing for modals / sheets / drawers: while `open`, lock
// body scroll, close on Escape, optionally auto-close when a breakpoint starts
// matching, and restore focus to the opener on close. Tab-trapping stays in
// useFocusTrap (call it alongside) — this hook owns scroll-lock, Escape, initial
// focus and focus-restore, so it composes with a focus trap rather than replacing it.
//
// `onDismiss` is read through a ref, so an inline/unstable handler never re-runs
// the effect: it fires only when `open` (or an option) actually changes. That is
// what keeps callers from re-animating / stealing focus on every parent re-render.
import { RefObject, useEffect, useRef } from "react";

type DismissableLayerOptions = {
  lockScroll?: boolean; // freeze <body> scroll while open (default true)
  restoreFocus?: boolean; // refocus the opener element on close (default true)
  initialFocus?: RefObject<HTMLElement | null>; // element focused on open (after paint)
  closeAt?: string; // media query; onDismiss fires once it starts matching (e.g. viewport grows past mobile)
};

export function useDismissableLayer(
  open: boolean,
  onDismiss: () => void,
  { lockScroll = true, restoreFocus = true, initialFocus, closeAt }: DismissableLayerOptions = {},
) {
  // Keep the latest onDismiss in a ref so the effect below depends only on stable
  // inputs — an inline/unstable handler then never re-runs it (which would restart
  // entrance animations or steal focus on every parent re-render).
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    const dismiss = () => dismissRef.current();
    const opener = restoreFocus && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }
    // Focus after paint so the target exists and any entrance animation can start.
    const raf = requestAnimationFrame(() => initialFocus?.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    // Auto-close when the layer's context no longer applies (e.g. a mobile-only
    // sheet on a viewport resized past the breakpoint) so it can't get stranded.
    const mq = closeAt ? window.matchMedia(closeAt) : null;
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) {
        dismiss();
      }
    };
    mq?.addEventListener("change", onBreakpoint);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      mq?.removeEventListener("change", onBreakpoint);
      if (lockScroll) {
        document.body.style.overflow = "";
      }
      opener?.focus();
    };
  }, [open, lockScroll, restoreFocus, closeAt, initialFocus]);
}
