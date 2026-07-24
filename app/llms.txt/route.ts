import {
  APP_STORE_URL,
  COMPANY_CODE,
  CONTACT_EMAIL,
  LEGAL_NAME,
  PLAY_STORE_URL,
  SITE_ORIGIN,
} from "@/app/lib/contact";
import { localePath } from "@/app/lib/i18n/config";

// /llms.txt — the llmstxt.org convention: a short markdown briefing for LLM
// crawlers/agents. English on purpose (the audience is a model, not a visitor),
// so none of this belongs in the dictionaries. URLs go through localePath so a
// route rename can't silently strand a hand-typed link here.
//
// Served as a route, not a file in public/, for the same reason as the
// .well-known documents: on Amplify a static asset is delivered straight off
// the CDN with none of our headers. Dynamic for the same reason too — a
// prerendered route can be flattened into exactly that kind of CDN file.
export const dynamic = "force-dynamic";

function link(path: string) {
  return `${SITE_ORIGIN}${localePath("lt", path)}`;
}
function linkEn(path: string) {
  return `${SITE_ORIGIN}${localePath("en", path)}`;
}
function page({ path, name, desc }: { path: string; name: string; desc: string }) {
  return `- [${name}](${link(path)}): ${desc} (English: ${linkEn(path)})`;
}

const PAGES = [
  { path: "/", name: "Home", desc: "what Naudokis is and how renting works" },
  { path: "/skelbimai", name: "Rental listings", desc: "browse and search every item for rent, with prices" },
  { path: "/nuoma", name: "Rental categories", desc: "directory of all rental categories" },
  { path: "/kaip-tai-veikia", name: "How it works", desc: "the rental process for renters and item owners" },
];

const POLICIES = [
  { path: "/naudojimosi-salygos", name: "Terms of use", desc: "the rules of the service" },
  { path: "/privatumo-politika", name: "Privacy policy", desc: "how personal data is handled" },
  { path: "/paskyros-trynimas", name: "Account deletion", desc: "how to delete a Naudokis account" },
];

const BODY = `# Naudokis

> Naudokis is a peer-to-peer item-rental marketplace in Lithuania: people rent
> tools, vehicles, electronics, and sports and leisure gear from private and
> business owners. This site is the public catalogue and information site;
> reservations happen in the Naudokis mobile app.

Key facts:

- Coverage: Lithuania. Languages: Lithuanian (default, unprefixed URLs) and
  English (the same pages under /en, with translated slugs).
- Listings are published by private individuals and businesses; the rental
  agreement is made directly between the parties.
- Browsing and search work on the web without an account; reserving an item,
  contacting the owner, and payment happen in the mobile app.
- Operated by ${LEGAL_NAME} (company code ${COMPANY_CODE}), Lithuania.
  Contact: ${CONTACT_EMAIL}.

## Main pages

${PAGES.map(page).join("\n")}

## Policies

${POLICIES.map(page).join("\n")}

## Mobile app

- [Naudokis on the App Store](${APP_STORE_URL})
- [Naudokis on Google Play](${PLAY_STORE_URL})

## Machine-readable

- [Sitemap](${SITE_ORIGIN}/sitemap.xml): every indexable page in both languages
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
