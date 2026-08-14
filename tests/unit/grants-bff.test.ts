// Unit-test grant refuse/strip helpers — live journeys in verify/08.
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const { grantWriteRefuseKey, stripGrantSecrets, grantUpstreamRefuseKey } =
  await import("@/app/api/gateflow/grants/route");

describe("grantWriteRefuseKey", () => {
  it("refuses a missing identity (REQ-08)", () => {
    expect(grantWriteRefuseKey({ programmeId: "p-1" })).toBe("grants.errors.unknownIdentity");
  });

  it("refuses a missing programme (REQ-28)", () => {
    expect(grantWriteRefuseKey({ identityId: "id-1" })).toBe("grants.errors.unknownProgramme");
  });

  it("refuses a password on grant (REQ-06 / REQ-30)", () => {
    expect(
      grantWriteRefuseKey({ identityId: "id-1", programmeId: "p-1", password: "secret" }),
    ).toBe("grants.errors.passwordNotAllowed");
  });

  it("refuses granting platform_admin (REQ-06)", () => {
    expect(
      grantWriteRefuseKey({
        identityId: "id-1",
        programmeId: "p-1",
        role: "platform_admin",
      }),
    ).toBe("grants.errors.platformAdminNotGrantable");
  });

  it("accepts identity + programme with no password", () => {
    expect(grantWriteRefuseKey({ identityId: "id-1", programmeId: "p-1" })).toBeNull();
    expect(grantWriteRefuseKey({ email: "ada@lab.example", programmeId: "p-1" })).toBeNull();
  });
});

describe("stripGrantSecrets", () => {
  it("omits password and token fields (REQ-30)", () => {
    const dto = stripGrantSecrets({
      identity_id: "id-1",
      programme_id: "p-1",
      email: "ada@lab.example",
      name: "Ada",
      programme_name: "Lab",
      password: "should-not-leak",
      access_token: "tok",
    });
    expect(dto).toEqual({
      identityId: "id-1",
      programmeId: "p-1",
      email: "ada@lab.example",
      name: "Ada",
      programmeName: "Lab",
    });
    expect(dto && "password" in dto).toBe(false);
    expect(dto && "access_token" in dto).toBe(false);
  });

  it("returns null when required ids are missing", () => {
    expect(stripGrantSecrets({ email: "ada@lab.example" })).toBeNull();
    expect(stripGrantSecrets(null)).toBeNull();
  });
});

describe("grantUpstreamRefuseKey", () => {
  it("maps unknown identity vs unknown programme (REQ-08, REQ-28)", () => {
    expect(grantUpstreamRefuseKey(404, { error: "identity not found" })).toBe(
      "grants.errors.unknownIdentity",
    );
    expect(grantUpstreamRefuseKey(404, { error: "programme missing" })).toBe(
      "grants.errors.unknownProgramme",
    );
  });

  it("treats 409 as already-granted for idempotent mapping (REQ-07)", () => {
    expect(grantUpstreamRefuseKey(409, {})).toBe("grants.errors.duplicateGrant");
  });
});
