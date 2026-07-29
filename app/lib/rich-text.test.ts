import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { RichText, richTextToPlainText } from "./rich-text";

// Owner descriptions arrive in two shapes: clean editor HTML, and — when the text was
// pasted from macOS rich text — the same markup entity-escaped. The failure mode is
// silent and shipped once: the escaped shape decoded into TEXT, so the listing page
// rendered a visible `<div>` / `Apple-tab-span` soup and the SERP snippet opened with
// `&lt;div&gt;`. These tests pin both shapes rendering as prose.

const render = (html: string): string => renderToStaticMarkup(createElement(RichText, { html }));

// Trimmed from the real prod payload (listing b38f717f-…, "Forneza Maestro 16"):
// escaped div/span with attributes, raw <br>, tab characters, trailing &nbsp;.
const escapedPaste =
  "&lt;div&gt;Nuomoju picų krosnelę.&lt;/div&gt;&lt;div&gt;<br>&lt;/div&gt;" +
  "&lt;div&gt;Techniniai duomenys:&lt;/div&gt;" +
  '&lt;div&gt;&lt;span class="Apple-tab-span" style="white-space:pre"&gt;\t&lt;/span&gt;' +
  "•Modelis: Fornoza Maestro 16&lt;/div&gt;&lt;div&gt;Ačiū!&nbsp;&lt;/div&gt;";

const editorHtml =
  "<p>Šilelis P-4 – projektorius su <strong>FHD</strong> raiška.</p>\n" +
  "<ul>\n  <li>Pridedami <em>priedai</em>.</li>\n  <li><u>Nuoma</u> parai.</li>\n</ul>";

describe("RichText", () => {
  it("renders entity-escaped markup as structure, never as visible tag text", () => {
    const out = render(escapedPaste);
    expect(out).toContain("<div>Nuomoju picų krosnelę.</div>");
    // The bug: the tags themselves used to reach the page as readable text.
    expect(out).not.toContain("&lt;div&gt;");
    expect(out).not.toContain("Apple-tab-span");
  });

  it("keeps one block per pasted line, including the empty spacer line", () => {
    expect(render(escapedPaste)).toContain("<div>Nuomoju picų krosnelę.</div><div><br/></div><div>Techniniai duomenys:</div>");
  });

  it("leaves already-valid editor HTML structurally intact", () => {
    const out = render(editorHtml);
    expect(out).toContain("<strong>FHD</strong>");
    expect(out).toContain("<li>Pridedami <em>priedai</em>.</li>");
    expect(out).toContain("<u>Nuoma</u>");
  });

  it("drops every attribute, escaped or raw", () => {
    expect(render('&lt;div onclick="steal()"&gt;klik&lt;/div&gt;')).toBe("<div>klik</div>");
    expect(render('<p class="x" onmouseover="steal()">tekstas</p>')).toBe("<p>tekstas</p>");
  });

  it("drops script and style content instead of unwrapping it", () => {
    expect(render("&lt;script&gt;alert(1)&lt;/script&gt;liko")).toBe("liko");
    expect(render("<style>body{display:none}</style>liko")).toBe("liko");
  });

  it("keeps a comparison operator in prose as text, not as a tag", () => {
    expect(render("Laikyti &lt; 5 °C ir &gt; -10 °C")).toBe("Laikyti &lt; 5 °C ir &gt; -10 °C");
  });

  // renderToStaticMarkup re-escapes text children, so the expectations below are one
  // escaping level above what the reader sees: markup "&amp;lt;" is the text "&lt;".
  it("decodes entities exactly once", () => {
    expect(render("Kava &amp; arbata")).toBe("Kava &amp; arbata");
    // Double-escaped input means the author typed the tag; it stays readable text.
    expect(render("&amp;lt;div&amp;gt;")).toBe("&amp;lt;div&amp;gt;");
    expect(richTextToPlainText("&amp;lt;div&amp;gt;")).toBe("&lt;div&gt;");
  });

  it("decodes a tag-less description instead of short-circuiting on it", () => {
    // The old fast path returned early on any `<`-less string, so these leaked raw.
    expect(render("Kaina 5&nbsp;€ &amp; užstatas")).toBe("Kaina 5 € &amp; užstatas");
    expect(render("&lt;div&gt;Vien tik pabėgęs HTML&lt;/div&gt;")).toBe("<div>Vien tik pabėgęs HTML</div>");
  });
});

describe("richTextToPlainText", () => {
  it("reduces an escaped paste to clean prose for the snippet and JSON-LD", () => {
    expect(richTextToPlainText(escapedPaste)).toBe(
      "Nuomoju picų krosnelę. Techniniai duomenys: •Modelis: Fornoza Maestro 16 Ačiū!",
    );
  });

  it("reduces editor HTML to clean prose", () => {
    expect(richTextToPlainText(editorHtml)).toBe(
      "Šilelis P-4 – projektorius su FHD raiška. Pridedami priedai. Nuoma parai.",
    );
  });

  it("never leaks markup, attribute values or script bodies", () => {
    expect(richTextToPlainText('&lt;div class="Apple-tab-span"&gt;a&lt;/div&gt;')).toBe("a");
    expect(richTextToPlainText("<script>alert(1)</script>tekstas")).toBe("tekstas");
  });

  it("passes plain text through unchanged apart from whitespace collapsing", () => {
    expect(richTextToPlainText("  Paprastas   tekstas\n\nbe HTML  ")).toBe("Paprastas tekstas be HTML");
  });
});
