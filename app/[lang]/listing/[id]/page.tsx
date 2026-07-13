import { notFound, redirect } from "next/navigation";
import { requireLocale } from "@/app/lib/seo";
import { localePath } from "@/app/lib/i18n/config";
import { isListingId } from "@/app/lib/listing-url";

// The app's listing deep link. Unlike the other app paths, a listing is PUBLIC —
// so the honest browser fallback is the real listing page, not a handoff card.
//
// We don't fetch anything to build the pretty slug: /skelbimai/[id] already accepts
// a bare id and canonicalises itself (and 404s a listing that doesn't exist), so a
// plain redirect is enough. Temporary (307), never permanent: the slug is derived
// from the owner's title, and a 308 would pin browsers to a stale one forever.
//
// force-dynamic: the locale comes from Accept-Language (proxy.ts), and the redirect
// target differs per locale — it must not be cached under the unprefixed URL.
export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/[lang]/listing/[id]">) {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  // Anything that isn't an id shape is a bad link, not a lookup. Fail before it can
  // reach the feed as a search-ish path.
  if (!isListingId(id)) {
    notFound();
  }
  redirect(localePath(locale, `/skelbimai/${id}`));
}
