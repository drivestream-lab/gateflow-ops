// Shared BFF response shaping (nextjs-bff-route-handlers.mdc): map upstream
// errors to stable client codes; never leak internal fields or raw upstream URLs.
import "server-only";
import { NextResponse } from "next/server";
import { t } from "@/lib/i18n";

export function bffError(status: number, key: string): NextResponse {
  return NextResponse.json({ error: t(key) }, { status });
}

/** Map an upstream response to a stable client status per app convention. */
export function mapUpstreamStatus(upstream: number): number {
  if (upstream === 401) return 401; // session invalid → authFetch redirects
  if (upstream === 403) return 403;
  if (upstream === 404) return 404;
  if (upstream >= 400 && upstream < 500) return 400;
  return 502; // any upstream 5xx → gateway error, details stay in logs
}
