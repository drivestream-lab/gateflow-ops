import { describe, expect, it } from "vitest";
import {
  LOGIN_ERROR_INVALID_REQUEST,
  LOGIN_ERROR_NOT_AN_EMAIL,
  portalLoginRefuseKey,
  toUpstreamLoginBody,
  UPSTREAM_AUTH_LOGIN_PATH,
} from "@/lib/auth-login-upstream";
import { t } from "@/lib/i18n";

describe("auth login upstream mapping", () => {
  it("maps portal email/password to gateflow credential_identifier", () => {
    expect(toUpstreamLoginBody({ email: " ops@example.com ", password: "secret" })).toEqual({
      credential_identifier: "ops@example.com",
      password: "secret",
    });
    expect(portalLoginRefuseKey({ email: "ops@example.com", password: "secret" })).toBeNull();
  });

  it("refuses empty, no-at, and no-domain identifiers with a named i18n key", () => {
    expect(portalLoginRefuseKey({ email: "", password: "x" })).toBe(LOGIN_ERROR_NOT_AN_EMAIL);
    expect(portalLoginRefuseKey({ email: "not-an-email", password: "x" })).toBe(
      LOGIN_ERROR_NOT_AN_EMAIL,
    );
    expect(portalLoginRefuseKey({ email: "ops@", password: "x" })).toBe(LOGIN_ERROR_NOT_AN_EMAIL);
    expect(toUpstreamLoginBody({ email: "", password: "x" })).toBeNull();
    expect(toUpstreamLoginBody({ email: "not-an-email", password: "x" })).toBeNull();
    expect(toUpstreamLoginBody({ email: "ops@", password: "x" })).toBeNull();
    expect(t(LOGIN_ERROR_NOT_AN_EMAIL)).not.toContain("missing");
  });

  it("rejects missing password with the request key", () => {
    expect(portalLoginRefuseKey({ email: "a@b.c", password: "" })).toBe(
      LOGIN_ERROR_INVALID_REQUEST,
    );
    expect(toUpstreamLoginBody({ email: "a@b.c", password: "" })).toBeNull();
    expect(toUpstreamLoginBody({})).toBeNull();
  });

  it("targets gateflow JWT login path", () => {
    expect(UPSTREAM_AUTH_LOGIN_PATH).toBe("/api/auth/login");
  });
});
