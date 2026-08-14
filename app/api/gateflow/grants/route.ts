// CTR-02 grant / detach / membership — platform_admin only. No password on grant.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestError, logRequestStart, logRequestSuccess } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

export const UPSTREAM_GRANTS_PATH = "/api/v1/grants";

export interface GrantDto {
  identityId: string;
  programmeId: string;
  email: string | null;
  name: string | null;
  programmeName: string | null;
}

export interface GrantWriteInput {
  identityId?: string;
  email?: string;
  programmeId?: string;
  password?: string;
  role?: string;
}

export function grantWriteRefuseKey(input: GrantWriteInput): string | null {
  const identityId = input.identityId?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  if (!identityId && !email) return "grants.errors.unknownIdentity";
  if (!input.programmeId?.trim()) return "grants.errors.unknownProgramme";
  if (input.password) return "grants.errors.passwordNotAllowed";
  if (input.role?.trim().toLowerCase() === "platform_admin") {
    return "grants.errors.platformAdminNotGrantable";
  }
  return null;
}

/** Whitelist DTO — never copies password or token fields (REQ-30). */
export function stripGrantSecrets(raw: unknown): GrantDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const identityId = rec.identity_id ?? rec.identityId ?? rec.user_id ?? rec.id;
  const programmeId = rec.programme_id ?? rec.programmeId;
  if (typeof identityId !== "string" || !identityId) return null;
  if (typeof programmeId !== "string" || !programmeId) return null;
  const email =
    typeof rec.email === "string"
      ? rec.email
      : typeof rec.credential_identifier === "string"
        ? rec.credential_identifier
        : null;
  const name = typeof rec.name === "string" ? rec.name : null;
  const programmeName =
    typeof rec.programme_name === "string"
      ? rec.programme_name
      : typeof rec.programmeName === "string"
        ? rec.programmeName
        : null;
  return { identityId, programmeId, email, name, programmeName };
}

export function grantUpstreamRefuseKey(status: number, raw: unknown): string {
  if (status === 403) return "grants.errors.wrongActor";
  const text =
    raw && typeof raw === "object"
      ? JSON.stringify(raw).toLowerCase()
      : typeof raw === "string"
        ? raw.toLowerCase()
        : "";
  if (status === 404 || status === 400) {
    if (text.includes("programme")) return "grants.errors.unknownProgramme";
    if (text.includes("identity") || text.includes("user") || text.includes("email")) {
      return "grants.errors.unknownIdentity";
    }
    return "grants.errors.unknownIdentity";
  }
  if (status === 409) return "grants.errors.duplicateGrant";
  return "grants.errors.actionFailed";
}

function writeBody(input: GrantWriteInput): Record<string, string> {
  const body: Record<string, string> = {
    programme_id: input.programmeId?.trim() ?? "",
  };
  if (input.identityId?.trim()) body.identity_id = input.identityId.trim();
  if (input.email?.trim()) body.email = input.email.trim();
  return body;
}

export async function GET(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) {
    if (gate.status === 403) return bffError(403, "grants.errors.wrongActor");
    return gate;
  }

  const identityId = request.nextUrl.searchParams.get("identity_id")?.trim() ?? "";
  const programmeId = request.nextUrl.searchParams.get("programme_id")?.trim() ?? "";
  if (!identityId && !programmeId) return bffError(400, "grants.errors.unknownIdentity");

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-grants-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const params = new URLSearchParams();
    if (identityId) params.set("identity_id", identityId);
    if (programmeId) params.set("programme_id", programmeId);
    const res = await upstreamFetch(`${UPSTREAM_GRANTS_PATH}?${params.toString()}`, {
      correlationId,
    });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), grantUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json()) as unknown;
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray((raw as { grants?: unknown }).grants)
        ? (raw as { grants: unknown[] }).grants
        : [];
    const grants = list.map(stripGrantSecrets).filter((item): item is GrantDto => item !== null);
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

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-grants-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(UPSTREAM_GRANTS_PATH, {
      method: detach ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(writeBody(body)),
      correlationId,
    });
    if (!res.ok) {
      const raw = await res.json().catch(() => null);
      // Repeat grant is idempotent (REQ-07): already-granted is success.
      if (!detach && res.status === 409) {
        const dto = stripGrantSecrets(raw) ?? {
          identityId: body.identityId?.trim() || body.email?.trim() || "",
          programmeId: body.programmeId?.trim() ?? "",
          email: body.email?.trim() ?? null,
          name: null,
          programmeName: null,
        };
        logRequestSuccess(logger, startTime, 200);
        return NextResponse.json({ ...dto, idempotent: true });
      }
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), grantUpstreamRefuseKey(res.status, raw));
    }
    const raw = (await res.json().catch(() => ({}))) as unknown;
    const dto = stripGrantSecrets(raw);
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json(
      dto ?? {
        identityId: body.identityId?.trim() || body.email?.trim() || "",
        programmeId: body.programmeId?.trim() ?? "",
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
