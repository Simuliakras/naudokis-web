// Pointer-drag dismissal for mobile bottom sheets — one shared behaviour so every
// sheet that shows a grabber pill actually honours the swipe it advertises.
// The panel follows a downward drag (skipped under prefers-reduced-motion), closes
// past the threshold, and snaps back otherwise. Attach the handle ref to a
// dedicated grab zone (touch-action:none) so it never fights the sheet's own
// scrolling content; no-ops entirely above the mobile-sheet breakpoint.
import { useEffect } from "react";
import { prefersReducedMotion } from "./motion";

const SHEET_MEDIA = "(max-width: 560px)";
const CLOSE_THRESHOLD_PX = 120;

export function useSheetDrag({ panelRef, handleRef, enabled, onDismiss }: {
  panelRef: React.RefObject<HTMLElement | null>;
  handleRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handle = handleRef.current;
    if (!handle) {
      return;
    }
    let startY = 0;
    let dragging = false;

    const onMove = (e: PointerEvent) => {
      if (!dragging) {
        return;
      }
      const panel = panelRef.current;
      const dy = Math.max(0, e.clientY - startY);
      if (panel && !prefersReducedMotion()) {
        panel.style.transition = "none";
        panel.style.transform = dy > 0 ? `translateY(${dy}px)` : "";
      }
    };
    const end = (e: PointerEvent) => {
      if (!dragging) {
        return;
      }
      dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      const panel = panelRef.current;
      if (panel) {
        // Clear the follow-transform either way: a dismiss hands off to the
        // sheet's own exit animation, a snap-back transitions home.
        panel.style.transition = "";
        panel.style.transform = "";
      }
      if (e.type !== "pointercancel" && e.clientY - startY > CLOSE_THRESHOLD_PX) {
        onDismiss();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!window.matchMedia(SHEET_MEDIA).matches) {
        return;
      }
      dragging = true;
      startY = e.clientY;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    };

    handle.addEventListener("pointerdown", onDown);
    return () => {
      handle.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [enabled, onDismiss, panelRef, handleRef]);
}
