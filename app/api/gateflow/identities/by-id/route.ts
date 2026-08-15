// CTR-01 identity detail + suspend / unsuspend / password-set — platform_admin only.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import {
  identityPasswordRefuseKey,
  stripIdentitySecrets,
  UPSTREAM_IDENTITIES_PATH,
  upstreamActionMethod,
  upstreamActionPath,
  upstreamErrorDetail,
  type IdentityDto,
} from "@/lib/identities-directory";
import { createApiLogger } from "@/lib/logging";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

function actionErrorKey(status: number): string {
  if (status === 404) return "identities.errors.unknownIdentity";
  if (status === 403) return "identities.errors.wrongActor";
  return "identities.errors.actionFailed";
}

export async function GET(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "identities.errors.wrongActor");
    return gate;
  }

  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) return bffError(400, "identities.errors.unknownIdentity");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-identities-by-id-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    // Gateflow has no GET /identities/{id}; fetch the directory and match by id.
    const res = await upstreamFetch(UPSTREAM_IDENTITIES_PATH, {
      correlationId,
    });
    if (!res.ok) {
      logRequestError(
        logger,
        startTime,
        await upstreamErrorDetail(res),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), actionErrorKey(res.status));
    }
    const raw = (await res.json()) as unknown;
    const list = Array.isArray(raw) ? raw : [];
    const dto =
      list
        .map(stripIdentitySecrets)
        .find((item): item is IdentityDto => item !== null && item.id === id) ?? null;
    if (!dto) {
      logRequestError(logger, startTime, `identity ${id} not found upstream`, 404);
      return bffError(404, "identities.errors.unknownIdentity");
    }
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(dto);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "identities.errors.wrongActor");
    return gate;
  }

  const id = request.nextUrl.searchParams.get("id")?.trim();
  const op = request.nextUrl.searchParams.get("op")?.trim();
  if (!id) return bffError(400, "identities.errors.unknownIdentity");
  if (op !== "suspend" && op !== "unsuspend" && op !== "password-set") {
    return bffError(400, "common.errors.badRequest");
  }

  let body: { password?: string } = {};
  if (op === "password-set") {
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return bffError(400, "identities.errors.missingPassword");
    }
    const refuse = identityPasswordRefuseKey(body.password);
    if (refuse) return bffError(400, refuse);
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-identities-by-id-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(upstreamActionPath(id, op), {
      method: upstreamActionMethod(op),
      headers: { "content-type": "application/json" },
      body: op === "password-set" ? JSON.stringify({ password: body.password }) : undefined,
      correlationId,
    });
    if (!res.ok) {
      logRequestError(
        logger,
        startTime,
        await upstreamErrorDetail(res),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), actionErrorKey(res.status));
    }
    const raw = (await res.json().catch(() => ({}))) as unknown;
    const dto = stripIdentitySecrets(raw);
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(dto ?? { ok: true, id });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
