// Structure recovery for listing spec values.
//
// `attributes_display[].value_label_*` is pre-formatted by the backend, but for
// `type: "text"` attributes it is raw owner input passed through verbatim — which
// means a value can be a multi-line, bulleted list ("Komplektacijoje:\n\t•\tMentelė
// \n\t•\tŠepetys…"). Rendered as a plain string child the newlines and tabs collapse
// and the whole thing lands in the spec grid's right-aligned bold value cell as one
// unreadable run. This module turns such a value back into lines the section can
// render as a real <ul>, and tells the caller which values are short enough to stay
// in the two-column key/value grid.
//
// Pure and dependency-free — no react-query, no server imports.

export type SpecLine = { kind: "lead" | "item"; text: string };

// `empty` is its own case rather than an inline value with an empty string, so
// `inline.text` is guaranteed to be worth rendering and a caller cannot forget to
// check it. A value can be empty after parsing even though it was a non-empty string
// on the wire ("•\n•" carries no text), which the data layer's own `!a.value` filter
// cannot see.
export type SpecValueView =
  | { kind: "empty" }
  | { kind: "inline"; text: string }
  | { kind: "block"; lines: SpecLine[] };

// A lead-in and the run of items under it. Consecutive items form ONE list, so a
// value with two groups ("Komplektacijoje: …" / "Papildomai: …") renders as two lists
// under two lead-ins rather than one run-on list that implies the add-ons are
// included too.
export type SpecGroup = { kind: "lead"; text: string } | { kind: "list"; items: string[] };

// Markers an owner might type at the start of a line. The dashes are the ones a
// Lithuanian keyboard/autocorrect actually produces (hyphen, en, em).
const BULLET_CHARS = "•·▪‣*\\-–—";
const LEADING_BULLET = new RegExp(`^[${BULLET_CHARS}]\\s+`);
// A bare "•" with no trailing space still reads as a bullet; a bare "-" does not
// (it starts "-10 °C"), so the no-space form is limited to the unambiguous glyphs.
const LEADING_GLYPH = /^[•·▪‣]\s*/;

// Longest value that still looks right in the half-width, right-aligned value cell
// at desktop. Above this the row breaks out to full width and reads left-aligned.
const INLINE_MAX = 56;

// The backend caps text attributes at `max_len` — 40/60/80 for the short ones, and
// 200 (the schema default) or 240 for the long-form tier (accessories_included,
// included_items, special_requirements, …). It cuts hard, mid-word: the prod value
// for listing b38f717f-… ends "+ mokestis už sunaud". Nothing but that long tier can
// reach 200 characters, so a value that long ending on a word character was almost
// certainly truncated — say so with an ellipsis rather than shipping what reads as a
// typo. The real fix is upstream in the write path.
const TRUNCATION_FLOOR = 200;
const ENDS_MID_WORD = /[\p{L}\p{N}]$/u;

function normalize(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ");
}

// One source line → one or more SpecLines. A leading marker makes the line an item;
// otherwise a line carrying two or more inline "•" is a lead-in plus its items
// ("Komplektacija: • mentelė • šepetys"), which is how the same list arrives once an
// editor has flattened the newlines out of it.
function splitLine(line: string): SpecLine[] {
  if (LEADING_BULLET.test(line) || LEADING_GLYPH.test(line)) {
    const text = line.replace(LEADING_BULLET, "").replace(LEADING_GLYPH, "").trim();
    return text ? [{ kind: "item", text }] : [];
  }
  const parts = line.split("•");
  if (parts.length < 3) {
    return [{ kind: "lead", text: line }];
  }
  const lines: SpecLine[] = [];
  parts.forEach((part, i) => {
    const text = part.trim();
    if (!text) {
      return;
    }
    lines.push({ kind: i === 0 ? "lead" : "item", text });
  });
  return lines;
}

export function parseSpecValue(value: string): SpecValueView {
  const raw = normalize(value).trim();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap(splitLine);

  // Blank source lines only ever separated groups, and a "lead" already starts a new
  // group downstream, so dropping them above loses nothing.
  //
  // Zero lines means the value carried no text at all — blank, or nothing but bullet
  // markers. Report it empty so the caller can drop the row instead of ruling off a
  // label with nothing beside it.
  if (!lines.length) {
    return { kind: "empty" };
  }

  if (raw.length >= TRUNCATION_FLOOR && ENDS_MID_WORD.test(raw)) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = { ...last, text: `${last.text}…` };
  }

  if (lines.length === 1 && lines[0].kind === "lead" && lines[0].text.length <= INLINE_MAX) {
    return { kind: "inline", text: lines[0].text };
  }
  return { kind: "block", lines };
}

// Collapse the flat line list into renderable groups. Lives here rather than in the
// component so it stays pure and testable, and so the JSX is a straight map over the
// result instead of building state while it renders.
export function groupSpecLines(lines: SpecLine[]): SpecGroup[] {
  const groups: SpecGroup[] = [];
  for (const line of lines) {
    if (line.kind === "lead") {
      groups.push({ kind: "lead", text: line.text });
      continue;
    }
    const last = groups[groups.length - 1];
    if (last?.kind === "list") {
      last.items.push(line.text);
      continue;
    }
    groups.push({ kind: "list", items: [line.text] });
  }
  return groups;
}
