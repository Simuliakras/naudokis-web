import document from "@/app/lib/apple-app-site-association.json";

// Served as a route, not a file in public/, for one reason: the Content-Type.
// Apple requires application/json and rejects the file otherwise, but a static
// public/ asset is delivered straight off the CDN on some hosts (verified on
// Amplify Hosting, which served it as application/octet-stream and applied none of
// next.config.ts's headers()). A route handler owns its own response headers on
// every host, so the contract cannot be silently lost by changing where we deploy.
//
// Apple also rejects redirects, so this must answer 200 directly — see the
// extensionless path: the OS never fetches a .json file.
//
// Dynamic for the same reason as assetlinks.json: a prerendered route can be
// flattened into a CDN-served file, which is exactly the failure this replaces.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(document, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
