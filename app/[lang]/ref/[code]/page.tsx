import { redirect } from "next/navigation";
import { requireLocale } from "@/app/lib/seo";
import { localePath } from "@/app/lib/i18n/config";
import { normalizeCode } from "@/app/lib/referrals";

// Legacy referral path (/ref/<code>) kept alive because it is claimed as an app
// link and may still be in circulation. The bridge itself lives at /invite, which
// is where the code is validated, shown for manual entry, and where the visitor is
// asked about attribution — so hand it straight over.
//
// A code that can't be a code is dropped rather than passed on: /invite fails open
// and still offers the install, so there is nothing to gain by forwarding garbage.
export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/[lang]/ref/[code]">) {
  const { lang, code } = await params;
  const locale = requireLocale(lang);
  const normalized = normalizeCode(code);
  redirect(localePath(locale, normalized ? `/invite?code=${normalized}` : "/invite"));
}
