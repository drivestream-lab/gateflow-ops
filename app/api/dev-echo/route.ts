// DEV-ONLY upstream stand-in. UPSTREAM_BASE_URL points here by default so the
// hello-world page proves the full BFF round-trip before a real upstream exists.
// Pointing UPSTREAM_BASE_URL at the real service is a developer's first task.
// Returns 404 in production builds.
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    status: "ok",
    echo: true,
    receivedAuth: request.headers.has("authorization"),
    correlationId: request.headers.get("x-correlation-id"),
  });
}
