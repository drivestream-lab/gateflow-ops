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
  it("shows Programmes + Identities for platform_admin", () => {
    const hrefs = navItemsForRole("platform_admin").map((i) => i.href);
    expect(hrefs).toEqual(["/programmes", "/identities"]);
  });

  it("shows grouped delivery/work/observe items for tenant_admin", () => {
    const items = navItemsForRole("tenant_admin");
    expect(items.map((i) => i.href)).toEqual([
      "/fleet",
      "/meta-prs",
      "/spec-lane",
      "/board",
      "/implement-lane",
      "/closeout-lane",
      "/initiative-closure",
      "/runs",
      "/metrics",
    ]);
    expect(items.map((i) => i.groupKey)).toEqual([
      "nav.group.delivery",
      "nav.group.work",
      "nav.group.work",
      "nav.group.work",
      "nav.group.work",
      "nav.group.work",
      "nav.group.work",
      "nav.group.observe",
      "nav.group.observe",
    ]);
  });

  it("shows no primary nav for unknown role", () => {
    expect(navItemsForRole("unknown").map((i) => i.href)).toEqual([]);
    expect(navItemsForRole(null).map((i) => i.href)).toEqual([]);
  });

  it("keeps WORKSPACE_NAV as the full catalog", () => {
    expect(WORKSPACE_NAV.map((i) => i.href)).toEqual([
      "/programmes",
      "/identities",
      "/fleet",
      "/meta-prs",
      "/spec-lane",
      "/board",
      "/implement-lane",
      "/closeout-lane",
      "/initiative-closure",
      "/runs",
      "/metrics",
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
