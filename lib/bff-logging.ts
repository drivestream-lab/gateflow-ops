// BFF route handler request lifecycle logging (nextjs-bff-route-handlers.mdc).
// Call these three functions in every route handler for consistent structured
// logs: start → success | error, always with durationMs.
//
// Usage pattern:
//   const logger = createApiLogger(...);
//   const startTime = logRequestStart(logger);
//   try {
//     ...
//     logRequestSuccess(logger, startTime, 200);
//   } catch (error) {
//     logRequestError(logger, startTime, error, 502);
//   }
import "server-only";
import type { Logger } from "pino";

/**
 * Call at the top of every handler, after the logger is created.
 * Returns the wall-clock start timestamp to pass to the other two functions.
 */
export function logRequestStart(logger: Logger): number {
  logger.info("bff request started");
  return Date.now();
}

/**
 * Call immediately before returning a successful response.
 */
export function logRequestSuccess(logger: Logger, startTime: number, status: number = 200): void {
  logger.info({ status, durationMs: Date.now() - startTime }, "bff request completed");
}

/**
 * Call in catch blocks and in early-return error paths (upstream !ok, missing session).
 * Accepts any thrown value — Error instances are unwrapped to their message.
 */
export function logRequestError(
  logger: Logger,
  startTime: number,
  error: unknown,
  status: number,
): void {
  logger.error(
    {
      status,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    },
    "bff request failed",
  );
}
