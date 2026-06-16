// Legal — document metadata chips (effective / version / updated / id).
import type { Locale } from "@/app/lib/i18n/config";
import type { LegalDict } from "@/app/lib/i18n/types";
import type { DocMeta } from "@/app/lib/legal/types";
import { fmtDate } from "@/app/lib/legal/format";
import { Icon, type LegalIconName } from "./Icon";

export function MetaChips({
  meta, locale, t,
}: {
  meta: DocMeta;
  locale: Locale;
  t: LegalDict;
}) {
  const chips: [LegalIconName, string, string][] = [];
  if (meta.effective_date) {
    chips.push(["calendar", t.effective, fmtDate(meta.effective_date, locale)]);
  }
  if (meta.last_updated) {
    chips.push(["calendar", t.updated, fmtDate(meta.last_updated, locale)]);
  }
  return (
    <div className="nk-lg-meta">
      {chips.map((c, i) => (
        <span key={i} className="nk-lg-chip">
          <Icon name={c[0]} size={14} /><span>{c[1]}</span>&nbsp;<b>{c[2]}</b>
        </span>
      ))}
    </div>
  );
}
