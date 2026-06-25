import { after } from "next/server";

const MAX_REPORT_BYTES = 64 * 1024;

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
    console.warn("[csp-report]", JSON.stringify(body).slice(0, MAX_REPORT_BYTES));
  });

  return new Response(null, { status: 204 });
}
