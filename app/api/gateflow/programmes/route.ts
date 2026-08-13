// CAP-P platform programme list + validate-then-create.
import { NextRequest, NextResponse } from "next/server";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { logRequestStart, logRequestSuccess, logRequestError } from "@/lib/bff-logging";
import { createApiLogger } from "@/lib/logging";
import {
  mapCatalogueCandidate,
  mapProgrammeReadModel,
  type UpstreamCatalogueCandidate,
  type UpstreamProgrammeReadModel,
} from "@/lib/programme-read";
import { requirePlatformAdminSession } from "@/lib/require-platform-admin";
import { upstreamFetch } from "@/lib/upstream-fetch";

interface ProgrammeCreateResult {
  programme_id: string;
  tenant_id: string;
  repo_catalogue: UpstreamCatalogueCandidate[];
}

export async function GET(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) return gate;

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-programmes-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const res = await upstreamFetch("/api/v1/programmes", { correlationId });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "programmes.errors.loadFailed");
    }
    const raw = (await res.json()) as UpstreamProgrammeReadModel[];
    const list = Array.isArray(raw) ? raw.map(mapProgrammeReadModel) : [];
    logRequestSuccess(logger, startTime, 200);
    return NextResponse.json({ programmes: list });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}

export async function POST(request: NextRequest) {
  const gate = await requirePlatformAdminSession();
  if (gate instanceof Response) return gate;

  let body: {
    name?: string;
    meta_org?: string;
    meta_repo?: string;
    github_pat?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return bffError(400, "common.errors.badRequest");
  }

  const name = body.name?.trim();
  const metaOrg = body.meta_org?.trim();
  const metaRepo = body.meta_repo?.trim();
  const githubPat = body.github_pat;

  if (!name || !metaOrg || !metaRepo || !githubPat) {
    return bffError(400, "common.errors.badRequest");
  }

  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const logger = createApiLogger(request.method, request.url, correlationId, {
    module: "gateflow-programmes-api",
    userId: gate.payload.sub as string,
  });
  const startTime = logRequestStart(logger);

  try {
    const upstreamBody = {
      name,
      meta_org: metaOrg,
      meta_repo: metaRepo,
      github_pat: githubPat,
    };

    const res = await upstreamFetch("/api/v1/programmes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(upstreamBody),
      correlationId,
    });
    if (!res.ok) {
      logRequestError(logger, startTime, `upstream ${res.status}`, mapUpstreamStatus(res.status));
      return bffError(mapUpstreamStatus(res.status), "programmes.errors.createFailed");
    }
    const raw = (await res.json()) as ProgrammeCreateResult;
    logRequestSuccess(logger, startTime, 200);
    const catalogue = Array.isArray(raw.repo_catalogue) ? raw.repo_catalogue : [];
    return NextResponse.json({
      programmeId: raw.programme_id,
      tenantId: raw.tenant_id,
      repoCatalogue: catalogue.map(mapCatalogueCandidate),
    });
  } catch (error) {
    logRequestError(logger, startTime, error, 502);
    return bffError(502, "common.errors.upstreamUnavailable");
  }
}
