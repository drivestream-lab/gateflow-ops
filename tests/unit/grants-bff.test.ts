// Unit-test grant refuse/strip helpers — live journeys in verify/08.
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const {
  grantWriteRefuseKey,
  stripGrantSecrets,
  grantUpstreamRefuseKey,
  grantsListUpstreamTarget,
  membersToGrantDtos,
  membershipsToGrantDtos,
  grantUpstreamPath,
  detachUpstreamPath,
  grantUpstreamBody,
  resolveIdentityIdByEmail,
} = await import("@/lib/grants-directory");

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

  it("maps gateflow 422 app-error bodies (message + details.reason)", () => {
    const unknownIdentity = {
      status: "error",
      error: {
        code: "UNPROCESSABLE",
        message: "Identity not found",
        details: { reason: "unknown identity" },
      },
    };
    const unknownProgramme = {
      status: "error",
      error: {
        code: "UNPROCESSABLE",
        message: "Programme not found",
        details: { reason: "unknown programme" },
      },
    };
    expect(grantUpstreamRefuseKey(422, unknownIdentity)).toBe("grants.errors.unknownIdentity");
    expect(grantUpstreamRefuseKey(422, unknownProgramme)).toBe("grants.errors.unknownProgramme");
  });

  it("maps platform_admin refusal regardless of status", () => {
    const body = {
      error: {
        message: "platform_admin not grantable",
        details: { reason: "platform_admin not grantable" },
      },
    };
    expect(grantUpstreamRefuseKey(422, body)).toBe("grants.errors.platformAdminNotGrantable");
  });

  it("treats 409 as already-granted for idempotent mapping (REQ-07)", () => {
    expect(grantUpstreamRefuseKey(409, {})).toBe("grants.errors.duplicateGrant");
  });
});

describe("grantsListUpstreamTarget", () => {
  it("uses the programme members endpoint when programme_id is given", () => {
    expect(grantsListUpstreamTarget({ programmeId: "p-1", identityId: "id-1" })).toEqual({
      path: "/api/v1/programmes/p-1/grants",
      shape: "members",
    });
  });

  it("uses the identity grants endpoint when only identity_id is given", () => {
    expect(grantsListUpstreamTarget({ identityId: "id-1" })).toEqual({
      path: "/api/v1/identities/id-1/grants",
      shape: "identity",
    });
  });

  it("returns null when neither filter is given", () => {
    expect(grantsListUpstreamTarget({})).toBeNull();
  });
});

describe("membersToGrantDtos", () => {
  it("maps gateflow IdentityReadModel rows to GrantDto", () => {
    const raw = [
      {
        id: "id-1",
        display_name: "Ada",
        email: "ada@lab.example",
        status: "active",
        role: "tenant_admin",
        grants: [],
      },
      {
        id: "id-2",
        display_name: "Bea",
        email: "bea@lab.example",
        status: "suspended",
        role: "tenant_admin",
        grants: [],
      },
    ];
    expect(membersToGrantDtos(raw, "p-1")).toEqual([
      {
        identityId: "id-1",
        programmeId: "p-1",
        email: "ada@lab.example",
        name: "Ada",
        programmeName: null,
      },
      {
        identityId: "id-2",
        programmeId: "p-1",
        email: "bea@lab.example",
        name: "Bea",
        programmeName: null,
      },
    ]);
  });

  it("drops rows without an id and tolerates non-array payloads", () => {
    expect(membersToGrantDtos([{ display_name: "NoId" }], "p-1")).toEqual([]);
    expect(membersToGrantDtos({ unexpected: true }, "p-1")).toEqual([]);
  });
});

describe("membershipsToGrantDtos", () => {
  it("maps gateflow ProgrammeMembershipReadModel rows to GrantDto", () => {
    const raw = [
      { id: "m-1", identity_id: "id-1", programme_id: "p-1" },
      { id: "m-2", identity_id: "id-1", programme_id: "p-2" },
    ];
    expect(membershipsToGrantDtos(raw)).toEqual([
      { identityId: "id-1", programmeId: "p-1", email: null, name: null, programmeName: null },
      { identityId: "id-1", programmeId: "p-2", email: null, name: null, programmeName: null },
    ]);
  });
});

describe("grant upstream write paths", () => {
  it("grants via the programme-scoped endpoint with identity_id-only body", () => {
    expect(grantUpstreamPath("p-1")).toBe("/api/v1/programmes/p-1/grants");
    expect(grantUpstreamBody("id-1")).toEqual({ identity_id: "id-1" });
  });

  it("detaches via DELETE on the membership resource", () => {
    expect(detachUpstreamPath("p-1", "id-1")).toBe("/api/v1/programmes/p-1/grants/id-1");
  });
});

describe("resolveIdentityIdByEmail", () => {
  const directory = [
    { id: "id-1", display_name: "Ada", email: "Ada@Lab.Example" },
    { id: "id-2", display_name: "Ada Lovelace", email: "ada.lovelace@lab.example" },
  ];

  it("matches email exactly, case-insensitively (not name contains)", () => {
    expect(resolveIdentityIdByEmail(directory, "ada@lab.example")).toBe("id-1");
  });

  it("returns null when no identity has the email", () => {
    expect(resolveIdentityIdByEmail(directory, "nobody@lab.example")).toBeNull();
    expect(resolveIdentityIdByEmail(directory, "")).toBeNull();
    expect(resolveIdentityIdByEmail({ not: "a list" }, "ada@lab.example")).toBeNull();
  });
});
