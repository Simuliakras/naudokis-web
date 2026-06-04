// Legal Policy Center — tiny stroke-path icon set (ported from the handoff
// md.jsx). Kept separate from the marketing Icon set in ui.tsx; each path string
// is split on "M" into sub-paths, matching the original renderer.

const ICONS = {
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 6l6 6-6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  x: "M6 6l12 12M18 6L6 18",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18",
  file: "M7 3h7l5 5v13H7zM14 3v5h5",
  calendar: "M7 3v3M17 3v3M4 9h16M5 6h14v15H5z",
  tag: "M3 12V4h8l9 9-7 7-9-9z M7.5 7.5h.01",
  layers: "M12 3l9 5-9 5-9-5 9-5M3 14l9 5 9-5",
  hash: "M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16",
  book: "M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2zM5 4v14",
  arrowLeft: "M19 12H5M11 6l-6 6 6 6",
} as const;

export type LegalIconName = keyof typeof ICONS;

export function Icon({
  name, size = 18, stroke = 1.9,
}: {
  name: LegalIconName;
  size?: number;
  stroke?: number;
}) {
  const d = ICONS[name];
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true"
    >
      {d.split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={"M" + seg} />
      ))}
    </svg>
  );
}
