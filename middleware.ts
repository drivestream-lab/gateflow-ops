import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Lightweight inbound BFF logging (Edge-safe — no pino here). Upstream calls are
 * logged from Node route handlers via lib/upstream-fetch.ts.
 *
 * - LOG_API_INBOUND — "false" disables; "true" enables in all envs;
 *   unset enables when NODE_ENV !== "production".
 * - LOG_REQUESTS — when "false", inbound lines are off.
 */
export function middleware(request: NextRequest) {
  const enabled =
    process.env.LOG_API_INBOUND !== "false" &&
    process.env.LOG_REQUESTS !== "false" &&
    (process.env.LOG_API_INBOUND === "true" || process.env.NODE_ENV !== "production");
  if (enabled) {
    console.info(`[bff-inbound] ${request.method} ${request.nextUrl.pathname}`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
