import { describe, expect, it } from "vitest";
import {
  deriveRepoWorkspacePath,
  waveIdsFromMap,
  waveTicketIdsFromMap,
} from "@/lib/initiative-derive";

describe("deriveRepoWorkspacePath", () => {
  it("joins tenant workspace_root with admitted org/repo", () => {
    expect(deriveRepoWorkspacePath("/ws/", "acme", "airforge")).toBe("/ws/acme/airforge");
  });

  it("returns null when the host path is missing or not absolute", () => {
    expect(deriveRepoWorkspacePath("", "acme", "airforge")).toBeNull();
    expect(deriveRepoWorkspacePath("ws", "acme", "airforge")).toBeNull();
    expect(deriveRepoWorkspacePath("/ws", "", "airforge")).toBeNull();
  });
});

describe("wave map extracts", () => {
  const map = {
    waves: [
      { wave_id: "W0", ticket_id: 11 },
      { wave_id: "W1", ticket_id: "22" },
      { wave_id: "", ticket_id: "" },
    ],
  };

  it("collects wave ids", () => {
    expect(waveIdsFromMap(map)).toEqual(["W0", "W1"]);
  });

  it("collects ticket ids without inventing gaps", () => {
    expect(waveTicketIdsFromMap(map)).toEqual(["11", "22"]);
    expect(waveTicketIdsFromMap({ waves: [] })).toEqual([]);
  });
});
