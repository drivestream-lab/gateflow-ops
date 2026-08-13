import { describe, expect, it } from "vitest";
import { sessionDisplayName, sessionRoleLabel, sessionTenantLabel } from "@/lib/session-display";

describe("sessionDisplay", () => {
  it("prefers email then credential then sub", () => {
    expect(sessionDisplayName({ email: "a@b.c", sub: "uuid" })).toBe("a@b.c");
    expect(sessionDisplayName({ credential_identifier: "ops@x", sub: "uuid" })).toBe("ops@x");
    expect(sessionDisplayName({ sub: "59d5e03c-380b-4c30-8a92-7e18855cb2aa" })).toBe(
      "59d5e03c-380b-4c30-8a92-7e18855cb2aa",
    );
    expect(sessionDisplayName(null)).toBe("—");
  });

  it("reads role and tenant from gateflow JWT shape", () => {
    expect(sessionRoleLabel({ role: "tenant_admin" })).toBe("tenant_admin");
    expect(sessionTenantLabel({ tenant_id: "t-1" })).toBe("t-1");
    expect(sessionRoleLabel({})).toBeNull();
  });
});
