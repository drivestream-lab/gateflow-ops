import { describe, expect, it } from "vitest";
import { classifyCheckpointMiss, isCheckpointHistoryEmpty } from "@/hooks/use-checkpoints";

describe("classifyCheckpointMiss", () => {
  it("names no-run for 404 with no-run message", () => {
    expect(classifyCheckpointMiss(404, "No run found for this wave")).toBe("no_run");
    expect(classifyCheckpointMiss(404, "checkpoints.errors.noRunFound")).toBe("no_run");
  });

  it("names not-found for other 404s", () => {
    expect(classifyCheckpointMiss(404, "missing")).toBe("not_found");
  });

  it("returns other/null appropriately", () => {
    expect(classifyCheckpointMiss(400, "bad")).toBe("other");
    expect(classifyCheckpointMiss(null, null)).toBe(null);
  });
});

describe("isCheckpointHistoryEmpty", () => {
  it("detects empty records", () => {
    expect(isCheckpointHistoryEmpty({ records: [] })).toBe(true);
    expect(isCheckpointHistoryEmpty({ records: [{ checkpoint_id: "x" }] })).toBe(false);
    expect(isCheckpointHistoryEmpty(null)).toBe(true);
  });
});
