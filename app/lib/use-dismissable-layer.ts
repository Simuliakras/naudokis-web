// Shared "open layer" plumbing for modals / sheets / drawers: while `open`, lock
// body scroll, close on Escape, optionally auto-close when a breakpoint starts
// matching, and restore focus to the opener on close. Tab-trapping stays in
// useFocusTrap (call it alongside) — this hook owns scroll-lock, Escape, initial
// focus and focus-restore, so it composes with a focus trap rather than replacing it.
//
// `onDismiss` is read through a ref, so an inline/unstable handler never re-runs
// the effect: it fires only when `open` (or an option) actually changes. That is
// what keeps callers from re-animating / stealing focus on every parent re-render.
//
// Layers stack (see lib/layer-stack.ts): Escape reaches only the top-most one, and
// the scroll lock is ref-counted, so a dialog opened over another can close without
// dismissing it or unlocking the page behind it.
import { RefObject, useEffect, useRef } from "react";
import { enterEscapeLayer, lockBodyScroll } from "./layer-stack";
import { observeViewport, type ViewportQueryName } from "./breakpoints";

type DismissableLayerOptions = {
  lockScroll?: boolean; // freeze <body> scroll while open (default true)
  restoreFocus?: boolean; // refocus the opener element on close (default true)
  initialFocus?: RefObject<HTMLElement | null>; // element focused on open (after paint)
  closeAt?: ViewportQueryName; // semantic query; onDismiss fires once it starts matching
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
    const layer = enterEscapeLayer();
    const unlockScroll = lockScroll ? lockBodyScroll() : null;
    // Focus after paint so the target exists and any entrance animation can start.
    const raf = requestAnimationFrame(() => initialFocus?.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      // Escape belongs to whatever opened last — never to the layer underneath it.
      if (e.key === "Escape" && layer.isTop()) {
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    // Auto-close when the layer's context no longer applies (e.g. a mobile-only
    // sheet on a viewport resized past the breakpoint) so it can't get stranded.
    const stopObserving = closeAt
      ? observeViewport(closeAt, (matches) => {
          if (matches) {
            dismiss();
          }
        })
      : null;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      stopObserving?.();
      unlockScroll?.();
      layer.release();
      // A closeAt auto-dismiss can leave the opener display:none on the new band
      // (e.g. the mobile Filters button once the viewport passes the breakpoint) —
      // focusing it then silently drops keyboard focus to <body>. Park on <main>.
      if (opener?.isConnected && opener.offsetParent !== null) {
        opener.focus();
        return;
      }
      const main = opener ? document.getElementById("nk-main") : null;
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    };
  }, [open, lockScroll, restoreFocus, closeAt, initialFocus]);
}
