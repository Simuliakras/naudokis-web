// App-handoff landing for an app-only screen linked from transactional email.
// Nothing is fetched for the id — see app/lib/app-links.ts for why.
import { requireLocale } from "@/app/lib/seo";
import { AppHandoffScreen } from "@/app/components/AppHandoffScreen";

// The locale is negotiated per request from Accept-Language (proxy.ts), so a shared
// cache must never store one locale's render under the unprefixed URL.
export const dynamic = "force-dynamic";

export { handoffMetadata as generateMetadata } from "@/app/lib/handoff-page";

export default async function Page({ params }: PageProps<"/[lang]/billing-documents/[id]">) {
  const { lang, id } = await params;
  requireLocale(lang);
  return <AppHandoffScreen kind="billingDocuments" appPath={`/billing-documents/${encodeURIComponent(id)}`} />;
}
