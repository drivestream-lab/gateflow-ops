import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isExpired } from "@/lib/jwt";

function makeToken(payload: object): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "none" })}.${b64(payload)}.sig`;
}

describe("decodeJwtPayload", () => {
  it("decodes a well-formed token", () => {
    const payload = decodeJwtPayload(makeToken({ sub: "u1", email: "a@b.c" }));
    expect(payload?.sub).toBe("u1");
    expect(payload?.email).toBe("a@b.c");
  });

  it("returns null for malformed tokens", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("a.b")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});

describe("isExpired", () => {
  it("treats missing exp as expired", () => {
    expect(isExpired({})).toBe(true);
    expect(isExpired(null)).toBe(true);
  });

  it("respects exp", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(isExpired({ exp: future })).toBe(false);
    expect(isExpired({ exp: past })).toBe(true);
  });
});
