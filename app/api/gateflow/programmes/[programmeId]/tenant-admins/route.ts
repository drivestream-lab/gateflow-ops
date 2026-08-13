// CAP-P attach tenant_admin — strips access_token before browser response.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import {
  stripAttachAccessToken,
  type UpstreamAttachTenantAdminResponse,
} from "@/lib/programme-attach";
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

  let body: { credential_identifier?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return bffError(400, "common.errors.badRequest");
  }

  const credentialIdentifier = body.credential_identifier?.trim();
  const password = body.password;
  if (!credentialIdentifier || !password) {
    return bffError(400, "common.errors.badRequest");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-programmes-tenant-admins-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(
      `/api/v1/programmes/${encodeURIComponent(programmeId)}/tenant-admins`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          credential_identifier: credentialIdentifier,
          password,
        }),
        correlationId,
      },
    );
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "programmes.errors.attachFailed");
    }
    const raw = (await res.json()) as UpstreamAttachTenantAdminResponse;
    const safe = stripAttachAccessToken(raw);
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(safe);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
