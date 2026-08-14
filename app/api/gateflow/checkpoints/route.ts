// CAP-D checkpoints — GET ?op=status|history
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { PAGINATION } from "@/lib/constants";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

const OPS = new Set(["status", "history"]);

async function requireTenant(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return { error: bffError(401, "auth.errors.sessionExpired") as Response };
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const tenantId = entered?.tenantId;
  if (typeof tenantId !== "string" || !tenantId) {
    return { error: bffError(400, "checkpoints.errors.missingTenant") as Response };
  }
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  return { payload, tenantId, correlationId };
}

function checkpointErrorKey(status: number, upstreamBody: string): string {
  const lower = upstreamBody.toLowerCase();
  if (status === 404 && lower.includes("no run found")) {
    return "checkpoints.errors.noRunFound";
  }
  if (status === 404) return "checkpoints.errors.notFound";
  return "checkpoints.errors.loadFailed";
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
  const op = sp.get("op")?.trim() ?? "";
  if (!OPS.has(op)) return bffError(400, "common.errors.badRequest");

  const upstreamParams = new URLSearchParams();
  if (op === "status") {
    const checkpointId = sp.get("checkpoint_id")?.trim();
    if (!checkpointId) return bffError(400, "common.errors.badRequest");
    upstreamParams.set("checkpoint_id", checkpointId);

    const initiativeId = sp.get("initiative_id")?.trim();
    const waveId = sp.get("wave_id")?.trim();
    const owner = sp.get("owner")?.trim();
    const repo = sp.get("repo")?.trim();
    const prRaw = sp.get("pr_number")?.trim();

    const hasComposed = Boolean(initiativeId && waveId);
    const hasRaw = Boolean(owner && repo && prRaw);
    if (!hasComposed && !hasRaw) return bffError(400, "common.errors.badRequest");

    if (hasComposed) {
      upstreamParams.set("initiative_id", initiativeId!);
      upstreamParams.set("wave_id", waveId!);
    } else {
      upstreamParams.set("owner", owner!);
      upstreamParams.set("repo", repo!);
      upstreamParams.set("pr_number", prRaw!);
    }
  } else {
    const owner = sp.get("owner")?.trim();
    const repo = sp.get("repo")?.trim();
    const prRaw = sp.get("pr_number")?.trim();
    if (!owner || !repo || !prRaw) return bffError(400, "common.errors.badRequest");
    upstreamParams.set("owner", owner);
    upstreamParams.set("repo", repo);
    upstreamParams.set("pr_number", prRaw);
    const checkpointId = sp.get("checkpoint_id")?.trim();
    if (checkpointId) upstreamParams.set("checkpoint_id", checkpointId);

    const limitRaw = Number(sp.get("limit") ?? PAGINATION.DEFAULT_LIMIT);
    const skipRaw = Number(sp.get("skip") ?? PAGINATION.DEFAULT_SKIP);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(1, Math.trunc(limitRaw)), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;
    const skip = Number.isFinite(skipRaw)
      ? Math.max(0, Math.trunc(skipRaw))
      : PAGINATION.DEFAULT_SKIP;
    upstreamParams.set("limit", String(limit));
    upstreamParams.set("skip", String(skip));
  }

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-checkpoints-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/checkpoints/${op}?${upstreamParams}`, {
      correlationId,
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      const mapped = mapUpstreamStatus(res.status);
      logRequestError(logger, startTime, `upstream ${res.status}`, mapped);
      return bffError(mapped, checkpointErrorKey(res.status, bodyText));
    }
    const raw = (await res.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op, data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
