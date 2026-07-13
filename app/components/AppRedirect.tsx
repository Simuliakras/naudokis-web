"use client";
// Locked-mode "Bridge" — app-redirect modal (desktop dialog / mobile bottom-sheet).
// Mounted once via <Chrome/>; opened from anywhere via openRedirect({title, body}).
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon, QR, AppBadges, CloseButton, NK_REDIRECT_EVENT, type RedirectPayload } from "./ui";
import { useI18n } from "./I18nProvider";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { prefersReducedMotion } from "@/app/lib/motion";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
import { trackEvent } from "@/app/lib/analytics";
import { WEB_ATTRIBUTION_KEYS, cleanAttributionValue, goHref } from "@/app/lib/attribution";
import { useInstallCta } from "@/app/lib/use-install-cta";

// One buffer-frame past the .2s `nk-*-out` exit keyframes in globals.css, so the
// dialog unmounts only after the animation has finished painting.
const EXIT_MS = 220;

// Frequency cap: the first locked tap in a session gets the full spring entrance;
// repeat opens skip it so the dialog feels like a calm reference, not a fresh
// interruption each time. The store links / QR are always shown — only the
// animation is softened, so conversion is never suppressed.
const SEEN_KEY = "nk_bridge_seen";

// /go href carrying the user's app intent plus any campaign params from the
// page URL, so an install started in the modal keeps its attribution.
function smartInstallHref(appPath: string | undefined, handoff: "smart" | "qr") {
  const source = new URLSearchParams(window.location.search);
  const params: Record<string, string> = { handoff };
  for (const key of WEB_ATTRIBUTION_KEYS) {
    const value = cleanAttributionValue(source.get(key));
    if (value) {
      params[key] = value;
    }
  }
  return goHref(appPath, params);
}

declare global {
  interface Window {
    __nkBridgeReady?: boolean;
    __nkPendingRedirect?: RedirectPayload | null;
  }
}

export function AppRedirect() {
  const { dict } = useI18n();
  const { onAnchorClick } = useInstallCta();
  const [state, setState] = useState<{ open: boolean; closing: boolean; instant: boolean } & RedirectPayload>({ open: false, closing: false, instant: false, title: "", body: "" });
  const [showOpenFallback, setShowOpenFallback] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const grabRef = useRef<HTMLDivElement>(null); // sheet drag handle (mobile)
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null); // restored when the dialog closes
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<number | null>(null);

  // Finalize teardown: unmount the dialog and restore focus to the opener.
  const finalize = useCallback(() => {
    setState((s) => ({ ...s, open: false, closing: false }));
    lastFocused.current?.focus();
  }, []);

  // Play the exit animation, then finalize. Reduced-motion users skip straight
  // to teardown so nothing lingers on screen.
  const close = useCallback(() => {
    if (prefersReducedMotion()) {
      finalize();
      return;
    }
    setState((s) => ({ ...s, closing: true }));
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(finalize, EXIT_MS);
  }, [finalize]);

  useEffect(() => () => {
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  }, []);

  useEffect(() => {
    const openPayload = (payload: RedirectPayload) => {
      const d = payload ?? { title: "", body: "" };
      lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // sessionStorage can throw in private modes — fall back to the full entrance.
      }
      window.__nkPendingRedirect = null;
      setShowOpenFallback(false);
      setThumbFailed(false);
      setState({ open: true, closing: false, instant: seen, title: d.title || dict.bridge.defaultTitle, body: d.body || dict.bridge.defaultBody, listing: d.listing, appPath: d.appPath });
    };
    const onOpen = (e: Event) => {
      openPayload((e as CustomEvent<RedirectPayload>).detail ?? { title: "", body: "" });
    };
    window.addEventListener(NK_REDIRECT_EVENT, onOpen);
    // Flip the bootstrap handoff only after the real listener is live; otherwise
    // an early tap can miss both the pre-hydration fallback and the hydrated path.
    window.__nkBridgeReady = true;
    if (window.__nkPendingRedirect) {
      openPayload(window.__nkPendingRedirect);
    }
    return () => {
      window.removeEventListener(NK_REDIRECT_EVENT, onOpen);
      window.__nkBridgeReady = false;
    };
  }, [dict]);

  // While open: lock body scroll (released on close AND unmount — the component
  // remounts per page, so navigating away mid-dialog must not leave the page
  // unscrollable), move focus into the dialog, close on Escape. Tab-trapping is
  // handled by useFocusTrap below. restoreFocus is off: the opener is refocused
  // in finalize() after the exit animation, so the hook must not restore early.
  useDismissableLayer(state.open, close, { initialFocus: closeRef, restoreFocus: false });

  useFocusTrap(panelRef, state.open);

  // The grabber pill advertises swipe-to-dismiss — honour it (mobile widths only).
  useSheetDrag({ panelRef, handleRef: grabRef, enabled: state.open, onDismiss: close });

  if (!state.open) return null;
  const installHref = smartInstallHref(state.appPath, "smart");
  const qrInstallHref = smartInstallHref(state.appPath, "qr");
  const installUrl = new URL(qrInstallHref, window.location.origin).toString();
  const attemptOpen = () => {
    const retry = showOpenFallback;
    setShowOpenFallback(false);
    trackEvent(retry ? "App Open Retry" : "App Open Attempt", {
      placement: "bridge_modal",
      contextPreserved: Boolean(state.appPath),
    });
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setShowOpenFallback(true);
        trackEvent("App Open Fallback Shown", {
          placement: "bridge_modal",
          contextPreserved: Boolean(state.appPath),
        });
      }
    }, 1800);
  };
  // Same string as the mobile "Also on:" row, minus the trailing colon so it sits
  // cleanly as a centred divider label (both locales end in ":").
  const storeLabel = dict.bridge.storesAlso.replace(/[:：]+\s*$/, "");
  return (
    <div className={state.closing ? "nk-redirect-scrim is-closing" : "nk-redirect-scrim"} onClick={close} role="dialog" aria-modal="true" aria-labelledby="nk-redirect-title" aria-describedby="nk-redirect-body">
      <div ref={panelRef} className={state.instant ? "nk-redirect-panel nk-redirect-panel--instant" : "nk-redirect-panel"} onClick={(e) => e.stopPropagation()}>
        {/* dismissible-sheet affordance + drag handle (mobile only, via CSS) */}
        <div ref={grabRef} className="nk-sheet-grabzone" aria-hidden="true"><span className="nk-sheet-grabber" /></div>
        <CloseButton ref={closeRef} onClick={close} label={dict.bridge.close} className="nk-redirect-close" />
        <Image src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={287} height={64}
          style={{ height: 32, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="nk-redirect-title" style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{state.title}</h2>
          <p id="nk-redirect-body" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "26px", color: "var(--nk-text-2)" }}>{state.body}</p>
        </div>
        {/* Intent preservation: the item the user was acting on stays visible
            across the handoff (real listing data passed by the trigger). */}
        {state.listing && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--nk-r-md)", background: "var(--nk-surface-2)", border: "1px solid var(--nk-glass-card-border)", boxShadow: "var(--nk-edge-top)" }}>
            <span className="nk-imgph" style={{ width: 56, height: 44, borderRadius: 8, flex: "none", position: "relative", overflow: "hidden" }}>
              {state.listing.thumb && !thumbFailed && <Image src={state.listing.thumb} alt="" fill sizes="56px" style={{ objectFit: "cover" }} onError={() => setThumbFailed(true)} />}
              {(!state.listing.thumb || thumbFailed) && <Icon name="ImageOff" size={18} stroke={1.5} className="nk-imgicon" />}
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.listing.title}</span>
              {state.listing.priceLabel && <span className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-2)" }}>{state.listing.priceLabel}</span>}
            </span>
          </div>
        )}
        {/* Desktop hero: the QR is the working handoff path there (/go only
            resolves to a store on a phone), so it gets the card + heading.
            Hidden ≤560px. */}
        <div className="nk-redirect-qr">
          <QR size={128} value={installUrl} />
          <span style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, lineHeight: "22px", color: "var(--nk-text)" }}>{dict.bridge.qrTitle}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, lineHeight: "20px", color: "var(--nk-text-muted)" }}>{dict.bridge.qrHint}</span>
          </span>
        </div>
        {/* Desktop: separate the scan handoff from the store click-path. Hidden ≤560px. */}
        <div className="nk-redirect-divider" aria-hidden="true"><span>{storeLabel}</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mobile primary: one-tap smart link that sniffs the OS. Hidden >560px,
              where it would only 302 back to the homepage (a decoy CTA). */}
          {/* Ask for the attribution choice first if none is stored. /go enforces it
              either way — this only means the visitor is asked at the moment they act,
              instead of being sent on unasked and never attributed. attemptOpen rides
              on onNavigate so its "did the app open?" timer starts when we actually
              leave, not while the prompt is still on screen. */}
          <a className="nk-btn nk-btn--primary nk-redirect-smartlink" href={installHref} target="_blank" rel="noopener noreferrer" style={{ width: "100%" }}
            onClick={(e) => onAnchorClick(e, { onNavigate: attemptOpen })}>
            <Icon name="Download" size={18} stroke={2.2} color="var(--nk-text)" /> {showOpenFallback ? dict.bridge.retryOpen : dict.bridge.installCta}
          </a>
          <p role="status" className="nk-redirect-openfallback">{showOpenFallback ? dict.bridge.appOpenFallback : ""}</p>
          {/* Desktop secondary: clickable store badges. On mobile they collapse to a
              quiet text row — /go already routes to the right store, so a second and
              third full-weight install button would only dilute the tap. */}
          <div className="nk-redirect-stores">
            <AppBadges height={44} gap={12} placement="bridge_modal" />
          </div>
          <p className="nk-redirect-storestext" style={{ margin: 0, textAlign: "center", fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>
            {dict.bridge.storesAlso}{" "}
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--nk-text-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => trackEvent("App Store Click", { store: "google", placement: "bridge_modal_text" })}>Google Play</a>
            {" · "}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--nk-text-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => trackEvent("App Store Click", { store: "apple", placement: "bridge_modal_text" })}>App Store</a>
          </p>
        </div>
      </div>
    </div>
  );
}
