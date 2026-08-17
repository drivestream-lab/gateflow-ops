// INIT-019 — implemented runners + models from gateflow. Never invent a catalogue here.
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { mapUpstreamRunners } from "@/lib/runner-catalogue";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  if (!entered?.programmeId) {
    return bffError(400, "runs.errors.missingTenant");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-runners-api",
    userId: payload?.sub as string,
    programmeId: entered.programmeId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch("/api/v1/runners", { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "initiatives.errors.runnersFailed");
    }
    const mapped = mapUpstreamRunners(await res.json());
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(mapped);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
