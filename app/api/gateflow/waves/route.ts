// CAP-C wave start — POST ?lane=implement|spec|closeout → gateflow /waves/{lane}/start
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

const LANES = new Set(["implement", "spec", "closeout"]);

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "runs.errors.missingTenant");
  }

  const lane = request.nextUrl.searchParams.get("lane");
  if (!lane || !LANES.has(lane)) {
    return bffError(400, "common.errors.badRequest");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bffError(400, "common.errors.badRequest");
  }
  if (!body || typeof body !== "object") {
    return bffError(400, "common.errors.badRequest");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-waves-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/waves/${lane}/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "runs.errors.waveStartFailed");
    }
    const raw = (await res.json()) as {
      run_id: string;
      job_id?: string | null;
      status: string;
    };
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      runId: raw.run_id,
      jobId: raw.job_id ?? null,
      status: raw.status,
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
