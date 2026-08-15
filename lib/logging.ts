// One Pino root per Node process (nextjs-bff-route-handlers.mdc: Logging).
// Route handlers use child loggers with correlation + user context.
import "server-only";
import pino from "pino";
import { env } from "@/lib/env";

// pino-pretty is a devDependency — pretty transport is dev-only; production
// always emits structured JSON regardless of LOG_PRETTY.
const pretty = env.LOG_PRETTY && process.env.NODE_ENV !== "production";

const root = pino({
  level: env.LOG_LEVEL,
  ...(pretty ? { transport: { target: "pino-pretty" } } : {}),
});

export function createApiLogger(
  method: string,
  url: string,
  correlationId?: string,
  context?: { userId?: string; tenantId?: string; programmeId?: string; module?: string },
) {
  return root.child({
    module: context?.module ?? "api",
    method,
    path: new URL(url, "http://localhost").pathname,
    correlationId: correlationId ?? crypto.randomUUID(),
    userId: context?.userId,
    tenantId: context?.tenantId,
    programmeId: context?.programmeId,
  });
}

export const logger = root;
