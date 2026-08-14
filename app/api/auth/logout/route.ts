import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { programmeContextCookieOptions } from "@/lib/programme-context";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(env.SESSION_COOKIE);
  response.cookies.set(env.PROGRAMME_CONTEXT_COOKIE, "", {
    ...programmeContextCookieOptions(),
    maxAge: 0,
  });
  return response;
}
