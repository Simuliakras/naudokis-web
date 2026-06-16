// One-off converter: turns the provided legal markdown docs into the
// LegalDocument block-JSON that app/components/legal/Blocks.tsx renders.
//
// Source of truth: docs/Naudokis_teisiniai_dokumentai_LT (LT) and
// docs/Naudokis_legal_documents_EN (EN). Only the two primary documents we keep
// (Terms of Use + Privacy Policy) are converted; their in-text references to the
// removed specialised sub-documents are flattened to plain text, except mutual
// links between the two kept docs, which become internal `doc:` links.
//
// Run manually:  yarn legal:json   (alias for node scripts/legal-md-to-json.mjs)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LT_DIR = join(ROOT, "docs/Naudokis_teisiniai_dokumentai_LT");
const EN_DIR = join(ROOT, "docs/Naudokis_legal_documents_EN");
const OUT_DIR = join(ROOT, "app/lib/legal/data");

// Map a source filename stem → the doc id we keep, so mutual cross-links between
// Terms and Privacy survive as internal `doc:` links. Anything not listed here
// is a removed sub-document and gets flattened to its label text.
const KEPT_BY_FILE = {
  "naudokis-naudojimosi-salygos-lt-2026-06-01": "terms-of-use",
  "naudokis-terms-of-use-en-2026-06-01": "terms-of-use",
  "naudokis-privatumo-politika-lt-2026-06-01": "privacy-policy",
  "naudokis-privacy-policy-en-2026-06-01": "privacy-policy",
};

// The four conversions to run: { file, id, lang }.
const JOBS = [
  { file: "naudokis-naudojimosi-salygos-lt-2026-06-01.md", id: "terms-of-use", lang: "lt", dir: LT_DIR },
  { file: "naudokis-terms-of-use-en-2026-06-01.md", id: "terms-of-use", lang: "en", dir: EN_DIR },
  { file: "naudokis-privatumo-politika-lt-2026-06-01.md", id: "privacy-policy", lang: "lt", dir: LT_DIR },
  { file: "naudokis-privacy-policy-en-2026-06-01.md", id: "privacy-policy", lang: "en", dir: EN_DIR },
];

const DIACRITICS = { ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z" };
const BRIEF_RE = /^\*\*(?:Trumpai|In brief):\*\*\s*/;
const META_LINE_RE = /^(?:Įsigaliojimo data|Versija|Kalba|Paskutinį kartą atnaujinta|Dokumento ID|Effective date|Version|Language|Last updated|Document ID)\b/;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => DIACRITICS[c] || c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Flatten relative `.md` links: mutual Terms↔Privacy links become `doc:<id>`;
// every other `.md` target (a removed sub-document) is replaced by its label.
function flattenLinks(md) {
  return md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (whole, label, target) => {
    const m = target.match(/^(.*?)\.md(?:#.*)?$/);
    if (!m) {
      return whole;
    }
    const stem = m[1].replace(/^.*\//, "");
    const keptId = KEPT_BY_FILE[stem];
    return keptId ? `[${label}](doc:${keptId})` : label;
  });
}

function parseFrontMatter(lines) {
  const meta = {};
  if (lines[0]?.trim() !== "---") {
    return { meta, body: lines };
  }
  let i = 1;
  for (; i < lines.length && lines[i].trim() !== "---"; i++) {
    const m = lines[i].match(/^([A-Za-z_]+):\s*(.*)$/);
    if (m) {
      meta[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
    }
  }
  return { meta, body: lines.slice(i + 1) };
}

function splitTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => flattenLinks(c.trim()));
}

function isTableSeparator(line) {
  return /^\|[\s:|-]+\|?\s*$/.test(line) && line.includes("-");
}

function convert({ file, dir }) {
  const raw = readFileSync(join(dir, file), "utf8");
  const { meta: fm, body } = parseFrontMatter(raw.split(/\r?\n/));

  const docMeta = {
    title: fm.title || "",
    version: fm.version,
    effective_date: fm.effective_date,
    last_updated: fm.last_updated,
    document_id: fm.document_id,
    document_type: fm.document_type,
  };

  const blocks = [];
  const toc = [];
  let para = []; // buffer of consecutive plain text lines
  let seenHeading = false;

  const flushPara = () => {
    if (para.length === 0) {
      return;
    }
    const text = para.join(" ").trim();
    para = [];
    if (!text) {
      return;
    }
    // Drop the leading "Effective date / Version / …" metadata block.
    if (!seenHeading && META_LINE_RE.test(text)) {
      return;
    }
    if (BRIEF_RE.test(text)) {
      blocks.push({ t: "callout", md: flattenLinks(text.replace(BRIEF_RE, "")) });
      return;
    }
    blocks.push({ t: "p", md: flattenLinks(text) });
  };

  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushPara();
      continue;
    }

    // Top-level document title (`# …`) → document meta title, not a block.
    if (/^#\s+/.test(trimmed)) {
      flushPara();
      if (!docMeta.title) {
        docMeta.title = trimmed.replace(/^#\s+/, "").trim();
      }
      continue;
    }

    const h = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flushPara();
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 2) {
        seenHeading = true;
        const sid = slugify(text);
        blocks.push({ t: "h2", id: sid, text });
        const numMatch = text.match(/^(\d+)\.\s*(.*)$/);
        toc.push({
          id: sid,
          label: numMatch ? numMatch[2] : text,
          num: numMatch ? numMatch[1] : null,
        });
      } else if (level === 3) {
        blocks.push({ t: "h3", text });
      } else {
        blocks.push({ t: "h4", text });
      }
      continue;
    }

    if (trimmed === "---") {
      flushPara();
      blocks.push({ t: "hr" });
      continue;
    }

    // Table: a run of `| … |` lines.
    if (trimmed.startsWith("|")) {
      flushPara();
      const rows = [];
      while (i < body.length && body[i].trim().startsWith("|")) {
        const l = body[i].trim();
        if (!isTableSeparator(l)) {
          rows.push(splitTableRow(l));
        }
        i++;
      }
      i--;
      if (rows.length > 0) {
        blocks.push({ t: "table", head: rows[0], rows: rows.slice(1) });
      }
      continue;
    }

    // Unordered list: a run of `- ` / `* ` lines.
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items = [];
      while (i < body.length && /^[-*]\s+/.test(body[i].trim())) {
        items.push(flattenLinks(body[i].trim().replace(/^[-*]\s+/, "")));
        i++;
      }
      i--;
      blocks.push({ t: "ul", items });
      continue;
    }

    // Ordered list: a run of `1. ` lines.
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items = [];
      while (i < body.length && /^\d+\.\s+/.test(body[i].trim())) {
        items.push(flattenLinks(body[i].trim().replace(/^\d+\.\s+/, "")));
        i++;
      }
      i--;
      blocks.push({ t: "ol", items });
      continue;
    }

    para.push(trimmed);
  }
  flushPara();

  return { meta: docMeta, toc, blocks };
}

for (const job of JOBS) {
  let doc;
  try {
    doc = convert(job);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`✗ ${job.id}.${job.lang}: failed to convert ${join(job.dir, job.file)}\n  ${reason}`);
    process.exit(1);
  }
  const outPath = join(OUT_DIR, `${job.id}.${job.lang}.json`);
  writeFileSync(outPath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  const counts = doc.blocks.reduce((acc, b) => ((acc[b.t] = (acc[b.t] || 0) + 1), acc), {});
  console.log(`${job.id}.${job.lang}  toc:${doc.toc.length}  blocks:`, counts);
}
