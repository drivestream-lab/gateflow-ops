// Session introspection — the authFetch-able "who am I" for client code.
// Returns the decoded session payload (never the raw token).
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { bffError } from "@/lib/bff";

export async function GET() {
  const session = await getSession();
  if (!session) return bffError(401, "auth.errors.sessionExpired");
  return NextResponse.json({
    sub: session.sub,
    email: session.email,
    tenantId: session.tenant_id,
    role: session.role,
    expiresAt: session.exp,
  });
}
