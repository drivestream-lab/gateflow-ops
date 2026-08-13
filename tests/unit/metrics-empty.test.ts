import { describe, expect, it } from "vitest";
import { isMetricsSeriesEmpty } from "@/hooks/use-metrics";

describe("isMetricsSeriesEmpty", () => {
  it("treats empty run aggregates as empty", () => {
    expect(
      isMetricsSeriesEmpty("runs", {
        retention_days: 30,
        by_workflow_node: [],
        by_runner: [],
        by_model_id: [],
      }),
    ).toBe(true);
    expect(
      isMetricsSeriesEmpty("runs", {
        retention_days: 30,
        by_workflow_node: [{ workflow_node: "x", count: 1, p50_ms: 1, p95_ms: 2 }],
        by_runner: [],
        by_model_id: [],
      }),
    ).toBe(false);
  });

  it("treats empty skill-efficacy nodes as empty", () => {
    expect(isMetricsSeriesEmpty("skill-efficacy", { by_workflow_node: [] })).toBe(true);
    expect(
      isMetricsSeriesEmpty("skill-efficacy", {
        by_workflow_node: [{ workflow_node: "a", run_count: 1 }],
      }),
    ).toBe(false);
  });

  it("treats zero gate-reaching factory as empty", () => {
    expect(
      isMetricsSeriesEmpty("factory-effectiveness", {
        gate_reaching_run_count: 0,
        cycle_time_by_lane: [],
        stop_reason_breakdown: [],
      }),
    ).toBe(true);
    expect(
      isMetricsSeriesEmpty("factory-effectiveness", {
        gate_reaching_run_count: 2,
        cycle_time_by_lane: [],
        stop_reason_breakdown: [],
      }),
    ).toBe(false);
  });

  it("does not invent empty for scorecard framing objects", () => {
    expect(
      isMetricsSeriesEmpty("delivery-scorecard", {
        as_of: "2026-01-01T00:00:00Z",
        rework_rate: { cumulative: 0, trailing_90d_delta: 0 },
      }),
    ).toBe(false);
    expect(isMetricsSeriesEmpty("delivery-scorecard", null)).toBe(true);
  });
});
