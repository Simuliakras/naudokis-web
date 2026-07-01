const PACKAGE_NAME = "com.naudokis.naudokis";

function fingerprints(): string[] {
  return (process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS ?? "")
    .split(/[,\n;]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export const dynamic = "force-dynamic";

export function GET() {
  const sha256 = fingerprints();
  if (sha256.length === 0) {
    return Response.json(
      {
        error: "ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS is not configured",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return Response.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: sha256,
        },
      },
    ],
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
