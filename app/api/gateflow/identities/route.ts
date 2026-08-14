// CTR-01 identity factory list/search/create — platform_admin only.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import {
  IDENTITIES_PAGE_SIZE_DEFAULT,
  IDENTITIES_PAGE_SIZE_MAX,
  PAGINATION,
} from "@/lib/constants";
import { isEmailIdentifier } from "@/lib/auth-login-upstream";
import { createApiLogger } from "@/lib/logging";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

export const UPSTREAM_IDENTITIES_PATH = "/api/v1/identities";

export interface IdentityDto {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended: boolean;
}

export function identityCreateRefuseKey(input: {
  name?: string;
  email?: string;
  password?: string;
}): string | null {
  if (!input.name?.trim()) return "identities.errors.missingName";
  const email = input.email?.trim() ?? "";
  if (!isEmailIdentifier(email)) return "identities.errors.notAnEmail";
  if (!input.password) return "identities.errors.missingPassword";
  return null;
}

/** Whitelist DTO — never copies password or token fields (REQ-30). */
export function stripIdentitySecrets(raw: unknown): IdentityDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = rec.id ?? rec.identity_id ?? rec.user_id;
  const name = rec.name;
  const email = rec.email ?? rec.credential_identifier;
  if (typeof id !== "string" || !id) return null;
  if (typeof name !== "string" || typeof email !== "string") return null;
  const role = typeof rec.role === "string" ? rec.role : "tenant_admin";
  const suspended = rec.suspended === true || rec.status === "suspended";
  return { id, name, email, role, suspended };
}

export function filterIdentitiesByQuery(items: IdentityDto[], query: string): IdentityDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => item.name.toLowerCase().includes(q) || item.email.toLowerCase() === q,
  );
}

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
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
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
      body: JSON.stringify({
        name: body.name?.trim(),
        email: body.email?.trim(),
        password: body.password,
        role: "tenant_admin",
      }),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
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
