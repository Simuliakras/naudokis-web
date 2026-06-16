// Traps Tab/Shift+Tab focus within a panel while it is active (open modals,
// dialogs, drawers). Wraps focus from the last focusable element back to the
// first and vice-versa. Callers keep their own Escape/arrow handling — this hook
// owns only the Tab key, so it composes with an existing keydown effect.
import { RefObject, useEffect } from "react";

// One canonical focusable selector for every trap. [aria-hidden="true"] nodes are
// excluded so decorative/off-screen controls never receive focus inside a dialog.
const FOCUSABLE =
  'a[href]:not([aria-hidden="true"]), button:not([disabled]):not([aria-hidden="true"]), input:not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap<T extends HTMLElement>(panelRef: RefObject<T | null>, active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, panelRef]);
}
