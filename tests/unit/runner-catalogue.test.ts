import { describe, expect, it } from "vitest";
import { mapUpstreamRunners, modelsForRunner } from "@/lib/runner-catalogue";

describe("mapUpstreamRunners", () => {
  it("maps cursor runner and models", () => {
    const mapped = mapUpstreamRunners({
      runners: [
        {
          runner_id: "cursor",
          display_name: "Cursor",
          models: [
            { model_id: "cursor/auto", display_name: "Auto" },
            { model_id: "cursor/composer-2.5", display_name: "Composer 2.5" },
          ],
        },
      ],
    });
    expect(mapped.runners).toEqual([
      {
        runnerId: "cursor",
        displayName: "Cursor",
        models: [
          { modelId: "cursor/auto", displayName: "Auto" },
          { modelId: "cursor/composer-2.5", displayName: "Composer 2.5" },
        ],
      },
    ]);
    expect(modelsForRunner(mapped, "cursor").map((row) => row.modelId)).toEqual([
      "cursor/auto",
      "cursor/composer-2.5",
    ]);
  });
});
