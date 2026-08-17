// CTR-02 grant / detach / membership — platform_admin only. No password on grant.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import {
  detachUpstreamPath,
  grantUpstreamBody,
  grantUpstreamPath,
  grantUpstreamRefuseKey,
  grantsListUpstreamTarget,
  grantWriteRefuseKey,
  identitiesByEmailPath,
  membersToGrantDtos,
  membershipsToGrantDtos,
  resolveIdentityIdByEmail,
  stripGrantSecrets,
  upstreamErrorSummary,
  type GrantWriteInput,
} from "@/lib/grants-directory";
import { createApiLogger } from "@/lib/logging";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

export async function GET(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "grants.errors.wrongActor");
    return gate;
  }

  const identityId = request.nextUrl.searchParams.get("identity_id")?.trim() ?? "";
  const programmeId = request.nextUrl.searchParams.get("programme_id")?.trim() ?? "";
  const target = grantsListUpstreamTarget({ identityId, programmeId });
  if (!target) return bffError(400, "grants.errors.unknownIdentity");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-grants-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(target.path, { correlationId });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(
        logger,
        startTime,
        upstreamErrorSummary(res.status, raw),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), grantUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json()) as unknown;
    const mapped =
      target.shape === "members"
        ? membersToGrantDtos(raw, programmeId)
        : membershipsToGrantDtos(raw);
    const grants = mapped.filter(
      (item) =>
        (!identityId || item.identityId === identityId) &&
        (!programmeId || item.programmeId === programmeId),
    );
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ grants });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "grants.errors.wrongActor");
    return gate;
  }

  let body: GrantWriteInput;
  try {
    body = (await request.json()) as GrantWriteInput;
  } catch {
    return bffError(400, "grants.errors.unknownIdentity");
  }

  const refuse = grantWriteRefuseKey(body);
  if (refuse) return bffError(400, refuse);

  const op = request.nextUrl.searchParams.get("op")?.trim();
  const detach = op === "detach";
  const programmeId = body.programmeId?.trim() ?? "";

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-grants-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    // Gateflow grants by identity_id only — resolve email → identity when needed.
    let identityId = body.identityId?.trim() ?? "";
    if (!identityId) {
      const email = body.email?.trim() ?? "";
      const lookup = await upstreamFetch(identitiesByEmailPath(email), { correlationId });
      if (!lookup.ok) {
        const raw = await lookup.json().catch(() => null);
        logRequestError(
          logger,
          startTime,
          upstreamErrorSummary(lookup.status, raw),
          mapUpstreamStatus(lookup.status),
        );
        return bffError(mapUpstreamStatus(lookup.status), "grants.errors.unknownIdentity");
      }
      identityId = resolveIdentityIdByEmail(await lookup.json(), email) ?? "";
      if (!identityId) {
        logRequestError(logger, startTime, `identity email ${email} not found upstream`, 400);
        return bffError(400, "grants.errors.unknownIdentity");
      }
    }

    const res = await upstreamFetch(
      detach ? detachUpstreamPath(programmeId, identityId) : grantUpstreamPath(programmeId),
      {
        method: detach ? "DELETE" : "POST",
        headers: { "content-type": "application/json" },
        body: detach ? undefined : JSON.stringify(grantUpstreamBody(identityId)),
        correlationId,
      },
    );
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(
        logger,
        startTime,
        upstreamErrorSummary(res.status, raw),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), grantUpstreamRefuseKey(res.status, raw));
    }
    // Gateflow grant/detach are idempotent-200 (REQ-07): repeat grant returns the
    // existing membership; repeat detach returns a synthesized membership.
    const raw = (await res.json().catch(() => ({}))) as unknown;
    const dto = stripGrantSecrets(raw);
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(
      dto
        ? { ...dto, email: dto.email ?? body.email?.trim() ?? null }
        : {
            identityId,
            programmeId,
            email: body.email?.trim() ?? null,
            name: null,
            programmeName: null,
            ok: true,
          },
    );
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
