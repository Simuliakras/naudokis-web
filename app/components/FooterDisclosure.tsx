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
        {children}
      </div>
    </nav>
  );
}
