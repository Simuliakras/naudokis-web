// Safe, dependency-free rich-text renderer for backend-supplied HTML (listing
// descriptions come from a WYSIWYG editor: <p>/<strong>/<em>/<ul><li>/<br>).
//
// Security model: we NEVER use dangerouslySetInnerHTML. The HTML is tokenized and
// rebuilt as a React element tree, and React elements are only ever created for an
// allowlist of tag names with ALL attributes dropped. Text becomes React string
// children (auto-escaped). So even on malformed input the worst case is wrong-looking
// output, never script execution / attribute injection — there is no XSS surface and
// no impact on the site CSP (no inline scripts, styles or event handlers are emitted).
import { createElement, Fragment, type ReactNode } from "react";

// Inline emphasis + block structure the editor can produce. `b`/`i` normalize to
// `strong`/`em`. Everything not listed is unwrapped (children kept, tag dropped).
const TAG_MAP: Record<string, keyof React.JSX.IntrinsicElements> = {
  p: "p", br: "br", strong: "strong", b: "strong", em: "em", i: "em", u: "u",
  ul: "ul", ol: "ol", li: "li",
};
// Elements whose CONTENT is dropped entirely (not unwrapped) — never render their text.
const DROP_WITH_CONTENT = new Set(["script", "style"]);
const VOID_TAGS = new Set(["br"]);

type Token =
  | { kind: "open" | "close"; name: string }
  | { kind: "void"; name: string }
  | { kind: "text"; text: string };

// Split into tag / text tokens. Attributes are matched but discarded (`[^>]*`), so
// no attribute value ever reaches the output.
function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      tokens.push({ kind: "text", text: html.slice(last, m.index) });
    }
    const name = m[2].toLowerCase();
    if (m[1] === "/") {
      tokens.push({ kind: "close", name });
    } else if (m[3] === "/" || VOID_TAGS.has(name)) {
      tokens.push({ kind: "void", name });
    } else {
      tokens.push({ kind: "open", name });
    }
    last = re.lastIndex;
  }
  if (last < html.length) {
    tokens.push({ kind: "text", text: html.slice(last) });
  }
  return tokens;
}

// Decode the handful of entities a rich-text editor emits. Safe because the result
// is rendered as a React text child (escaped), never as markup.
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

type Frame = { name: string; children: ReactNode[] };

export function richTextToNodes(html: string): ReactNode[] {
  const tokens = tokenize(html);
  const root: ReactNode[] = [];
  const stack: Frame[] = [];
  let dropDepth = 0; // >0 while inside a DROP_WITH_CONTENT subtree
  let keySeed = 0;

  const parentChildren = (): ReactNode[] => (stack.length ? stack[stack.length - 1].children : root);

  const emit = (frame: Frame): void => {
    const target = parentChildren();
    const mapped = TAG_MAP[frame.name];
    if (mapped) {
      target.push(createElement(mapped, { key: keySeed++ }, ...frame.children));
      return;
    }
    // Non-allowlisted (but not dropped) tag → unwrap: keep its children inline.
    frame.children.forEach((c) => target.push(c));
  };

  for (const tk of tokens) {
    if (dropDepth > 0) {
      if (tk.kind === "open" && DROP_WITH_CONTENT.has(tk.name)) {
        dropDepth++;
      } else if (tk.kind === "close" && DROP_WITH_CONTENT.has(tk.name)) {
        dropDepth--;
      }
      continue;
    }
    if (tk.kind === "text") {
      const text = decodeEntities(tk.text);
      if (text) {
        parentChildren().push(text);
      }
      continue;
    }
    if (tk.kind === "void") {
      if (tk.name === "br") {
        parentChildren().push(createElement("br", { key: keySeed++ }));
      }
      continue;
    }
    if (tk.kind === "open") {
      if (DROP_WITH_CONTENT.has(tk.name)) {
        dropDepth = 1;
        continue;
      }
      stack.push({ name: tk.name, children: [] });
      continue;
    }
    // close: pop down to the matching open, implicitly closing any unclosed children.
    const matchIdx = stack.map((f) => f.name).lastIndexOf(tk.name);
    if (matchIdx === -1) {
      continue; // stray close tag — ignore
    }
    while (stack.length > matchIdx) {
      emit(stack.pop() as Frame);
    }
  }
  // Flush anything left unclosed.
  while (stack.length) {
    emit(stack.pop() as Frame);
  }
  return root;
}

// Renders backend HTML as a safe React tree. Falls back to plain text when the
// content has no tags (the common short-description case).
export function RichText({ html }: { html: string }): ReactNode {
  if (!html.includes("<")) {
    return html;
  }
  return createElement(Fragment, null, ...richTextToNodes(html));
}
