// CAP-C runs list — GET with optional filters → gateflow GET /api/v1/runs
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { PAGINATION } from "@/lib/constants";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

interface UpstreamRunSummary {
  run_id: string;
  org: string;
  repo: string;
  status_type: string;
  outcome_type?: string | null;
  initiative_id?: string | null;
  wave_id?: string | null;
  wave_duration_ms?: number | null;
  pr_number?: number | null;
  issue_number?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const tenantId = entered?.tenantId;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "runs.errors.missingTenant");
  }

  const sp = request.nextUrl.searchParams;
  const limitRaw = Number(sp.get("limit") ?? PAGINATION.DEFAULT_LIMIT);
  const skipRaw = Number(sp.get("skip") ?? PAGINATION.DEFAULT_SKIP);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, Math.trunc(limitRaw)), PAGINATION.MAX_LIMIT)
    : PAGINATION.DEFAULT_LIMIT;
  const skip = Number.isFinite(skipRaw)
    ? Math.max(0, Math.trunc(skipRaw))
    : PAGINATION.DEFAULT_SKIP;

  const upstreamParams = new URLSearchParams();
  upstreamParams.set("limit", String(limit));
  upstreamParams.set("skip", String(skip));
  for (const key of ["initiative_id", "wave_id", "status_type", "org", "repo"] as const) {
    const v = sp.get(key)?.trim();
    if (v) upstreamParams.set(key, v);
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-runs-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/runs?${upstreamParams.toString()}`, {
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "runs.errors.loadFailed");
    }
    const raw = (await res.json()) as {
      items?: UpstreamRunSummary[];
      limit?: number;
      skip?: number;
    };
    const items = Array.isArray(raw.items) ? raw.items : [];
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      items: items.map((r) => ({
        runId: r.run_id,
        org: r.org,
        repo: r.repo,
        statusType: r.status_type,
        outcomeType: r.outcome_type ?? null,
        initiativeId: r.initiative_id ?? null,
        waveId: r.wave_id ?? null,
        waveDurationMs: r.wave_duration_ms ?? null,
        prNumber: r.pr_number ?? null,
        issueNumber: r.issue_number ?? null,
        createdAt: r.created_at ?? null,
        updatedAt: r.updated_at ?? null,
      })),
      limit: raw.limit ?? limit,
      skip: raw.skip ?? skip,
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
