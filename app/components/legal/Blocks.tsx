// Legal — block renderer (ported from md.jsx). Server component: turns the
// document's typed block list into static HTML, so the heavy document text ships
// as markup, not as JSON to the client.
import { Fragment } from "react";
import type { Locale } from "@/app/lib/i18n/config";
import type { Block, ListItem } from "@/app/lib/legal/types";
import { Inline } from "./Inline";

function ListItems({ items, locale }: { items: ListItem[]; locale: Locale }) {
  return (
    <>
      {items.map((it, j) => {
        const md = typeof it === "string" ? it : it.md;
        const sub = typeof it === "string" ? undefined : it.sub;
        return (
          <li key={j} className="nk-lg-li">
            <Inline text={md} locale={locale} />
            {sub && sub.length > 0 && (
              <ul className="nk-lg-li__sub">
                {sub.map((s, k) => (
                  <li key={k}><Inline text={s} locale={locale} /></li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}

export function Blocks({
  blocks, locale, briefLabel,
}: {
  blocks: Block[];
  locale: Locale;
  briefLabel: string;
}) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2": {
            const m = b.text.match(/^(\d+)\.\s*(.*)$/);
            return (
              <h2 key={i} id={b.id} className="nk-lg-h2">
                {m && <span className="nk-lg-h2__num">{m[1]}</span>}
                <span><Inline text={m ? m[2] : b.text} locale={locale} /></span>
              </h2>
            );
          }
          case "h3":
            return <h3 key={i} className="nk-lg-h3"><Inline text={b.text} locale={locale} /></h3>;
          case "h4":
            return <h4 key={i} className="nk-lg-h4"><Inline text={b.text} locale={locale} /></h4>;
          case "p":
            return <p key={i} className="nk-lg-p"><Inline text={b.md} locale={locale} /></p>;
          case "callout":
            return (
              <aside key={i} className="nk-lg-callout">
                <span className="nk-lg-callout__lbl">{briefLabel}</span>
                <p className="nk-lg-callout__body"><Inline text={b.md} locale={locale} /></p>
              </aside>
            );
          case "quote":
            return <blockquote key={i} className="nk-lg-quote"><Inline text={b.md} locale={locale} /></blockquote>;
          case "hr":
            return <hr key={i} className="nk-lg-hr" />;
          case "ul":
            return <ul key={i} className="nk-lg-ul"><ListItems items={b.items} locale={locale} /></ul>;
          case "ol":
            return <ol key={i} className="nk-lg-ol"><ListItems items={b.items} locale={locale} /></ol>;
          case "table":
            return (
              <div key={i} className="nk-lg-tablewrap">
                <div className="nk-lg-tablescroll">
                  <table className="nk-lg-table">
                    <thead>
                      <tr>{b.head.map((h, j) => <th key={j}><Inline text={h} locale={locale} /></th>)}</tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, j) => (
                        <tr key={j}>
                          {r.map((c, k) => <td key={k} className="nk-lg-td"><Inline text={c} locale={locale} /></td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          default:
            return <Fragment key={i} />;
        }
      })}
    </>
  );
}
