// CTR-04 enter / leave — tenant_admin only. Sets PROGRAMME_CONTEXT_COOKIE.
// Identity Bearer stays on SESSION_COOKIE (ADR-002 Option B).
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import { env } from "@/lib/env";
import { createApiLogger } from "@/lib/logging";
import {
  getEnteredProgrammeContext,
  lastProgrammeCookieOptions,
  programmeContextCookieOptions,
} from "@/lib/programme-context";
import {
  enterUpstreamRefuseKey,
  enterWriteRefuseKey,
  lastProgrammeCookieValue,
  snapshotEnteredProgramme,
  snapshotGrants,
  UPSTREAM_ENTER_PATH,
  UPSTREAM_ME_PATH,
  type EnterWriteInput,
} from "@/lib/programme-enter";
import { isPlatformAdmin, isTenantAdmin } from "@/lib/session-role";
import { upstreamFetch } from "@/lib/upstream-fetch";

function contextCookieValue(programmeId: string, tenantId: string | null): string {
  return JSON.stringify({ programmeId, tenantId });
}

async function requireTenantAdminActor() {
  const session = await getSession();
  if (!session) return bffError(401, "auth.errors.sessionExpired");
  if (isPlatformAdmin(session) || !isTenantAdmin(session)) {
    return bffError(403, "programmes.errors.wrongActor");
  }
  return session;
}

export async function GET(request: NextRequest) {
  const gate = await requireTenantAdminActor();
  if (gate instanceof Response) return gate;

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "auth-programme-api",
    userId: gate.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(UPSTREAM_ME_PATH, { correlationId });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(
        logger,
        startTime,
        `upstream ${res.status}: ${JSON.stringify(raw)?.slice(0, 300) ?? ""}`,
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), enterUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json()) as unknown;
    const programmes = snapshotGrants(raw);
    const entered = await getEnteredProgrammeContext();
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({
      programmes,
      entered: entered ? { programmeId: entered.programmeId, tenantId: entered.tenantId } : null,
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenantAdminActor();
  if (gate instanceof Response) return gate;

  const op = request.nextUrl.searchParams.get("op")?.trim();
  if (op === "leave") {
    const response = NextResponse.json({ ok: true, entered: null });
    response.cookies.set(env.PROGRAMME_CONTEXT_COOKIE, "", {
      ...programmeContextCookieOptions(),
      maxAge: 0,
    });
    return response;
  }

  let body: EnterWriteInput;
  try {
    body = (await request.json()) as EnterWriteInput;
  } catch {
    return bffError(400, "programmes.errors.notGranted");
  }

  const refuse = enterWriteRefuseKey(body);
  if (refuse) return bffError(400, refuse);
  const programmeId = body.programmeId?.trim() ?? "";

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "auth-programme-api",
    userId: gate.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(UPSTREAM_ENTER_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ programme_id: programmeId }),
      correlationId,
    });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(
        logger,
        startTime,
        `upstream ${res.status}: ${JSON.stringify(raw)?.slice(0, 300) ?? ""}`,
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), enterUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json().catch(() => ({}))) as unknown;
    const dto = snapshotEnteredProgramme(raw, programmeId);
    if (!dto) {
      logRequestError(logger, startTime, "enter response missing entered programme", 502);
      return bffError(502, "common.errors.upstreamUnavailable");
    }
    const response = NextResponse.json({
      ok: true,
      programmeId: dto.programmeId,
      tenantId: dto.tenantId,
    });
    response.cookies.set(
      env.PROGRAMME_CONTEXT_COOKIE,
      contextCookieValue(dto.programmeId, dto.tenantId),
      programmeContextCookieOptions(),
    );
    if (typeof gate.sub === "string" && gate.sub) {
      response.cookies.set(
        env.LAST_PROGRAMME_COOKIE,
        lastProgrammeCookieValue({ sub: gate.sub, programmeId: dto.programmeId }),
        lastProgrammeCookieOptions(),
      );
    }
    logRequestSuccess(logger, startTime, 200);
    return response;
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function DELETE() {
  const gate = await requireTenantAdminActor();
  if (gate instanceof Response) return gate;
  const response = NextResponse.json({ ok: true, entered: null });
  response.cookies.set(env.PROGRAMME_CONTEXT_COOKIE, "", {
    ...programmeContextCookieOptions(),
    maxAge: 0,
  });
  return response;
}
