// CAP-A tenant user invite — session-resolved tenant only.
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "tenants.errors.missingTenant");
  }

  let body: { identity?: string };
  try {
    body = (await request.json()) as { identity?: string };
  } catch {
    return bffError(400, "common.errors.badRequest");
  }
  const identity = body.identity?.trim();
  if (!identity) return bffError(400, "common.errors.badRequest");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-tenants-users-api",
    userId: payload?.sub as string,
    tenantId,
  });

  const startTime = logRequestStart(logger);
  try {
    const res = await upstreamFetch(`/api/v1/tenants/${tenantId}/users`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identity }),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "tenants.errors.inviteFailed");
    }
    const raw = (await res.json()) as { tenant_id: string; identity: string };
    const response = NextResponse.json({
      tenantId: raw.tenant_id,
      identity: raw.identity,
    });
    logRequestSuccess(logger, startTime, 200);
    return response;
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
