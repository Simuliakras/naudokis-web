"use client";
// Legal — the interactive chrome islands: reading-progress bar, scroll-spy TOC
// sidebar, mobile TOC drawer + FAB, and back-to-top. These are presentational
// and read scroll state from the shared LegalScroll context (one rAF-throttled
// listener); the heavy document body stays server rendered. Ported from the
// handoff chrome.jsx.
import { useCallback, useEffect, useState } from "react";
import type { TocItem } from "@/app/lib/legal/types";
import { useLegalScroll } from "./LegalScroll";
import { Icon } from "./Icon";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  }
}

export function TocSidebar({ toc, heading }: { toc: TocItem[]; heading: string }) {
  const { activeId } = useLegalScroll();
  return (
    <aside className="nk-lg-toc">
      <div className="nk-lg-toc__h">{heading}</div>
      <ul className="nk-lg-toc__list">
        {toc.map((s) => (
          <li key={s.id}>
            <a
              href={"#" + s.id}
              className={s.id === activeId ? "is-active" : ""}
              onClick={(e) => { e.preventDefault(); smoothScrollTo(s.id); }}
            >
              {s.num && <span className="nk-lg-toc__num">{s.num}</span>}
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function LegalChrome({
  toc, contents, openMenu, backTop, readingProgress,
}: {
  toc: TocItem[];
  contents: string;
  openMenu: string;
  backTop: string;
  readingProgress: string;
}) {
  const { progress, activeId, scrolledDown } = useLegalScroll();
  const [drawer, setDrawer] = useState(false);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawer) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawer]);

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
        <button className="nk-lg-fab-toc" onClick={() => setDrawer(true)} aria-haspopup="dialog" aria-expanded={drawer}>
          <Icon name="menu" size={18} /><span>{openMenu}</span>
        </button>
      )}

      <div className={"nk-lg-drawer" + (drawer ? " is-open" : "")} aria-hidden={!drawer}>
        <div className="nk-lg-drawer__scrim" onClick={() => setDrawer(false)} />
        <nav className="nk-lg-drawer__panel" aria-label={contents}>
          <div className="nk-lg-drawer__top">
            <h3>{contents}</h3>
            <button className="nk-lg-iconbtn" style={{ display: "flex" }} onClick={() => setDrawer(false)} aria-label={contents}>
              <Icon name="x" size={18} />
            </button>
          </div>
          {toc.map((s) => (
            <a
              key={s.id}
              href={"#" + s.id}
              className={s.id === activeId ? "is-active" : ""}
              onClick={(e) => { e.preventDefault(); onDrawerLink(s.id); }}
            >
              {s.num && <span className="nk-lg-toc__num">{s.num}</span>}<span>{s.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <button
        className={"nk-lg-totop" + (scrolledDown ? " is-on" : "")}
        title={backTop}
        aria-label={backTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <Icon name="arrowUp" size={20} />
      </button>
    </>
  );
}
