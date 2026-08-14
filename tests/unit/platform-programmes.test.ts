import { describe, expect, it } from "vitest";
import { navItemsForRole, WORKSPACE_NAV } from "@/lib/workspace-nav";
import { isPlatformAdmin, isTenantAdmin, normalizeSessionRole } from "@/lib/session-role";
import { mapProgrammeReadModel } from "@/lib/programme-read";

describe("session-role", () => {
  it("normalizes gateflow role strings", () => {
    expect(normalizeSessionRole("platform_admin")).toBe("platform_admin");
    expect(normalizeSessionRole("PLATFORM_ADMIN")).toBe("platform_admin");
    expect(normalizeSessionRole("tenant_admin")).toBe("tenant_admin");
    expect(normalizeSessionRole("other")).toBe("unknown");
    expect(normalizeSessionRole(null)).toBe("unknown");
  });

  it("detects platform vs tenant admin from payload", () => {
    expect(isPlatformAdmin({ role: "platform_admin" })).toBe(true);
    expect(isTenantAdmin({ role: "tenant_admin" })).toBe(true);
    expect(isPlatformAdmin({ role: "tenant_admin" })).toBe(false);
    expect(isTenantAdmin({ role: "platform_admin" })).toBe(false);
  });
});

describe("navItemsForRole", () => {
  it("shows Status + Programmes for platform_admin", () => {
    const hrefs = navItemsForRole("platform_admin").map((i) => i.href);
    expect(hrefs).toEqual(["/", "/programmes", "/identities"]);
  });

  it("shows Status + Enter + Tenant + Fleet + Runs + Initiatives + Metrics + Checkpoints + Board for tenant_admin", () => {
    const hrefs = navItemsForRole("tenant_admin").map((i) => i.href);
    expect(hrefs).toEqual([
      "/",
      "/programmes/enter",
      "/tenant",
      "/fleet",
      "/runs",
      "/initiatives",
      "/metrics",
      "/checkpoints",
      "/board",
    ]);
  });

  it("shows only unscoped items for unknown role", () => {
    const hrefs = navItemsForRole("unknown").map((i) => i.href);
    expect(hrefs).toEqual(["/"]);
    expect(navItemsForRole(null).map((i) => i.href)).toEqual(["/"]);
  });

  it("keeps WORKSPACE_NAV as the full catalog", () => {
    expect(WORKSPACE_NAV.map((i) => i.href)).toEqual([
      "/",
      "/programmes",
      "/identities",
      "/programmes/enter",
      "/tenant",
      "/fleet",
      "/runs",
      "/initiatives",
      "/metrics",
      "/checkpoints",
      "/board",
    ]);
  });
});

describe("mapProgrammeReadModel", () => {
  it("maps repo_catalogue candidates", () => {
    const mapped = mapProgrammeReadModel({
      id: "p-1",
      name: "Demo",
      tenant_id: "t-1",
      workspace_root: "/ws",
      meta_org: "acme",
      meta_repo: "meta",
      meta_ref: "main",
      repo_catalogue: [
        {
          org: "acme",
          repo: "svc-a",
          service_key: "svc_a",
          status: "active",
        },
      ],
    });
    expect(mapped.repoCatalogue).toEqual([
      { org: "acme", repo: "svc-a", serviceKey: "svc_a", status: "active" },
    ]);
    expect(mapped.metaOrg).toBe("acme");
  });

  it("defaults missing catalogue to empty list", () => {
    const mapped = mapProgrammeReadModel({
      id: "p-2",
      name: "Legacy",
      tenant_id: "t-2",
      workspace_root: "/ws",
      meta_org: "acme",
      meta_repo: "meta",
      repo_catalogue: null,
    });
    expect(mapped.repoCatalogue).toEqual([]);
  });
});
