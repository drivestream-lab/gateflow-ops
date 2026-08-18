import { describe, expect, it } from "vitest";
import {
  composeOnboardingVerdict,
  resolveOnboardingVerdictView,
  type SelectOutcome,
  type ReadinessVerdictType,
} from "@/lib/onboarding-verdict";

const SELECTS: SelectOutcome[] = [
  "ok",
  "already_selected",
  "setup_failed",
  "status_failed",
  "probe_failed",
  "out_of_catalogue",
];

const VERDICTS: ReadinessVerdictType[] = ["ready", "not_ready", "tool_unavailable"];

describe("composeOnboardingVerdict", () => {
  it("returns only pass|fail for every select × readiness combo", () => {
    for (const select of SELECTS) {
      for (const verdict_type of VERDICTS) {
        for (const harness_verified of [true, false]) {
          const result = composeOnboardingVerdict(select, {
            harness_verified,
            verdict_type,
          });
          expect(["pass", "fail"]).toContain(result.verdict);
          expect(result.reasonKey.length).toBeGreaterThan(0);
        }
      }
      const missing = composeOnboardingVerdict(select, null);
      expect(["pass", "fail"]).toContain(missing.verdict);
    }
  });

  it("passes only when admit select + harness verified + ready", () => {
    expect(
      composeOnboardingVerdict("ok", {
        harness_verified: true,
        verdict_type: "ready",
      }).verdict,
    ).toBe("pass");
    expect(
      composeOnboardingVerdict("already_selected", {
        harness_verified: true,
        verdict_type: "ready",
      }).verdict,
    ).toBe("pass");
  });

  it("fails for select fail outcomes regardless of readiness", () => {
    for (const select of [
      "setup_failed",
      "status_failed",
      "probe_failed",
      "out_of_catalogue",
    ] as SelectOutcome[]) {
      expect(
        composeOnboardingVerdict(select, {
          harness_verified: true,
          verdict_type: "ready",
        }).verdict,
      ).toBe("fail");
    }
  });

  it("fails when readiness is missing after admit", () => {
    expect(composeOnboardingVerdict("ok", null).verdict).toBe("fail");
  });

  it("does not paint fail while admit is awaiting readiness", () => {
    expect(
      resolveOnboardingVerdictView("ok", null, true),
    ).toEqual({ kind: "checking" });
    expect(
      resolveOnboardingVerdictView("already_selected", null, true),
    ).toEqual({ kind: "checking" });
  });

  it("paints fail immediately for blocking select outcomes", () => {
    const view = resolveOnboardingVerdictView("status_failed", null, true);
    expect(view).toEqual({
      kind: "verdict",
      verdict: { verdict: "fail", reasonKey: "fleet.outcomes.status_failed" },
    });
  });

  it("paints pass when admit select and ready signals are both present", () => {
    expect(
      resolveOnboardingVerdictView(
        "ok",
        { harness_verified: true, verdict_type: "ready" },
        false,
      ),
    ).toEqual({
      kind: "verdict",
      verdict: { verdict: "pass", reasonKey: "fleet.outcomes.ok" },
    });
  });

  it("fails closed when readiness never arrives after admit", () => {
    expect(
      resolveOnboardingVerdictView("ok", null, false),
    ).toEqual({
      kind: "verdict",
      verdict: { verdict: "fail", reasonKey: "fleet.reasons.missing_readiness" },
    });
  });

  it("fails when readiness is not ready or tool unavailable", () => {
    expect(
      composeOnboardingVerdict("ok", {
        harness_verified: true,
        verdict_type: "not_ready",
      }).verdict,
    ).toBe("fail");
    expect(
      composeOnboardingVerdict("ok", {
        harness_verified: false,
        verdict_type: "ready",
      }).verdict,
    ).toBe("fail");
    expect(
      composeOnboardingVerdict("ok", {
        harness_verified: true,
        verdict_type: "tool_unavailable",
      }).verdict,
    ).toBe("fail");
  });
});
