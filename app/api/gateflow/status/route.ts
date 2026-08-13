// Status probe BFF — chassis exemplar pattern (nextjs-bff-route-handlers.mdc).
// Always probes gateflow GET /health via UPSTREAM_BASE_URL.
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

const UPSTREAM_HEALTH_PATH = "/health";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-status-api",
    userId: payload?.sub as string,
    tenantId: payload?.tenant_id as string,
  });

  const startTime = logRequestStart(logger);
  try {
    const upstreamStart = Date.now();
    const res = await upstreamFetch(UPSTREAM_HEALTH_PATH, { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "common.errors.upstreamUnavailable");
    }
    const response = NextResponse.json({
      connected: true,
      latencyMs: Date.now() - upstreamStart,
      probePath: UPSTREAM_HEALTH_PATH,
    });
    logRequestSuccess(logger, startTime, 200);
    return response;
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
