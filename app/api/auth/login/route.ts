// Portal session login (nextjs-bff-server-auth.mdc): server-side login sets an
// httpOnly cookie; the browser never stores upstream JWTs.
//
// AUTH_MODE=dev-stub    → issues a local, UNSIGNED dev token. Chassis default so
//                         the hello-world page works before any IdP exists.
//                         MUST be replaced/disabled before production.
// AUTH_MODE=jwt-upstream → forwards credentials to gateflow POST /api/auth/login
//                         and stores the JWT it returns.
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { bffError, mapUpstreamStatus } from "@/lib/bff";
import { createApiLogger } from "@/lib/logging";
import { upstreamFetch } from "@/lib/upstream-fetch";
import {
  portalLoginRefuseKey,
  toUpstreamLoginBody,
  UPSTREAM_AUTH_LOGIN_PATH,
} from "@/lib/auth-login-upstream";
import { programmeContextCookieOptions } from "@/lib/programme-context";

function devStubToken(email: string): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const payload = {
    sub: `dev-${email}`,
    email,
    exp: Math.floor(Date.now() / 1000) + 8 * 3600,
  };
  return `${b64({ alg: "none", typ: "JWT" })}.${b64(payload)}.dev`;
}

export async function POST(request: NextRequest) {
  const logger = createApiLogger(request.method, request.url, undefined, {
    module: "auth-login-api",
  });
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  if (!body) return bffError(400, "auth.errors.invalidRequest");
  const refuseKey = portalLoginRefuseKey(body);
  if (refuseKey) return bffError(400, refuseKey);
  const upstreamBody = toUpstreamLoginBody(body);
  if (!upstreamBody) return bffError(400, "auth.errors.invalidRequest");

  let token: string;
  if (env.AUTH_MODE === "dev-stub") {
    token = devStubToken(upstreamBody.credential_identifier);
    logger.warn("dev-stub login issued — replace AUTH_MODE before production");
  } else {
    const res = await upstreamFetch(UPSTREAM_AUTH_LOGIN_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(upstreamBody),
    });
    if (!res.ok) {
      logger.info({ status: res.status }, "upstream login rejected");
      return bffError(mapUpstreamStatus(res.status), "auth.errors.invalidCredentials");
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      logger.info("upstream login missing access_token");
      return bffError(502, "common.errors.upstreamUnavailable");
    }
    token = data.access_token;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(env.SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set(env.PROGRAMME_CONTEXT_COOKIE, "", {
    ...programmeContextCookieOptions(),
    maxAge: 0,
  });
  logger.info("session established");
  return response;
}
