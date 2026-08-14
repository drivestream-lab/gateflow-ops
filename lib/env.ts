// Server-only environment access (nextjs-bff-server-auth.mdc: upstream URLs and
// credentials live ONLY on the server; no NEXT_PUBLIC_* for privileged upstreams).
// Validated at first import — fail fast, not on first request.
import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

export const env = {
  /** Base URL of the primary upstream service (gateflow). */
  UPSTREAM_BASE_URL: required("UPSTREAM_BASE_URL"),
  /** dev-stub | jwt-upstream — see lib/auth.ts */
  AUTH_MODE: process.env.AUTH_MODE ?? "dev-stub",
  SESSION_COOKIE: process.env.SESSION_COOKIE ?? "portal_session",
  /** httpOnly store for entered programme/tenant ids (ADR-002). Not a Bearer. */
  PROGRAMME_CONTEXT_COOKIE: process.env.PROGRAMME_CONTEXT_COOKIE ?? "portal_programme_context",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  LOG_PRETTY: process.env.LOG_PRETTY === "true",
  LOG_UPSTREAM_CALLS: process.env.LOG_UPSTREAM_CALLS !== "false",
} as const;
