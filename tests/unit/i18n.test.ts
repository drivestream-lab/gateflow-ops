import { describe, expect, it } from "vitest";
import { t, useTranslation } from "@/lib/i18n";

describe("i18n catalog", () => {
  it("resolves known keys", () => {
    expect(t("auth.login.title")).toBe("Sign in");
    expect(t("system.status.title")).toBe("System status");
    expect(t("workspace.nav.metaPrs")).toBe("Meta PRs");
    expect(t("meta-prs.page.title")).toBe("Meta PRs");
    expect(t("spec-lane.page.title")).toBe("Spec lane");
    expect(t("workspace.nav.specLane")).toBe("Spec lane");
  });

  it("flags missing keys outside production (no silent hardcoded fallbacks)", () => {
    expect(t("common.does.not.exist")).toContain("missing");
  });

  it("scopes by namespace", () => {
    const { t: ta } = useTranslation("auth");
    expect(ta("login.submit")).toBe("Sign in");
  });
});
