"use client";

import { useId, useState, type ReactNode } from "react";

// Narrow-footer disclosure shell for one footer navigation group.
//
// Once the footer container has room for columns, CSS keeps the content
// permanently visible and drops the button from layout AND the accessibility tree
// (display:none does both), leaving an ordinary navigation landmark.
//
// The collapse is gated on (scripting: enabled) in globals.css, so with JS off the
// resting state is "everything open, no button" rather than an unreachable footer.
//
// No aria-label on the <nav>: the <h2> inside it carries the same string, and
// labelling the landmark too makes screen readers announce the group name twice.
export function FooterDisclosure({
  heading,
  className = "",
  children,
}: {
  heading: string;
  className?: string;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <nav className={`nk-footer__col ${className}`.trim()}>
      <h2>
        <span className="nk-footer__heading-static">{heading}</span>
        <button
          type="button"
          className="nk-footer__disclosure"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
        >
          <span>{heading}</span>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>
      <div
        id={contentId}
        className="nk-footer__col-content"
        data-expanded={expanded ? "true" : "false"}
      >
        {/* The clip is the single grid item whose row animates 0fr→1fr, and what
            hides the links while the row shrinks. Its padding lives on the child
            (globals.css): overflow clips at the PADDING box, so padding here would
            keep painting a strip of links at 0fr.
            No `inert`: the collapsed panel is visibility:hidden, which already takes
            the links out of the tab order and the a11y tree. Unlike the FAQ panel in
            cards.tsx, inert would be actively wrong here — this state stays false on
            desktop, where CSS force-opens the panel, so inert={!expanded} would kill
            every footer link above the column breakpoint. */}
        <div className="nk-footer__col-clip">{children}</div>
      </div>
    </nav>
  );
}
