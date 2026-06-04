// Legal — inline markdown → React nodes (ported from md.jsx). Supports
// **bold**, `code`, [text](href), bare emails & URLs, and internal doc:slug
// links that resolve to in-app routes via legalHref. Server component (pure).
import { Fragment, type ReactNode } from "react";
import type { Locale } from "@/app/lib/i18n/config";
import { legalHref } from "@/app/lib/legal/manifest";

// Priority-ordered constructs: bold | code | [label](href) | email | url.
// A fresh regex per call keeps `lastIndex` state local — required because Inline
// recurses into itself for **bold** content.
function tokenizer() {
  return /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(https?:\/\/[^\s)]+)/g;
}

export function Inline({ text, locale }: { text: string | undefined; locale: Locale }): ReactNode {
  if (text == null) {
    return null;
  }
  const re = tokenizer();
  const nodes: ReactNode[] = [];
  let key = 0;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    if (m[1] != null) {
      nodes.push(<strong key={key++}><Inline text={m[1]} locale={locale} /></strong>);
    } else if (m[2] != null) {
      nodes.push(<code key={key++}>{m[2]}</code>);
    } else if (m[3] != null) {
      const label = m[3];
      const href = m[4];
      if (href.startsWith("doc:")) {
        nodes.push(<a key={key++} href={legalHref(href.slice(4), locale)}>{label}</a>);
      } else if (href.startsWith("http")) {
        nodes.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer">{label}</a>);
      } else if (href.startsWith("#") || href.startsWith("mailto")) {
        nodes.push(<a key={key++} href={href}>{label}</a>);
      } else {
        nodes.push(<span key={key++}>{label}</span>);
      }
    } else if (m[5] != null) {
      nodes.push(<a key={key++} href={"mailto:" + m[5]}>{m[5]}</a>);
    } else if (m[6] != null) {
      nodes.push(<a key={key++} href={m[6]} target="_blank" rel="noopener noreferrer">{m[6]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return <Fragment>{nodes}</Fragment>;
}
