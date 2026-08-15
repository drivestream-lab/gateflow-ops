// Unit-test enter refuse/strip helpers — live journeys in verify/09.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const {
  enterWriteRefuseKey,
  stripGrantedProgramme,
  snapshotGrants,
  snapshotEnteredProgramme,
  enterUpstreamRefuseKey,
  parseLastProgrammeCookie,
  pickAutoEnterProgramme,
} = await import("@/lib/programme-enter");
const { parseEnteredProgrammeContextCookie } = await import("@/lib/programme-context");

const DELIVERY_BFF_PATHS = [
  "app/api/gateflow/programme/route.ts",
  "app/api/gateflow/runs/route.ts",
  "app/api/gateflow/runs/by-id/route.ts",
  "app/api/gateflow/runs/forge/route.ts",
  "app/api/gateflow/waves/route.ts",
  "app/api/gateflow/initiatives/route.ts",
  "app/api/gateflow/initiatives/by-id/route.ts",
  "app/api/gateflow/metrics/route.ts",
  "app/api/gateflow/checkpoints/route.ts",
  "app/api/gateflow/board/route.ts",
  "app/api/gateflow/tenants/route.ts",
] as const;

const MISSING_CONTEXT_KEYS = [
  "fleet.errors.missingTenant",
  "runs.errors.missingTenant",
  "initiatives.errors.missingTenant",
  "metrics.errors.missingTenant",
  "checkpoints.errors.missingTenant",
  "board.errors.missingTenant",
  "tenants.errors.missingTenant",
] as const;

describe("enterWriteRefuseKey", () => {
  it("refuses a missing programme id as not-granted (REQ-16)", () => {
    expect(enterWriteRefuseKey({})).toBe("programmes.errors.notGranted");
    expect(enterWriteRefuseKey({ programmeId: "   " })).toBe("programmes.errors.notGranted");
  });

  it("refuses a password on enter (REQ-16)", () => {
    expect(enterWriteRefuseKey({ programmeId: "p-1", password: "secret" })).toBe(
      "programmes.errors.passwordNotAllowed",
    );
  });

  it("does not treat JWT tenant_id as a programme to enter (REQ-16)", () => {
    expect(enterWriteRefuseKey({ programmeId: undefined })).toBe("programmes.errors.notGranted");
    expect(enterWriteRefuseKey({} as { programmeId?: string; tenant_id?: string })).toBe(
      "programmes.errors.notGranted",
    );
  });

  it("accepts a programme id with no password", () => {
    expect(enterWriteRefuseKey({ programmeId: "p-1" })).toBeNull();
  });
});

describe("stripGrantedProgramme", () => {
  it("maps a gateflow ProgrammeMembershipReadModel row (no tenant_id upstream)", () => {
    expect(stripGrantedProgramme({ id: "m-1", identity_id: "u-1", programme_id: "p-1" })).toEqual({
      programmeId: "p-1",
      tenantId: null,
      programmeName: null,
    });
  });

  it("omits password and token fields (REQ-16)", () => {
    const dto = stripGrantedProgramme({
      programme_id: "p-1",
      tenant_id: "ten-1",
      programme_name: "Lab",
      password: "should-not-leak",
      access_token: "tok",
    });
    expect(dto).toEqual({
      programmeId: "p-1",
      tenantId: "ten-1",
      programmeName: "Lab",
    });
    expect(dto && "password" in dto).toBe(false);
    expect(dto && "access_token" in dto).toBe(false);
  });

  it("returns null when the programme id is missing (REQ-18)", () => {
    expect(stripGrantedProgramme({ tenant_id: "ten-1" })).toBeNull();
    expect(stripGrantedProgramme({ email: "ada@lab.example" })).toBeNull();
    expect(stripGrantedProgramme(null)).toBeNull();
  });

  it("does not treat a JWT tenant_id claim as entered scope (REQ-16)", () => {
    expect(stripGrantedProgramme({ tenant_id: "from-jwt", sub: "u1" })).toBeNull();
    expect(stripGrantedProgramme({ tenantId: "from-jwt" })).toBeNull();
  });
});

describe("snapshotGrants / snapshotEnteredProgramme", () => {
  const snapshot = {
    id: "u-1",
    display_name: "Ada",
    email: "ada@lab.example",
    status: "active",
    role: "tenant_admin",
    grants: [
      { id: "m-1", identity_id: "u-1", programme_id: "p-1" },
      { id: "m-2", identity_id: "u-1", programme_id: "p-2" },
    ],
    entered_programme_id: "p-1",
  };

  it("maps the AuthSessionSnapshot grant list", () => {
    expect(snapshotGrants(snapshot)).toEqual([
      { programmeId: "p-1", tenantId: null, programmeName: null },
      { programmeId: "p-2", tenantId: null, programmeName: null },
    ]);
    expect(snapshotGrants({ unexpected: true })).toEqual([]);
  });

  it("confirms the entered programme from the snapshot", () => {
    expect(snapshotEnteredProgramme(snapshot, "p-1")).toEqual({
      programmeId: "p-1",
      tenantId: null,
      programmeName: null,
    });
    // Fall back to grant evidence when entered_programme_id is absent.
    expect(snapshotEnteredProgramme({ ...snapshot, entered_programme_id: null }, "p-2")).toEqual({
      programmeId: "p-2",
      tenantId: null,
      programmeName: null,
    });
    expect(snapshotEnteredProgramme(snapshot, "p-3")).toBeNull();
    expect(snapshotEnteredProgramme(null, "p-1")).toBeNull();
  });

  it("carries the tenant binding from the grant row when gateflow provides it", () => {
    const enriched = {
      ...snapshot,
      grants: [
        {
          id: "m-1",
          identity_id: "u-1",
          programme_id: "p-1",
          tenant_id: "ten-1",
          programme_name: "Drivestream",
        },
      ],
    };
    expect(snapshotEnteredProgramme(enriched, "p-1")).toEqual({
      programmeId: "p-1",
      tenantId: "ten-1",
      programmeName: "Drivestream",
    });
  });
});

describe("enterUpstreamRefuseKey", () => {
  it("maps gateflow 403 not-granted vs wrong-actor (REQ-16)", () => {
    const notGranted = {
      status: "error",
      error: {
        code: "FORBIDDEN",
        message: "Caller is not granted the requested programme",
        details: { reason: "not granted" },
      },
    };
    expect(enterUpstreamRefuseKey(403, notGranted)).toBe("programmes.errors.notGranted");
    expect(enterUpstreamRefuseKey(403, {})).toBe("programmes.errors.wrongActor");
  });

  it("maps expired sessions and validation failures", () => {
    expect(enterUpstreamRefuseKey(401, {})).toBe("auth.errors.sessionExpired");
    expect(enterUpstreamRefuseKey(404, { error: "not granted" })).toBe(
      "programmes.errors.notGranted",
    );
    expect(enterUpstreamRefuseKey(422, { error: "unknown programme" })).toBe(
      "programmes.errors.notGranted",
    );
  });

  it("maps other upstream failures to actionFailed", () => {
    expect(enterUpstreamRefuseKey(500, {})).toBe("programmes.errors.actionFailed");
  });
});

describe("auto-enter restore at login (CTR-04)", () => {
  const grants = [
    { programmeId: "p-1", tenantId: null, programmeName: null },
    { programmeId: "p-2", tenantId: null, programmeName: null },
  ];

  it("round-trips the last-programme cookie and rejects malformed values", () => {
    expect(parseLastProgrammeCookie(JSON.stringify({ sub: "u-1", programmeId: "p-1" }))).toEqual({
      sub: "u-1",
      programmeId: "p-1",
    });
    expect(parseLastProgrammeCookie(undefined)).toBeNull();
    expect(parseLastProgrammeCookie("not-json")).toBeNull();
    expect(parseLastProgrammeCookie(JSON.stringify({ sub: "u-1" }))).toBeNull();
    expect(parseLastProgrammeCookie(JSON.stringify({ sub: "", programmeId: "p-1" }))).toBeNull();
  });

  it("restores the remembered programme for the same identity when still granted", () => {
    const last = { sub: "u-1", programmeId: "p-2" };
    expect(pickAutoEnterProgramme(grants, last, "u-1")?.programmeId).toBe("p-2");
  });

  it("never restores another identity's remembered programme (shared browser)", () => {
    const last = { sub: "u-1", programmeId: "p-2" };
    expect(pickAutoEnterProgramme(grants, last, "u-2")).toBeNull();
    expect(pickAutoEnterProgramme(grants, last, null)).toBeNull();
  });

  it("falls back to the single grant when nothing is remembered", () => {
    const single = { programmeId: "p-1", tenantId: null, programmeName: null };
    expect(pickAutoEnterProgramme([single], null, "u-1")?.programmeId).toBe("p-1");
  });

  it("requires a chooser when several grants and no memory match", () => {
    expect(pickAutoEnterProgramme(grants, null, "u-1")).toBeNull();
    expect(
      pickAutoEnterProgramme(grants, { sub: "u-1", programmeId: "p-revoked" }, "u-1"),
    ).toBeNull();
  });
});

describe("missing entered context (REQ-18)", () => {
  it("maps an absent cookie to null — never a JWT tenant_id fallback", () => {
    expect(parseEnteredProgrammeContextCookie(undefined)).toBeNull();
    expect(
      parseEnteredProgrammeContextCookie(JSON.stringify({ tenant_id: "from-jwt" })),
    ).toBeNull();
  });

  it("delivery BFF uses the helper and named missingTenant keys — not JWT tenant_id", () => {
    const root = process.cwd();
    const seenKeys = new Set<string>();
    for (const rel of DELIVERY_BFF_PATHS) {
      const src = readFileSync(join(root, rel), "utf8");
      expect(src, rel).toContain("getEnteredProgrammeContext");
      expect(src, rel).not.toMatch(/session\.tenant_id|payload\.tenant_id/);
      const match = src.match(/[a-z]+\.errors\.missingTenant/);
      expect(match, rel).not.toBeNull();
      if (match) seenKeys.add(match[0]);
    }
    for (const key of MISSING_CONTEXT_KEYS) {
      expect(seenKeys.has(key), key).toBe(true);
    }
  });
});
