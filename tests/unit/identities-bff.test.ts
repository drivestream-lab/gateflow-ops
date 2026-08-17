// Unit-test identity factory strip/refuse helpers — live journeys in verify/07.
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const {
  identityCreateRefuseKey,
  identityCreateUpstreamBody,
  identityPasswordRefuseKey,
  stripIdentitySecrets,
  filterIdentitiesByQuery,
  upstreamActionMethod,
} = await import("@/lib/identities-directory");

describe("identityCreateRefuseKey", () => {
  it("refuses a missing name (REQ-25)", () => {
    expect(
      identityCreateRefuseKey({ name: "  ", email: "a@lab.example", password: "secret" }),
    ).toBe("identities.errors.missingName");
  });

  it("refuses a non-email identifier (REQ-03)", () => {
    expect(identityCreateRefuseKey({ name: "Ada", email: "", password: "secret" })).toBe(
      "identities.errors.notAnEmail",
    );
    expect(identityCreateRefuseKey({ name: "Ada", email: "nodomain@", password: "secret" })).toBe(
      "identities.errors.notAnEmail",
    );
    expect(identityCreateRefuseKey({ name: "Ada", email: "plain", password: "secret" })).toBe(
      "identities.errors.notAnEmail",
    );
  });

  it("refuses a missing password (REQ-29)", () => {
    expect(identityCreateRefuseKey({ name: "Ada", email: "ada@lab.example" })).toBe(
      "identities.errors.missingPassword",
    );
  });

  it("accepts name + email + password", () => {
    expect(
      identityCreateRefuseKey({ name: "Ada", email: "ada@lab.example", password: "secret" }),
    ).toBeNull();
  });
});

describe("identityPasswordRefuseKey", () => {
  it("refuses password-set without a password (REQ-29)", () => {
    expect(identityPasswordRefuseKey("")).toBe("identities.errors.missingPassword");
    expect(identityPasswordRefuseKey(undefined)).toBe("identities.errors.missingPassword");
  });
});

describe("identityCreateUpstreamBody", () => {
  it("maps portal name to gateflow display_name and sends no extra keys", () => {
    const body = identityCreateUpstreamBody({
      name: "kumar deepak",
      email: "kd1@kd.com",
      password: "user123$",
    });
    expect(body).toEqual({
      display_name: "kumar deepak",
      email: "kd1@kd.com",
      password: "user123$",
    });
    // Gateflow IdentityEnterRequest is extra=forbid — these keys must never appear.
    expect("name" in body).toBe(false);
    expect("role" in body).toBe(false);
  });
});

describe("upstreamActionMethod", () => {
  it("uses PUT for password-set, POST for suspend/unsuspend", () => {
    expect(upstreamActionMethod("password-set")).toBe("PUT");
    expect(upstreamActionMethod("suspend")).toBe("POST");
    expect(upstreamActionMethod("unsuspend")).toBe("POST");
  });
});

describe("stripIdentitySecrets", () => {
  it("maps the gateflow IdentityReadModel shape and omits secrets (REQ-30)", () => {
    const dto = stripIdentitySecrets({
      id: "id-1",
      display_name: "Ada",
      email: "ada@lab.example",
      status: "active",
      role: "tenant_admin",
      grants: [],
      password: "should-not-leak",
      access_token: "tok",
    });
    expect(dto).toEqual({
      id: "id-1",
      name: "Ada",
      email: "ada@lab.example",
      role: "tenant_admin",
      suspended: false,
    });
    expect(dto && "password" in dto).toBe(false);
    expect(dto && "access_token" in dto).toBe(false);
  });

  it("maps alternate upstream id/email keys and defaults role", () => {
    expect(
      stripIdentitySecrets({
        identity_id: "id-2",
        display_name: "Bea",
        credential_identifier: "bea@lab.example",
        status: "suspended",
      }),
    ).toEqual({
      id: "id-2",
      name: "Bea",
      email: "bea@lab.example",
      role: "tenant_admin",
      suspended: true,
    });
  });

  it("falls back to the legacy name key", () => {
    expect(stripIdentitySecrets({ id: "id-3", name: "Cid", email: "cid@lab.example" })).toEqual({
      id: "id-3",
      name: "Cid",
      email: "cid@lab.example",
      role: "tenant_admin",
      suspended: false,
    });
  });

  it("returns null when required fields are missing", () => {
    expect(stripIdentitySecrets({ display_name: "Ada" })).toBeNull();
    expect(stripIdentitySecrets(null)).toBeNull();
  });
});

describe("filterIdentitiesByQuery", () => {
  const items = [
    {
      id: "1",
      name: "Ada Lovelace",
      email: "ada@lab.example",
      role: "tenant_admin",
      suspended: false,
    },
    {
      id: "2",
      name: "Grace Hopper",
      email: "grace@lab.example",
      role: "tenant_admin",
      suspended: false,
    },
  ];

  it("matches name contains case-insensitively (REQ-04)", () => {
    expect(filterIdentitiesByQuery(items, "lovelace").map((i) => i.id)).toEqual(["1"]);
  });

  it("matches email exact case-insensitively (REQ-04)", () => {
    expect(filterIdentitiesByQuery(items, "GRACE@LAB.EXAMPLE").map((i) => i.id)).toEqual(["2"]);
    expect(filterIdentitiesByQuery(items, "grace@").map((i) => i.id)).toEqual([]);
  });

  it("returns empty for no match — not an error (REQ-04)", () => {
    expect(filterIdentitiesByQuery(items, "nobody")).toEqual([]);
  });

  it("returns all when the query is empty", () => {
    expect(filterIdentitiesByQuery(items, "  ")).toEqual(items);
  });
});
