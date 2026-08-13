// CAP-F initiatives list + closure start.
// GET → gateflow GET /api/v1/initiatives; POST ?op=closure-start → POST /initiatives/closure/start
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { PAGINATION } from "@/lib/constants";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

async function requireTenant(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return { error: bffError(401, "auth.errors.sessionExpired") as Response };
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return { error: bffError(400, "initiatives.errors.missingTenant") as Response };
  }
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  return { token, payload, tenantId, correlationId };
}

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request);
  if ("error" in gate && gate.error) return gate.error;

  const { payload, tenantId, correlationId } = gate as {
    payload: { sub?: string };
    tenantId: string;
    correlationId: string;
  };

  const sp = request.nextUrl.searchParams;
  const org = sp.get("org")?.trim();
  const repo = sp.get("repo")?.trim();
  if (!org || !repo) return bffError(400, "common.errors.badRequest");

  const limitRaw = Number(sp.get("limit") ?? PAGINATION.DEFAULT_LIMIT);
  const skipRaw = Number(sp.get("skip") ?? PAGINATION.DEFAULT_SKIP);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, Math.trunc(limitRaw)), PAGINATION.MAX_LIMIT)
    : PAGINATION.DEFAULT_LIMIT;
  const skip = Number.isFinite(skipRaw)
    ? Math.max(0, Math.trunc(skipRaw))
    : PAGINATION.DEFAULT_SKIP;

  const upstreamParams = new URLSearchParams({
    org,
    repo,
    limit: String(limit),
    skip: String(skip),
  });

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-initiatives-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/initiatives?${upstreamParams}`, { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "initiatives.errors.loadFailed");
    }
    const raw = (await res.json()) as {
      initiatives?: Array<{
        initiative_id: string;
        name: string;
        prd_approval: string;
        prd_approval_reason?: string | null;
        affected_repos?: string[];
        current_stage: string;
        current_stage_detail?: string | null;
        in_flight_run?: {
          run_id: string;
          wave_id?: string | null;
          status_type: string;
          workflow_node?: string | null;
          pr_number?: number | null;
          org: string;
          repo: string;
        } | null;
        epic_ticket_id?: string | null;
        epic_ticket_url?: string | null;
      }>;
    };
    const initiatives = Array.isArray(raw.initiatives) ? raw.initiatives : [];
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      initiatives: initiatives.map((item) => ({
        initiativeId: item.initiative_id,
        name: item.name,
        prdApproval: item.prd_approval,
        prdApprovalReason: item.prd_approval_reason ?? null,
        affectedRepos: Array.isArray(item.affected_repos) ? item.affected_repos : [],
        currentStage: item.current_stage,
        currentStageDetail: item.current_stage_detail ?? null,
        inFlightRun: item.in_flight_run
          ? {
              runId: item.in_flight_run.run_id,
              waveId: item.in_flight_run.wave_id ?? null,
              statusType: item.in_flight_run.status_type,
              workflowNode: item.in_flight_run.workflow_node ?? null,
              prNumber: item.in_flight_run.pr_number ?? null,
              org: item.in_flight_run.org,
              repo: item.in_flight_run.repo,
            }
          : null,
        epicTicketId: item.epic_ticket_id ?? null,
        epicTicketUrl: item.epic_ticket_url ?? null,
      })),
      org,
      repo,
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request);
  if ("error" in gate && gate.error) return gate.error;

  const { payload, tenantId, correlationId } = gate as {
    payload: { sub?: string };
    tenantId: string;
    correlationId: string;
  };

  const op = request.nextUrl.searchParams.get("op");
  if (op !== "closure-start") return bffError(400, "common.errors.badRequest");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bffError(400, "common.errors.badRequest");
  }
  if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-initiatives-closure-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch("/api/v1/initiatives/closure/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "initiatives.errors.closureStartFailed");
    }
    const raw = (await res.json()) as {
      run_id: string;
      job_id?: string | null;
      status: string;
    };
    logRequestSuccess(logger, startTime, res.status === 202 ? 202 : 200);
    return NextResponse.json(
      { runId: raw.run_id, jobId: raw.job_id ?? null, status: raw.status },
      { status: res.status === 202 ? 202 : 200 },
    );
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
