const PACKAGE_NAME = process.env.ANDROID_APP_LINK_PACKAGE_NAME ?? "com.naudokis.naudokis";
const SHA256_FINGERPRINT = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;

function fingerprints(): string[] {
  return (process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS ?? "")
    .split(/[,\n;]/)
    .map((value) => value.trim())
    .map((value) => value.toUpperCase())
    .filter((value, index, all) => SHA256_FINGERPRINT.test(value) && all.indexOf(value) === index);
}

export const dynamic = "force-dynamic";

export function GET() {
  const sha256 = fingerprints();
  if (sha256.length < 2) {
    return Response.json(
      {
        error: "Two valid Android SHA-256 certificate fingerprints are required",
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
