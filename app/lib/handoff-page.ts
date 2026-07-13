// The copy side of the app-handoff routes (the path/predicate side is app-links.ts,
// which must stay dictionary-free for the edge proxy).
//
// Every handoff route uses this verbatim: `export const generateMetadata = handoffMetadata`.
// One title for all of them, deliberately generic — the per-kind copy belongs on the
// page, not in the browser title or history, where "Your booking request…" would say
// more about the visitor than it needs to. noindex,nofollow: these are tokenized,
// personal, one-time URLs with nothing to crawl.
import type { Metadata } from "next";
import { requireLocale } from "./seo";
import { getDictionary } from "./i18n/dictionaries";

export async function handoffMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { handoff } = getDictionary(requireLocale(lang));
  return {
    title: handoff.meta.title,
    description: handoff.meta.description,
    robots: { index: false, follow: false },
  };
}
