// INIT-019 — admit one catalogue meta PR. Never call GitHub here.
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { mapUpstreamPickerItem, pickerUpstreamRefuseKey } from "@/lib/meta-pr-picker";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const tenantId = entered?.tenantId;
  if (typeof tenantId !== "string" || !tenantId) {
    return bffError(400, "initiatives.errors.missingTenant");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bffError(400, "common.errors.badRequest");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-meta-pulls-onboard-api",
    userId: payload?.sub as string,
    tenantId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/tenants/${tenantId}/programme/meta/pulls/onboard`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      correlationId,
    });
    if (!res.ok) {
      const raw: unknown = await res.json().catch(() => null);
      const mapped = mapUpstreamStatus(res.status);
      logRequestError(logger, startTime, `upstream ${res.status}`, mapped);
      return bffError(mapped, pickerUpstreamRefuseKey(res.status, raw));
    }
    const mapped = mapUpstreamPickerItem(await res.json());
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(mapped);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
