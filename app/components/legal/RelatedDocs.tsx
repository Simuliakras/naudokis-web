// Legal — related-documents grid: siblings in the same group, topped up with
// core agreements when sparse. Excludes the current doc and the policy-center.
import Link from "next/link";
import type { Locale } from "@/app/lib/i18n/config";
import type { LegalDict } from "@/app/lib/i18n/types";
import type { LegalManifest, LegalDocMeta } from "@/app/lib/legal/types";
import { docHref } from "@/app/lib/legal/manifest";
import { Icon } from "./Icon";

export function RelatedDocs({
  manifest, currentId, locale, t,
}: {
  manifest: LegalManifest;
  currentId: string;
  locale: Locale;
  t: LegalDict;
}) {
  const cur = manifest.docs.find((d) => d.id === currentId);
  if (!cur) {
    return null;
  }
  const groupLabel = (id: string) => manifest.groups.find((g) => g.id === id)?.label;

  const rel: LegalDocMeta[] = manifest.docs.filter(
    (d) => d.grp === cur.grp && d.id !== currentId && d.id !== "policy-center",
  );
  if (rel.length < 3) {
    for (const d of manifest.docs) {
      if (rel.length >= 4) {
        break;
      }
      if (d.id !== currentId && d.grp === "core" && d.id !== "policy-center" && !rel.includes(d)) {
        rel.push(d);
      }
    }
  }
  const shown = rel.slice(0, 6);
  if (shown.length === 0) {
    return null;
  }

  return (
    <section className="nk-lg-related">
      <h2 className="nk-lg-related__h">{t.related}</h2>
      <div className="nk-lg-relgrid">
        {shown.map((d) => (
          <Link key={d.id} className="nk-lg-relcard" href={docHref(d, locale)}>
            <span className="nk-lg-relcard__grp">{groupLabel(d.grp)?.[locale] ?? ""}</span>
            <span className="nk-lg-relcard__t">{d.label[locale]}<Icon name="arrowRight" size={17} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
