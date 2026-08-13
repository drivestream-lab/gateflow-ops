import { describe, expect, it } from "vitest";
import { classifyRunStopPresentation, isForgeAuthorizeEligible } from "@/hooks/use-runs";

describe("classifyRunStopPresentation", () => {
  it("treats stopped as human checkpoint (not failure)", () => {
    expect(classifyRunStopPresentation("stopped")).toBe("human_checkpoint");
    expect(classifyRunStopPresentation("STOPPED", "anything")).toBe("human_checkpoint");
  });

  it("maps failed statuses to failure", () => {
    expect(classifyRunStopPresentation("failed")).toBe("failure");
    expect(classifyRunStopPresentation("active", "failed")).toBe("failure");
  });

  it("maps completed/succeeded", () => {
    expect(classifyRunStopPresentation("completed")).toBe("complete");
    expect(classifyRunStopPresentation("active", "succeeded")).toBe("complete");
  });

  it("maps active/running", () => {
    expect(classifyRunStopPresentation("active")).toBe("active");
    expect(classifyRunStopPresentation("running")).toBe("active");
  });
});

describe("isForgeAuthorizeEligible", () => {
  it("requires stopped status and workflow node", () => {
    expect(isForgeAuthorizeEligible("stopped", "wave-pr-action")).toBe(true);
    expect(isForgeAuthorizeEligible("stopped", "")).toBe(false);
    expect(isForgeAuthorizeEligible("active", "wave-pr-action")).toBe(false);
  });
});
