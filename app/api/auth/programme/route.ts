// CTR-04 enter / leave — tenant_admin only. Sets PROGRAMME_CONTEXT_COOKIE.
// Identity Bearer stays on SESSION_COOKIE (ADR-002 Option B).
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import { env } from "@/lib/env";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext, programmeContextCookieOptions } from "@/lib/programme-context";
import { isPlatformAdmin, isTenantAdmin } from "@/lib/session-role";
import { upstreamFetch } from "@/lib/upstream-fetch";

export const UPSTREAM_MY_GRANTS_PATH = "/api/v1/grants";
export const UPSTREAM_ENTER_PATH = "/api/v1/programme-context";

export interface GrantedProgrammeDto {
  programmeId: string;
  tenantId: string;
  programmeName: string | null;
}

export interface EnterWriteInput {
  programmeId?: string;
  password?: string;
}

export function enterWriteRefuseKey(input: EnterWriteInput): string | null {
  if (input.password) return "programmes.errors.passwordNotAllowed";
  if (!input.programmeId?.trim()) return "programmes.errors.notGranted";
  return null;
}

/** Whitelist DTO — never copies password or token fields. */
export function stripGrantedProgramme(raw: unknown): GrantedProgrammeDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const programmeId = rec.programme_id ?? rec.programmeId;
  const tenantId = rec.tenant_id ?? rec.tenantId;
  if (typeof programmeId !== "string" || !programmeId) return null;
  if (typeof tenantId !== "string" || !tenantId) return null;
  const programmeName =
    typeof rec.programme_name === "string"
      ? rec.programme_name
      : typeof rec.programmeName === "string"
        ? rec.programmeName
        : null;
  return { programmeId, tenantId, programmeName };
}

export function enterUpstreamRefuseKey(status: number, raw: unknown): string {
  if (status === 403) return "programmes.errors.wrongActor";
  const text =
    raw && typeof raw !== "object"
      ? String(raw).toLowerCase()
      : raw && typeof raw === "object"
        ? JSON.stringify(raw).toLowerCase()
        : "";
  if (status === 404 || status === 400) {
    if (text.includes("grant") || text.includes("not granted") || text.includes("programme")) {
      return "programmes.errors.notGranted";
    }
    return "programmes.errors.notGranted";
  }
  return "programmes.errors.actionFailed";
}

function contextCookieValue(programmeId: string, tenantId: string): string {
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
    const res = await upstreamFetch(UPSTREAM_MY_GRANTS_PATH, { correlationId });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), enterUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json()) as unknown;
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { grants?: unknown }).grants)
        ? (raw as { grants: unknown[] }).grants
        : [];
    const programmes = list
      .map(stripGrantedProgramme)
      .filter((item): item is GrantedProgrammeDto => item !== null);
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
      body: JSON.stringify({ programme_id: body.programmeId?.trim() }),
      correlationId,
    });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), enterUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json().catch(() => ({}))) as unknown;
    const dto = stripGrantedProgramme(raw);
    if (!dto) {
      logRequestError(logger, startTime, "enter response missing ids", 502);
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
