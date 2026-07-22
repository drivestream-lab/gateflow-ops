// Liveness plumbing for probes and CI — not the hello world. The hello world is
// the authenticated status page at /.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
