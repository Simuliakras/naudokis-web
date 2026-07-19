"use client";
// Legal — the interactive chrome islands: reading-progress bar, scroll-spy TOC
// sidebar, mobile TOC drawer + FAB, and back-to-top. These are presentational
// and read scroll state from the shared LegalScroll context (one rAF-throttled
// listener); the heavy document body stays server rendered. Ported from the
// handoff chrome.jsx.
import { useCallback, useEffect, useRef, useState } from "react";
import type { TocItem } from "@/app/lib/legal/types";
import { prefersReducedMotion } from "@/app/lib/motion";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { CloseButton } from "../ui";
import { useLegalScroll } from "./LegalScroll";
import { Icon } from "./Icon";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  }
}

export function TocSidebar({ toc, heading }: { toc: TocItem[]; heading: string }) {
  const { activeId } = useLegalScroll();
  const listRef = useRef<HTMLUListElement>(null);
  // On long docs the sticky TOC overflows a laptop-height viewport, so scroll the
  // active "you are here" link into view WITHIN the TOC's own scroll container as
  // the reader moves through sections (block:nearest → doesn't move the page).
  useEffect(() => {
    if (!activeId || !listRef.current) {
      return;
    }
    listRef.current.querySelector<HTMLElement>("a.is-active")?.scrollIntoView({ block: "nearest" });
  }, [activeId]);
  return (
    <aside className="nk-lg-toc">
      <div className="nk-lg-toc__h">{heading}</div>
      <ul className="nk-lg-toc__list" ref={listRef}>
        {toc.map((s) => (
          <li key={s.id}>
            <a
              href={"#" + s.id}
              className={s.id === activeId ? "is-active" : ""}
              onClick={(e) => { e.preventDefault(); smoothScrollTo(s.id); }}
            >
              {s.num && <span className="nk-lg-toc__num">{s.num}.</span>}
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function LegalChrome({
  toc, contents, closeContents, openMenu, backTop, readingProgress,
}: {
  toc: TocItem[];
  contents: string;
  closeContents: string; // close-button accessible name — must NOT repeat the panel title
  openMenu: string;
  backTop: string;
  readingProgress: string;
}) {
  const { progress, activeId, scrolledDown } = useLegalScroll();
  const [drawer, setDrawer] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Lock body scroll, close on Escape, and manage focus while open. Tab-trapping
  // is handled by useFocusTrap below.
  useEffect(() => {
    if (!drawer) {
      return;
    }
    const prev = document.body.style.overflow;
    const fab = fabRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      fab?.focus();
    };
  }, [drawer]);

  useFocusTrap(panelRef, drawer);

  const onDrawerLink = useCallback((id: string) => {
    setDrawer(false);
    smoothScrollTo(id);
  }, []);

  return (
    <>
      <div className="nk-lg-progress" role="progressbar" aria-label={readingProgress} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="nk-lg-progress__fill" style={{ width: `${progress}%` }} />
      </div>

      {toc.length > 0 && (
        <button ref={fabRef} className="nk-lg-fab-toc" onClick={() => setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}>
          <Icon name="menu" size={18} /><span>{openMenu}</span>
        </button>
      )}

      <div className={"nk-lg-drawer" + (drawer ? " is-open" : "")} aria-hidden={!drawer}>
        <div className="nk-lg-drawer__scrim" onClick={() => setDrawer(false)} />
        <nav ref={panelRef} className="nk-lg-drawer__panel" role="dialog" aria-modal="true" aria-label={contents}>
          <div className="nk-lg-drawer__top">
            <h3>{contents}</h3>
            {/* shared overlay close primitive; named "Close", not the panel title */}
            <CloseButton ref={closeRef} onClick={() => setDrawer(false)} label={closeContents} />
          </div>
          {toc.map((s) => (
            <a
              key={s.id}
              href={"#" + s.id}
              className={s.id === activeId ? "is-active" : ""}
              onClick={(e) => { e.preventDefault(); onDrawerLink(s.id); }}
            >
              {s.num && <span className="nk-lg-toc__num">{s.num}.</span>}<span>{s.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <button
        className={"nk-lg-totop" + (scrolledDown ? " is-on" : "")}
        title={backTop}
        aria-label={backTop}
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
      >
        <Icon name="arrowUp" size={20} />
      </button>
    </>
  );
}
