// Localized long-date formatting for legal document metadata (ported from the
// handoff md.jsx fmtDate). Input is an ISO date like "2026-06-01".
import type { Locale } from "@/app/lib/i18n/config";

const LT_MONTHS = [
  "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
  "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio",
];
const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Truncate to ~n chars on a word/punctuation boundary, appending an ellipsis.
// Shared by the hub cards and the SEO meta-description builder.
export function truncate(s: string, n: number): string {
  if (!s) {
    return "";
  }
  return s.length > n ? s.slice(0, n).replace(/[\s,.;:]+\S*$/, "") + "…" : s;
}

export function fmtDate(iso: string | undefined, locale: Locale): string {
  if (!iso) {
    return "";
  }
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    return iso;
  }
  const year = m[1];
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (locale === "lt") {
    return `${year} m. ${LT_MONTHS[month]} ${day} d.`;
  }
  return `${EN_MONTHS[month]} ${day}, ${year}`;
}
