// CAP-F initiative detail + readouts — GET ?initiative_id=&op=&org=&repo=&wave_id=
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

const OPS = new Set([
  "detail",
  "waves",
  "spec",
  "implementation",
  "closeout",
  "merge",
  "completion",
  "closure",
]);

function upstreamPath(op: string, initiativeId: string, waveId: string | null): string | null {
  const base = `/api/v1/initiatives/${encodeURIComponent(initiativeId)}`;
  switch (op) {
    case "detail":
      return base;
    case "waves":
      return `${base}/waves`;
    case "spec":
      return `${base}/spec`;
    case "completion":
      return `${base}/completion`;
    case "closure":
      return `${base}/closure`;
    case "implementation":
    case "closeout":
    case "merge":
      if (!waveId) return null;
      return `${base}/waves/${encodeURIComponent(waveId)}/${op}`;
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const tenantId = entered?.tenantId;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "initiatives.errors.missingTenant");
  }

  const sp = request.nextUrl.searchParams;
  const initiativeId = sp.get("initiative_id")?.trim();
  const op = sp.get("op")?.trim() ?? "detail";
  const org = sp.get("org")?.trim();
  const repo = sp.get("repo")?.trim();
  const waveId = sp.get("wave_id")?.trim() ?? null;

  if (!initiativeId || !org || !repo || !OPS.has(op)) {
    return bffError(400, "common.errors.badRequest");
  }

  const path = upstreamPath(op, initiativeId, waveId);
  if (!path) return bffError(400, "common.errors.badRequest");

  const upstreamParams = new URLSearchParams({ org, repo });
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-initiatives-by-id-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`${path}?${upstreamParams}`, { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "initiatives.errors.detailFailed");
    }
    const raw = (await res.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op, initiativeId, org, repo, waveId, data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
