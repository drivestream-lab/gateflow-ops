import { describe, expect, it } from "vitest";
import {
  classifyWaveMapStatus,
  compositionGapLabel,
  parseWaveTicketIds,
} from "@/hooks/use-initiatives";

describe("classifyWaveMapStatus", () => {
  it("maps gateflow wave-map vocabulary", () => {
    expect(classifyWaveMapStatus("done")).toBe("done");
    expect(classifyWaveMapStatus("READY-TO-START")).toBe("ready-to-start");
    expect(classifyWaveMapStatus("ready_to_start")).toBe("ready-to-start");
    expect(classifyWaveMapStatus("blocked")).toBe("blocked");
    expect(classifyWaveMapStatus("active")).toBe("active");
  });

  it("returns unknown for missing/other values", () => {
    expect(classifyWaveMapStatus(null)).toBe("unknown");
    expect(classifyWaveMapStatus("")).toBe("unknown");
    expect(classifyWaveMapStatus("queued")).toBe("unknown");
  });
});

describe("compositionGapLabel", () => {
  it("labels honest gaps without inventing values", () => {
    expect(compositionGapLabel(null)).toBe("empty");
    expect(compositionGapLabel("")).toBe("empty");
    expect(compositionGapLabel([])).toBe("empty");
    expect(compositionGapLabel("unavailable")).toBe("unavailable");
    expect(compositionGapLabel("Unavailable")).toBe("unavailable");
    expect(compositionGapLabel("satisfied")).toBe("present");
    expect(compositionGapLabel(["a"])).toBe("present");
  });
});

describe("parseWaveTicketIds", () => {
  it("splits comma/whitespace ticket ids", () => {
    expect(parseWaveTicketIds("1, 2;3\n4")).toEqual(["1", "2", "3", "4"]);
    expect(parseWaveTicketIds("  ")).toEqual([]);
  });
});
