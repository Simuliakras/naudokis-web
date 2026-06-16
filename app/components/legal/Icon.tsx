// Legal documents — tiny stroke-path icon set (ported from the handoff md.jsx).
// Kept separate from the marketing Icon set in ui.tsx; each path string is split
// on "M" into sub-paths, matching the original renderer. Only the icons the
// document page + reading chrome still use remain (the hub/topbar set was
// dropped with the Policy Center).

const ICONS = {
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  menu: "M4 7h16M4 12h16M4 17h16",
  x: "M6 6l12 12M18 6L6 18",
  calendar: "M7 3v3M17 3v3M4 9h16M5 6h14v15H5z",
  tag: "M3 12V4h8l9 9-7 7-9-9z M7.5 7.5h.01",
  hash: "M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16",
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
