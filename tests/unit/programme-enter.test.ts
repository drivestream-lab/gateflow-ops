// Unit-test enter refuse/strip helpers — live journeys in verify/09.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const { enterWriteRefuseKey, stripGrantedProgramme, enterUpstreamRefuseKey } =
  await import("@/app/api/auth/programme/route");
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

  it("returns null when required ids are missing (REQ-18)", () => {
    expect(stripGrantedProgramme({ programme_id: "p-1" })).toBeNull();
    expect(stripGrantedProgramme({ tenant_id: "ten-1" })).toBeNull();
    expect(stripGrantedProgramme({ email: "ada@lab.example" })).toBeNull();
    expect(stripGrantedProgramme(null)).toBeNull();
  });

  it("does not treat a JWT tenant_id claim as entered scope (REQ-16)", () => {
    expect(stripGrantedProgramme({ tenant_id: "from-jwt", sub: "u1" })).toBeNull();
    expect(stripGrantedProgramme({ tenantId: "from-jwt" })).toBeNull();
  });
});

describe("enterUpstreamRefuseKey", () => {
  it("maps forbidden actor and not-granted (REQ-16)", () => {
    expect(enterUpstreamRefuseKey(403, {})).toBe("programmes.errors.wrongActor");
    expect(enterUpstreamRefuseKey(404, { error: "not granted" })).toBe(
      "programmes.errors.notGranted",
    );
    expect(enterUpstreamRefuseKey(400, { error: "unknown programme" })).toBe(
      "programmes.errors.notGranted",
    );
  });

  it("maps other upstream failures to actionFailed", () => {
    expect(enterUpstreamRefuseKey(500, {})).toBe("programmes.errors.actionFailed");
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
