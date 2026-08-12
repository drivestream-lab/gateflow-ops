// CAP-A tenant detail — session-resolved tenant only (no tenant list).
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

interface TenantRepoRef {
  org: string;
  repo: string;
}

interface TenantDetail {
  tenant_id: string;
  name: string;
  repos: TenantRepoRef[];
  workspace_root: string;
  board?: { org?: string; project?: string } | null;
}

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "tenants.errors.missingTenant");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-tenants-api",
    userId: payload?.sub as string,
    tenantId,
  });

  const startTime = logRequestStart(logger);
  try {
    const res = await upstreamFetch(`/api/v1/tenants/${tenantId}`, { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "tenants.errors.loadFailed");
    }
    const raw = (await res.json()) as TenantDetail;
    const response = NextResponse.json({
      tenantId: raw.tenant_id,
      name: raw.name,
      workspaceRoot: raw.workspace_root,
      repos: raw.repos ?? [],
      board: raw.board ?? null,
    });
    logRequestSuccess(logger, startTime, 200);
    return response;
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
