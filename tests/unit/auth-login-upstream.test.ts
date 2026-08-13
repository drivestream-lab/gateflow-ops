import { describe, expect, it } from "vitest";
import { toUpstreamLoginBody, UPSTREAM_AUTH_LOGIN_PATH } from "@/lib/auth-login-upstream";

describe("auth login upstream mapping", () => {
  it("maps portal email/password to gateflow credential_identifier", () => {
    expect(toUpstreamLoginBody({ email: " ops@example.com ", password: "secret" })).toEqual({
      credential_identifier: "ops@example.com",
      password: "secret",
    });
  });

  it("rejects missing fields", () => {
    expect(toUpstreamLoginBody({ email: "", password: "x" })).toBeNull();
    expect(toUpstreamLoginBody({ email: "a@b.c", password: "" })).toBeNull();
    expect(toUpstreamLoginBody({})).toBeNull();
  });

  it("targets gateflow JWT login path", () => {
    expect(UPSTREAM_AUTH_LOGIN_PATH).toBe("/api/auth/login");
  });
});
