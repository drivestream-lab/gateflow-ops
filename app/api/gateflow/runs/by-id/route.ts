// CAP-C run detail — GET ?run_id= → gateflow GET /api/v1/runs/{run_id}
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "runs.errors.missingTenant");
  }

  const runId = request.nextUrl.searchParams.get("run_id")?.trim();
  if (!runId) return bffError(400, "common.errors.badRequest");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-runs-by-id-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/runs/${encodeURIComponent(runId)}`, {
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "runs.errors.detailFailed");
    }
    const raw = (await res.json()) as Record<string, unknown>;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      runId: raw.run_id,
      org: raw.org,
      repo: raw.repo,
      statusType: raw.status_type,
      outcomeType: raw.outcome_type ?? null,
      workflowNode: raw.workflow_node ?? null,
      prNumber: raw.pr_number ?? null,
      issueNumber: raw.issue_number ?? null,
      initiativeId: raw.initiative_id ?? null,
      waveId: raw.wave_id ?? null,
      waveDurationMs: raw.wave_duration_ms ?? null,
      retryCounter: raw.retry_counter ?? null,
      notifyPending: raw.notify_pending ?? null,
      createdAt: raw.created_at ?? null,
      updatedAt: raw.updated_at ?? null,
      stages: raw.stages ?? [],
      events: raw.events ?? [],
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
