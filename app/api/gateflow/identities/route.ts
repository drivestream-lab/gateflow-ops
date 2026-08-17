// CTR-01 identity factory list/search/create — platform_admin only.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import {
  IDENTITIES_PAGE_SIZE_DEFAULT,
  IDENTITIES_PAGE_SIZE_MAX,
  PAGINATION,
} from "@/lib/constants";
import {
  filterIdentitiesByQuery,
  identityCreateRefuseKey,
  identityCreateUpstreamBody,
  stripIdentitySecrets,
  UPSTREAM_IDENTITIES_PATH,
  upstreamErrorDetail,
  type IdentityDto,
} from "@/lib/identities-directory";
import { createApiLogger } from "@/lib/logging";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

function createErrorKey(status: number): string {
  if (status === 409) return "identities.errors.duplicateEmail";
  if (status === 403) return "identities.errors.wrongActor";
  return "identities.errors.createFailed";
}

export async function GET(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "identities.errors.wrongActor");
    return gate;
  }

  const skipRaw = Number(request.nextUrl.searchParams.get("skip") ?? PAGINATION.DEFAULT_SKIP);
  const limitRaw = Number(
    request.nextUrl.searchParams.get("limit") ?? IDENTITIES_PAGE_SIZE_DEFAULT,
  );
  const skip = Number.isFinite(skipRaw) && skipRaw >= 0 ? skipRaw : PAGINATION.DEFAULT_SKIP;
  const limit = Math.min(
    Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : IDENTITIES_PAGE_SIZE_DEFAULT,
    IDENTITIES_PAGE_SIZE_MAX,
  );
  const q = request.nextUrl.searchParams.get("q") ?? "";

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-identities-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (q.trim()) params.set("q", q.trim());
    const res = await upstreamFetch(`${UPSTREAM_IDENTITIES_PATH}?${params.toString()}`, {
      correlationId,
    });
    if (!res.ok) {
      logRequestError(
        logger,
        startTime,
        await upstreamErrorDetail(res),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), "identities.errors.loadFailed");
    }
    const raw = (await res.json()) as unknown;
    const list = Array.isArray(raw)
      ? raw
      : raw &&
          typeof raw === "object" &&
          Array.isArray((raw as { identities?: unknown }).identities)
        ? (raw as { identities: unknown[] }).identities
        : [];
    const mapped = list
      .map(stripIdentitySecrets)
      .filter((item): item is IdentityDto => item !== null);
    const identities = filterIdentitiesByQuery(mapped, q);
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ identities });
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

  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return bffError(400, "identities.errors.missingName");
  }

  const refuse = identityCreateRefuseKey(body);
  if (refuse) return bffError(400, refuse);

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-identities-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(UPSTREAM_IDENTITIES_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(identityCreateUpstreamBody(body)),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(
        logger,
        startTime,
        await upstreamErrorDetail(res),
        mapUpstreamStatus(res.status),
      );
      return bffError(mapUpstreamStatus(res.status), createErrorKey(res.status));
    }
    const dto = stripIdentitySecrets(await res.json());
    if (!dto) {
      logRequestError(logger, startTime, "identity create missing id", 502);
      return bffError(502, "common.errors.upstreamUnavailable");
    }
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(dto);
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
