// CAP-B programme connect / catalogue / select / readiness / deselect.
// Single handler (WorkManifest file scope); `op` query selects the upstream call.
import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

type ProgrammeOp =
  | "connection"
  | "catalogue"
  | "connect"
  | "catalogue-refresh"
  | "select"
  | "readiness"
  | "deselect";

function basePath(tenantId: string): string {
  return `/api/v1/tenants/${tenantId}/programme`;
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  return handle(request, "GET");
}

export async function PUT(request: NextRequest) {
  return handle(request, "PUT");
}

export async function POST(request: NextRequest) {
  return handle(request, "POST");
}

async function handle(request: NextRequest, method: string) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  const tenantId = session?.tenant_id;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "fleet.errors.missingTenant");
  }

  const op = request.nextUrl.searchParams.get("op") as ProgrammeOp | null;
  if (!op) return bffError(400, "common.errors.badRequest");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-programme-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    let upstream: Response;

    if (method === "GET" && op === "connection") {
      upstream = await upstreamFetch(`${basePath(tenantId)}/connection`, { correlationId });
    } else if (method === "GET" && op === "catalogue") {
      upstream = await upstreamFetch(`${basePath(tenantId)}/catalogue`, { correlationId });
    } else if (method === "PUT" && op === "connect") {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
      upstream = await upstreamFetch(`${basePath(tenantId)}/connect`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        correlationId,
      });
    } else if (method === "POST" && op === "catalogue-refresh") {
      upstream = await upstreamFetch(`${basePath(tenantId)}/catalogue/refresh`, {
        method: "POST",
        correlationId,
      });
    } else if (method === "POST" && op === "select") {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
      upstream = await upstreamFetch(`${basePath(tenantId)}/repos/select`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        correlationId,
      });
    } else if (method === "POST" && op === "readiness") {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
      upstream = await upstreamFetch(`${basePath(tenantId)}/repos/readiness/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        correlationId,
      });
    } else if (method === "POST" && op === "deselect") {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
      upstream = await upstreamFetch(`${basePath(tenantId)}/repos/deselect`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        correlationId,
      });
    } else {
      return bffError(400, "common.errors.badRequest");
    }

    if (!upstream.ok) {
      logRequestError(
        logger,
        startTime,
        `upstream ${upstream.status}`,
        mapUpstreamStatus(upstream.status),
      );
      return bffError(mapUpstreamStatus(upstream.status), "fleet.errors.actionFailed");
    }

    const data: unknown = await upstream.json();
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(data);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
