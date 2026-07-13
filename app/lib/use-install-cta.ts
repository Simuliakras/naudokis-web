// Install CTAs — make sure an attribution choice EXISTS before handing off to /go.
//
// /go is the thing that enforces the choice (it reads the cookie server-side and
// only then may route through AppsFlyer). This hook exists purely so the visitor is
// asked at the moment they act, instead of being sent to the store unasked and
// never attributed. Declining lands on exactly the same destination — one fewer
// tracking step, never a worse install.
import { useCallback } from "react";
import type React from "react";
import { askConsent, readConsent } from "./consent";

type InstallOptions = {
  newTab?: boolean;
  // Runs immediately before the navigation actually happens — never when the prompt
  // is merely opened, and never when it is dismissed. The bridge modal uses it to
  // start its "did the app open?" timer, which must not tick away while the visitor
  // is still reading the consent prompt.
  onNavigate?: () => void;
};

export function useInstallCta() {
  const openInstall = useCallback(async (href: string, { newTab = false, onNavigate }: InstallOptions = {}) => {
    if (readConsent() === "unknown") {
      const decision = await askConsent();
      // Backed out of the prompt → they didn't ask to install. Don't navigate.
      if (decision === "dismissed") {
        return;
      }
    }
    onNavigate?.();
    // Answering the prompt breaks the user-gesture chain, so a popup blocker may
    // refuse the new tab. Falling back to this tab still gets them to the store.
    if (newTab && window.open(href, "_blank", "noopener")) {
      return;
    }
    window.location.href = href;
  }, []);

  // For CTAs that are real <a href="/go?…"> links: keep the native behaviour
  // (middle-click, cmd-click, no-JS) and intercept only when a choice is missing.
  const onAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, options: InstallOptions = {}) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    const { href, target } = e.currentTarget;
    // A stored choice → let the browser follow the link. The caller still gets its
    // onNavigate, because this click IS the navigation.
    if (readConsent() !== "unknown") {
      options.onNavigate?.();
      return;
    }
    e.preventDefault();
    void openInstall(href, { ...options, newTab: target === "_blank" });
  }, [openInstall]);

  return { openInstall, onAnchorClick };
}
