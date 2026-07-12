import { after } from "next/server";

const MAX_REPORT_BYTES = 64 * 1024;

function redactReportUrls(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactReportUrls(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, child]) => [childKey, redactReportUrls(child, childKey)]),
    );
  }
  if (typeof value === "string" && /(url|uri|source-file)/i.test(key)) {
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    } catch {
      return value.slice(0, 240);
    }
  }
  return value;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_REPORT_BYTES) {
    return new Response(null, { status: 413 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType &&
    !contentType.includes("application/csp-report") &&
    !contentType.includes("application/reports+json") &&
    !contentType.includes("application/json")
  ) {
    return new Response(null, { status: 415 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  after(() => {
    // CSP document/source URLs can contain one-time action tokens. Keep the
    // violation evidence while stripping query strings and fragments before it
    // reaches platform logs.
    console.warn("[csp-report]", JSON.stringify(redactReportUrls(body)).slice(0, MAX_REPORT_BYTES));
  });

  return new Response(null, { status: 204 });
}
