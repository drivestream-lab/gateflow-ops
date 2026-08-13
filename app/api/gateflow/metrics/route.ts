// CAP-G metrics — GET ?op=runs|skill-efficacy|factory-effectiveness|delivery-scorecard
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

const OPS = new Set(["runs", "skill-efficacy", "factory-effectiveness", "delivery-scorecard"]);

function upstreamPath(op: string): string {
  return `/api/v1/metrics/${op}`;
}

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "metrics.errors.missingTenant");
  }

  const sp = request.nextUrl.searchParams;
  const op = sp.get("op")?.trim() ?? "";
  if (!OPS.has(op)) return bffError(400, "common.errors.badRequest");

  const upstreamParams = new URLSearchParams();
  if (op === "skill-efficacy") {
    const modelId = sp.get("model_id")?.trim();
    const promptRevision = sp.get("prompt_revision")?.trim();
    if (modelId) upstreamParams.set("model_id", modelId);
    if (promptRevision) upstreamParams.set("prompt_revision", promptRevision);
  }

  const qs = upstreamParams.toString();
  const path = `${upstreamPath(op)}${qs ? `?${qs}` : ""}`;
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-metrics-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(path, { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "metrics.errors.loadFailed");
    }
    const raw = (await res.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op, data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
