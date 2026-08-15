// Server → upstream fetch (nextjs-bff-route-handlers.mdc): base URL from env,
// Authorization forwarded server-side only, correlation id propagated.
import "server-only";
import { env } from "@/lib/env";
import { getSessionToken } from "@/lib/auth";
import { logger } from "@/lib/logging";

export async function upstreamFetch(
  path: string,
  init?: RequestInit & { correlationId?: string; token?: string },
): Promise<Response> {
  const url = `${env.UPSTREAM_BASE_URL}${path}`;
  // Explicit token wins — the session cookie does not exist yet mid-login.
  const token = init?.token ?? (await getSessionToken());
  const headers = new Headers(init?.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init?.correlationId) headers.set("x-correlation-id", init.correlationId);

  const started = Date.now();
  const res = await fetch(url, { ...init, headers });
  if (env.LOG_UPSTREAM_CALLS) {
    logger.debug({ path, status: res.status, durationMs: Date.now() - started }, "upstream call");
  }
  return res;
}
