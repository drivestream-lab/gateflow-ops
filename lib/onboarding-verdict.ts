/**
 * REQ-07 — compose a single pass/fail onboarding verdict from select + readiness.
 * Pure; no I/O. Never returns a partial membership state.
 */

export type SelectOutcome =
  | "ok"
  | "already_selected"
  | "setup_failed"
  | "status_failed"
  | "probe_failed"
  | "out_of_catalogue";

export type ReadinessVerdictType = "ready" | "not_ready" | "tool_unavailable";

export interface ReadinessSignals {
  harness_verified: boolean;
  verdict_type: ReadinessVerdictType;
}

export interface OnboardingVerdict {
  verdict: "pass" | "fail";
  reasonKey: string;
}

const FAIL_SELECT: ReadonlySet<SelectOutcome> = new Set([
  "setup_failed",
  "status_failed",
  "probe_failed",
  "out_of_catalogue",
]);

const ADMIT_SELECT: ReadonlySet<SelectOutcome> = new Set(["ok", "already_selected"]);

export function composeOnboardingVerdict(
  selectOutcome: SelectOutcome,
  readiness: ReadinessSignals | null,
): OnboardingVerdict {
  if (FAIL_SELECT.has(selectOutcome)) {
    return { verdict: "fail", reasonKey: `fleet.outcomes.${selectOutcome}` };
  }

  if (!ADMIT_SELECT.has(selectOutcome)) {
    return { verdict: "fail", reasonKey: "fleet.reasons.select_fail" };
  }

  if (!readiness) {
    return { verdict: "fail", reasonKey: "fleet.reasons.missing_readiness" };
  }

  if (readiness.harness_verified && readiness.verdict_type === "ready") {
    return { verdict: "pass", reasonKey: "fleet.outcomes.ok" };
  }

  if (readiness.verdict_type === "tool_unavailable") {
    return { verdict: "fail", reasonKey: "fleet.reasons.select_ok_tool_unavailable" };
  }

  return { verdict: "fail", reasonKey: "fleet.reasons.select_ok_not_ready" };
}
