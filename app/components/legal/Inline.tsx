// Legal — inline markdown → React nodes (ported from md.jsx). Supports
// **bold**, `code`, [text](href), bare emails & URLs, and internal doc:slug
// links that resolve to in-app routes via legalHref. Server component (pure).
import { Fragment, type ReactNode } from "react";
import type { Locale } from "@/app/lib/i18n/config";
import { localePrefix } from "@/app/lib/i18n/config";
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
        // Only canonical docs have routes; a retired sub-document resolves to
        // undefined and renders as plain text rather than a dead link.
        const docPath = legalHref(href.slice(4), locale);
        if (docPath) {
          nodes.push(<a key={key++} href={docPath}>{label}</a>);
        } else {
          nodes.push(<span key={key++}>{label}</span>);
        }
      } else if (href.startsWith("http")) {
        nodes.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer">{label}</a>);
      } else if (href.startsWith("#") || href.startsWith("mailto")) {
        nodes.push(<a key={key++} href={href}>{label}</a>);
      } else if (href.startsWith("/")) {
        // internal app route (e.g. the /teisine legal hub) — locale-prefixed
        nodes.push(<a key={key++} href={localePrefix(locale) + href}>{label}</a>);
      } else {
        nodes.push(<span key={key++}>{label}</span>);
      }
    } else if (m[5] != null) {
      nodes.push(<a key={key++} href={"mailto:" + m[5]}>{m[5]}</a>);
    } else if (m[6] != null) {
      // Bare URL. The greedy match can swallow trailing sentence punctuation
      // (e.g. "https://x.lt/," → the comma), which would then take the link
      // color and land in the href — strip it back out to plain text.
      const raw = m[6];
      const url = raw.replace(/[.,;:!?]+$/, "");
      nodes.push(<a key={key++} href={url} target="_blank" rel="noopener noreferrer">{url}</a>);
      if (url.length < raw.length) {
        nodes.push(raw.slice(url.length));
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return <Fragment>{nodes}</Fragment>;
}
