// Portal session login (nextjs-bff-server-auth.mdc): server-side login sets an
// httpOnly cookie; the browser never stores upstream JWTs.
//
// AUTH_MODE=dev-stub    → issues a local, UNSIGNED dev token. Chassis default so
//                         the hello-world page works before any IdP exists.
//                         MUST be replaced/disabled before production.
// AUTH_MODE=jwt-upstream → forwards credentials to the upstream auth endpoint and
//                         stores the JWT it returns.
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";

function devStubToken(email: string): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = {
    sub: `dev-${email}`,
    email,
    tenant_id: "dev",
    exp: Math.floor(Date.now() / 1000) + 8 * 3600,
  };
  return `${b64({ alg: "none", typ: "JWT" })}.${b64(payload)}.dev`;
}

export async function POST(request: NextRequest) {
  const logger = createApiLogger(request.method, request.url, undefined, {
    module: "auth-login-api",
  });
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) return bffError(400, "auth.errors.invalidRequest");

  let token: string;
  if (env.AUTH_MODE === "dev-stub") {
    token = devStubToken(body.email);
    logger.warn("dev-stub login issued — replace AUTH_MODE before production");
  } else {
    const res = await upstreamFetch("/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    if (!res.ok) {
      logger.info({ status: res.status }, "upstream login rejected");
      return bffError(mapUpstreamStatus(res.status), "auth.errors.invalidCredentials");
    }
    const data = await res.json();
    token = data.access_token;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(env.SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  logger.info("session established");
  return response;
}
