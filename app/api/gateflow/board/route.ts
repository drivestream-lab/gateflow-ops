// CAP-E board tickets — GET/POST/PATCH with ?op=list|create|status|link
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decodeJwtPayload } from "@/lib/auth";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { upstreamFetch } from "@/lib/upstream-fetch";

async function requireTenant(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) return { error: bffError(401, "auth.errors.sessionExpired") as Response };
  const payload = decodeJwtPayload(token);
  const entered = await getEnteredProgrammeContext();
  const programmeId = entered?.programmeId;
  if (typeof programmeId !== "string" || !programmeId) {
    return { error: bffError(400, "board.errors.missingTenant") as Response };
  }
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  return { payload, programmeId, correlationId };
}

async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const gate = await requireTenant(request);
  if ("error" in gate && gate.error) return gate.error;
  const { payload, programmeId, correlationId } = gate as {
    payload: { sub?: string };
    programmeId: string;
    correlationId: string;
  };

  const sp = request.nextUrl.searchParams;
  const op = sp.get("op")?.trim() || "list";
  if (op !== "list") return bffError(400, "common.errors.badRequest");

  const org = sp.get("org")?.trim() ?? "";
  const repo = sp.get("repo")?.trim() ?? "";
  if (!org || !repo) return bffError(400, "board.errors.orgRepoRequired");

  const upstreamParams = new URLSearchParams({ org, repo });
  const initiativeId = sp.get("initiative_id")?.trim();
  const ticketType = sp.get("type")?.trim();
  const state = sp.get("state")?.trim();
  if (initiativeId) upstreamParams.set("initiative_id", initiativeId);
  if (ticketType) upstreamParams.set("type", ticketType);
  if (state) upstreamParams.set("state", state);

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-board-api",
    userId: payload?.sub as string,
    programmeId,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch(`/api/v1/board/tickets?${upstreamParams}`, {
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "board.errors.loadFailed");
    }
    const raw = (await res.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op: "list", data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireTenant(request);
  if ("error" in gate && gate.error) return gate.error;
  const { payload, programmeId, correlationId } = gate as {
    payload: { sub?: string };
    programmeId: string;
    correlationId: string;
  };

  const op = request.nextUrl.searchParams.get("op")?.trim() ?? "";
  if (op !== "create" && op !== "link") return bffError(400, "common.errors.badRequest");

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
  const rec = body as Record<string, unknown>;

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-board-api",
    userId: payload?.sub as string,
    programmeId,
  });
  const startTime = logRequestStart(logger);

  try {
    let upstream: Response;

    if (op === "create") {
      const org = str(rec.org);
      const repo = str(rec.repo);
      const title = str(rec.title);
      const ticketType = str(rec.ticket_type);
      const initiativeId = str(rec.initiative_id);
      if (!org || !repo || !title || !ticketType || !initiativeId) {
        return bffError(400, "common.errors.badRequest");
      }
      const createBody: Record<string, unknown> = {
        org,
        repo,
        title,
        ticket_type: ticketType,
        initiative_id: initiativeId,
      };
      const bodyText = str(rec.body);
      if (bodyText) createBody.body = bodyText;
      if (typeof rec.project_number === "number" && Number.isFinite(rec.project_number)) {
        createBody.project_number = Math.trunc(rec.project_number);
      }
      const projectOwner = str(rec.project_owner);
      if (projectOwner) createBody.project_owner = projectOwner;
      const parentTicketId = str(rec.parent_ticket_id);
      if (parentTicketId) createBody.parent_ticket_id = parentTicketId;
      // No tenant_id from the entered context — gateflow applies its board
      // default when project_number / tenant_id are omitted.
      const headers: Record<string, string> = { "content-type": "application/json" };
      const idem = request.headers.get("idempotency-key")?.trim();
      if (idem) headers["Idempotency-Key"] = idem;

      upstream = await upstreamFetch("/api/v1/board/tickets", {
        method: "POST",
        headers,
        body: JSON.stringify(createBody),
        correlationId,
      });
    } else {
      const ticketId = str(rec.ticket_id);
      const org = str(rec.org);
      const repo = str(rec.repo);
      const prRaw = rec.pr_number;
      const prNumber =
        typeof prRaw === "number" ? prRaw : typeof prRaw === "string" ? Number(prRaw) : NaN;
      if (!ticketId || !org || !repo || !Number.isFinite(prNumber)) {
        return bffError(400, "common.errors.badRequest");
      }
      upstream = await upstreamFetch(
        `/api/v1/board/tickets/${encodeURIComponent(ticketId)}/links`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            org,
            repo,
            pr_number: Math.trunc(prNumber),
          }),
          correlationId,
        },
      );
    }

    if (!upstream.ok) {
      logRequestError(
        logger,
        startTime,
        `upstream ${upstream.status}`,
        mapUpstreamStatus(upstream.status),
      );
      return bffError(
        mapUpstreamStatus(upstream.status),
        op === "create" ? "board.errors.createFailed" : "board.errors.linkFailed",
      );
    }
    const raw = (await upstream.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op, data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function PATCH(request: NextRequest) {
  const gate = await requireTenant(request);
  if ("error" in gate && gate.error) return gate.error;
  const { payload, programmeId, correlationId } = gate as {
    payload: { sub?: string };
    programmeId: string;
    correlationId: string;
  };

  const op = request.nextUrl.searchParams.get("op")?.trim() ?? "status";
  if (op !== "status") return bffError(400, "common.errors.badRequest");

  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") return bffError(400, "common.errors.badRequest");
  const rec = body as Record<string, unknown>;
  const ticketId = str(rec.ticket_id);
  const org = str(rec.org);
  const repo = str(rec.repo);
  const state = str(rec.state) || undefined;
  const column = str(rec.column) || undefined;
  if (!ticketId || !org || !repo || (!state && !column)) {
    return bffError(400, "common.errors.badRequest");
  }

  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-board-api",
    userId: payload?.sub as string,
    programmeId,
  });
  const startTime = logRequestStart(logger);

  try {
    const patchBody: Record<string, string> = { org, repo };
    if (state) patchBody.state = state;
    if (column) patchBody.column = column;

    const res = await upstreamFetch(
      `/api/v1/board/tickets/${encodeURIComponent(ticketId)}/status`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patchBody),
        correlationId,
      },
    );
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "board.errors.statusFailed");
    }
    const raw = (await res.json()) as unknown;
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ op: "status", data: raw });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
