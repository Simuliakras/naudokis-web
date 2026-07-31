import { describe, expect, it } from "vitest";
import { groupSpecLines, parseSpecValue, type SpecLine } from "./spec-value";

// The real prod value for listing b38f717f-… attribute `accessories_included`, byte
// for byte off the wire: tab-indented bullets, a blank line between the two groups,
// and the backend's hard 240-char cut mid-word ("sunaud").
const FORNEZA =
  "Komplektacijoje:\n\t•\tPicos dėjimo mentelė (lyžė) – aliumininė, su ilga rankena\n\t•\tŠepetys krosnelei valyti\n\t•\tTransportavimo krepšys\n\t•\tŽarnelė ir reduktorius dujų prijungimui\n\nPapildomai:\n\t•\tDujų balionas – 3 € už nuomą + mokestis už sunaud";

function lines(value: string): SpecLine[] {
  const view = parseSpecValue(value);
  if (view.kind !== "block") {
    throw new Error(`expected a block value, got ${view.kind}`);
  }
  return view.lines;
}

describe("parseSpecValue — short values stay in the grid", () => {
  it("keeps a plain short value inline", () => {
    expect(parseSpecValue("Pultelis ir pakrovimo laidas")).toEqual({
      kind: "inline",
      text: "Pultelis ir pakrovimo laidas",
    });
  });

  it("keeps a comma-joined enum list inline", () => {
    expect(parseSpecValue("MagSafe įkroviklis, USB-C kabelis")).toEqual({
      kind: "inline",
      text: "MagSafe įkroviklis, USB-C kabelis",
    });
  });

  it("trims surrounding whitespace without promoting to a block", () => {
    expect(parseSpecValue("  Viduje ir lauke \n")).toEqual({
      kind: "inline",
      text: "Viduje ir lauke",
    });
  });

  it("breaks out a single line once it outgrows the value cell", () => {
    const long = "Tinka visiems lengviesiems automobiliams su prikabinimo kabliu";
    expect(long.length).toBeGreaterThan(56);
    expect(parseSpecValue(long)).toEqual({
      kind: "block",
      lines: [{ kind: "lead", text: long }],
    });
  });
});

describe("parseSpecValue — structure recovery", () => {
  it("rebuilds the two groups of the real Forneza value", () => {
    expect(lines(FORNEZA)).toEqual([
      { kind: "lead", text: "Komplektacijoje:" },
      { kind: "item", text: "Picos dėjimo mentelė (lyžė) – aliumininė, su ilga rankena" },
      { kind: "item", text: "Šepetys krosnelei valyti" },
      { kind: "item", text: "Transportavimo krepšys" },
      { kind: "item", text: "Žarnelė ir reduktorius dujų prijungimui" },
      { kind: "lead", text: "Papildomai:" },
      { kind: "item", text: "Dujų balionas – 3 € už nuomą + mokestis už sunaud…" },
    ]);
  });

  it("reads hyphen and en-dash bullets", () => {
    expect(lines("Komplektacija:\n- Kabelis\n– Dėklas\n— Krepšys")).toEqual([
      { kind: "lead", text: "Komplektacija:" },
      { kind: "item", text: "Kabelis" },
      { kind: "item", text: "Dėklas" },
      { kind: "item", text: "Krepšys" },
    ]);
  });

  it("reads a bullet glyph with no space after it", () => {
    expect(lines("•Kabelis\n•Dėklas")).toEqual([
      { kind: "item", text: "Kabelis" },
      { kind: "item", text: "Dėklas" },
    ]);
  });

  it("splits inline bullets when the newlines were flattened away", () => {
    expect(lines("Komplektacija: • Mentelė • Šepetys • Krepšys")).toEqual([
      { kind: "lead", text: "Komplektacija:" },
      { kind: "item", text: "Mentelė" },
      { kind: "item", text: "Šepetys" },
      { kind: "item", text: "Krepšys" },
    ]);
  });

  it("treats a bullet-led flattened line as items with no lead", () => {
    expect(lines("• Mentelė • Šepetys • Krepšys")).toEqual([
      { kind: "item", text: "Mentelė • Šepetys • Krepšys" },
    ]);
  });

  it("does not mistake a negative number for a bullet", () => {
    expect(lines("Naudojimo temperatūra:\n-10 °C … +40 °C")).toEqual([
      { kind: "lead", text: "Naudojimo temperatūra:" },
      { kind: "lead", text: "-10 °C … +40 °C" },
    ]);
  });

  it("drops blank lines — a lead already opens the next group", () => {
    expect(lines("Viduje:\n\n• Stalas\n\n\nLauke:\n• Skėtis")).toEqual([
      { kind: "lead", text: "Viduje:" },
      { kind: "item", text: "Stalas" },
      { kind: "lead", text: "Lauke:" },
      { kind: "item", text: "Skėtis" },
    ]);
  });
});

describe("parseSpecValue — backend truncation", () => {
  // The long-form text attributes cap at 200 (schema default) or 240; nothing else on
  // the wire can reach 200 characters.
  const atCap = (n: number) => "• " + "labai ilgas priedas ".repeat(20).slice(0, n - 2);

  it("marks a value cut mid-word at the 240 cap", () => {
    const v = atCap(240);
    expect(v).toHaveLength(240);
    const last = lines(v).at(-1);
    expect(last?.text.endsWith("…")).toBe(true);
  });

  it("marks a value cut mid-word at the 200 cap", () => {
    const last = lines(atCap(200)).at(-1);
    expect(last?.text.endsWith("…")).toBe(true);
  });

  it("leaves a long value that ends in punctuation alone", () => {
    const v = atCap(239) + ".";
    expect(v).toHaveLength(240);
    const last = lines(v).at(-1);
    expect(last?.text.endsWith(".")).toBe(true);
    expect(last?.text).not.toContain("…");
  });

  it("never marks a short value, however it ends", () => {
    expect(parseSpecValue("Pultelis")).toEqual({ kind: "inline", text: "Pultelis" });
  });
});

describe("parseSpecValue — degenerate input", () => {
  it("reports whitespace only as empty", () => {
    expect(parseSpecValue("  \n\t\n ")).toEqual({ kind: "empty" });
  });

  it("reports an empty string as empty", () => {
    expect(parseSpecValue("")).toEqual({ kind: "empty" });
  });

  it("reports a value that is nothing but bullet markers as empty", () => {
    expect(parseSpecValue("•\n•\n•")).toEqual({ kind: "empty" });
  });
});

describe("groupSpecLines", () => {
  it("gathers consecutive items under the lead that opens them", () => {
    expect(groupSpecLines(lines(FORNEZA))).toEqual([
      { kind: "lead", text: "Komplektacijoje:" },
      {
        kind: "list",
        items: [
          "Picos dėjimo mentelė (lyžė) – aliumininė, su ilga rankena",
          "Šepetys krosnelei valyti",
          "Transportavimo krepšys",
          "Žarnelė ir reduktorius dujų prijungimui",
        ],
      },
      { kind: "lead", text: "Papildomai:" },
      { kind: "list", items: ["Dujų balionas – 3 € už nuomą + mokestis už sunaud…"] },
    ]);
  });

  it("starts a list with no lead when the value opens on an item", () => {
    expect(groupSpecLines([{ kind: "item", text: "Kabelis" }])).toEqual([
      { kind: "list", items: ["Kabelis"] },
    ]);
  });

  it("keeps two leads apart rather than merging their lists", () => {
    expect(
      groupSpecLines([
        { kind: "lead", text: "Viduje:" },
        { kind: "item", text: "Stalas" },
        { kind: "lead", text: "Lauke:" },
        { kind: "item", text: "Skėtis" },
      ]),
    ).toEqual([
      { kind: "lead", text: "Viduje:" },
      { kind: "list", items: ["Stalas"] },
      { kind: "lead", text: "Lauke:" },
      { kind: "list", items: ["Skėtis"] },
    ]);
  });

  it("returns nothing for no lines", () => {
    expect(groupSpecLines([])).toEqual([]);
  });
});
