// JSON-LD structured data — renders one <script type="application/ld+json">.
// Server-safe (no "use client"); inject it from server page components so the
// markup lands in the initial HTML where crawlers read it. Builders live in
// app/lib/seo.ts; this component only serializes them.
import type { JsonLdNode } from "@/app/lib/seo";

export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      // Serialized server-side from typed builders; no user HTML, only data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
