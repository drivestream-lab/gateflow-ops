// CAP-C forge authorize — POST ?run_id= → gateflow POST /runs/{id}/forge/authorize
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const programmeId = entered?.programmeId;
  if (typeof programmeId !== "string" || !programmeId) {
    return bffError(400, "runs.errors.missingTenant");
  }

  const runId = request.nextUrl.searchParams.get("run_id")?.trim();
  if (!runId) return bffError(400, "common.errors.badRequest");

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
    module: "gateflow-runs-forge-api",
    userId: payload?.sub as string,
    programmeId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/runs/${encodeURIComponent(runId)}/forge/authorize`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "runs.errors.forgeAuthorizeFailed");
    }
    const raw = (await res.json()) as Record<string, unknown>;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      runId: raw.run_id,
      workflowNode: raw.workflow_node,
      action: raw.action,
      prNumber: raw.pr_number ?? null,
      board: raw.board ?? null,
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
