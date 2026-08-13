// CAP-P platform programme catalogue refresh (gateflow REQ-49).
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { mapProgrammeReadModel, type UpstreamProgrammeReadModel } from "@/lib/programme-read";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

interface RouteParams {
  params: Promise<{ programmeId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) return gate;

  const { programmeId } = await params;
  if (!programmeId?.trim()) return bffError(400, "common.errors.badRequest");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-programmes-catalogue-refresh-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(
      `/api/v1/programmes/${encodeURIComponent(programmeId)}/catalogue/refresh`,
      {
        method: "POST",
        correlationId,
      },
    );
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "programmes.errors.catalogueRefreshFailed");
    }
    const raw = (await res.json()) as UpstreamProgrammeReadModel;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(mapProgrammeReadModel(raw));
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
