import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const { parseEnteredProgrammeContextCookie, getEnteredProgrammeContext } =
  await import("@/lib/programme-context");

describe("parseEnteredProgrammeContextCookie", () => {
  it("returns programmeId and tenantId when the cookie is well-formed", () => {
    expect(
      parseEnteredProgrammeContextCookie(
        JSON.stringify({ programmeId: "prog-1", tenantId: "ten-1" }),
      ),
    ).toEqual({ programmeId: "prog-1", tenantId: "ten-1" });
  });

  it("returns null when the cookie is absent", () => {
    expect(parseEnteredProgrammeContextCookie(undefined)).toBeNull();
    expect(parseEnteredProgrammeContextCookie(null)).toBeNull();
    expect(parseEnteredProgrammeContextCookie("")).toBeNull();
  });

  it("defaults tenantId to null when the cookie carries only a programmeId", () => {
    expect(parseEnteredProgrammeContextCookie(JSON.stringify({ programmeId: "p" }))).toEqual({
      programmeId: "p",
      tenantId: null,
    });
  });

  it("returns null when the cookie is malformed", () => {
    expect(parseEnteredProgrammeContextCookie("not-json")).toBeNull();
    expect(parseEnteredProgrammeContextCookie("{}")).toBeNull();
    expect(parseEnteredProgrammeContextCookie(JSON.stringify({ tenantId: "t" }))).toBeNull();
    expect(
      parseEnteredProgrammeContextCookie(JSON.stringify({ programmeId: "", tenantId: "t" })),
    ).toBeNull();
  });

  it("never treats a JWT tenant_id claim as entered scope", () => {
    const jwtLike = [
      Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
      Buffer.from(JSON.stringify({ tenant_id: "from-jwt", sub: "u1" })).toString("base64url"),
      "sig",
    ].join(".");
    expect(parseEnteredProgrammeContextCookie(jwtLike)).toBeNull();
    expect(
      parseEnteredProgrammeContextCookie(JSON.stringify({ tenant_id: "from-jwt" })),
    ).toBeNull();
  });
});

describe("getEnteredProgrammeContext", () => {
  it("reads only the programme-context cookie (no network)", async () => {
    expect(await getEnteredProgrammeContext()).toBeNull();
  });
});
