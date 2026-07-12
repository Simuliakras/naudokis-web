// Legal documents — data shapes for the manifest and parsed documents.
// The block union mirrors every `t` present across the data/*.json files; the
// loader casts the imported JSON to these types (JSON inference is too loose for
// the discriminated union).

export type Lang = "en" | "lt";

// One manifest entry per legal document. `hasEn` gates the loader's LT fallback;
// Localized titles drive the Policy Center; blurbs feed SEO descriptions.
export type LegalDocMeta = {
  id: string;
  hasEn: boolean;
  title: Record<Lang, string>;
  blurb: Record<Lang, string>;
};

export type LegalManifest = { docs: LegalDocMeta[] };

export type TocItem = { id: string; label: string; num: string | null };

export type DocMeta = {
  title: string;
  version?: string;
  effective_date?: string;
  last_updated?: string;
  document_id?: string;
  document_type?: string;
};

// A list item is either a plain markdown string or an object with nested `sub`.
export type ListItem = string | { md: string; sub?: string[] };

export type Block =
  | { t: "p"; md: string }
  | { t: "h2"; text: string; id: string }
  | { t: "h3"; text: string }
  | { t: "h4"; text: string }
  | { t: "callout"; md: string; variant?: "info" | "warning" }
  | { t: "quote"; md: string }
  | { t: "hr" }
  | { t: "ul"; items: ListItem[] }
  | { t: "ol"; items: ListItem[] }
  | { t: "table"; head: string[]; rows: string[][] };

export type LegalDocument = { meta: DocMeta; toc: TocItem[]; blocks: Block[] };
