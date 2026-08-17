import { describe, expect, it } from "vitest";
import { composeFleetRows, fleetRepoKey } from "@/lib/fleet-rows";

describe("composeFleetRows", () => {
  it("splits admitted repos into the in-fleet block", () => {
    const rows = composeFleetRows(
      [{ org: "acme", repo: "airforge" }],
      [
        { org: "acme", repo: "airforge", service_key: "airforge", status: "live" },
        { org: "acme", repo: "vigil", service_key: "vigil", status: "planned" },
      ],
    );

    expect(rows.active).toEqual([
      {
        org: "acme",
        repo: "airforge",
        serviceKey: "airforge",
        status: "live",
        inFleet: true,
      },
    ]);
    expect(rows.candidates).toEqual([
      {
        org: "acme",
        repo: "vigil",
        serviceKey: "vigil",
        status: "planned",
        inFleet: false,
      },
    ]);
  });

  it("keeps active members that are missing from the catalogue", () => {
    const rows = composeFleetRows([{ org: "acme", repo: "orphan" }], []);
    expect(rows.active).toEqual([
      {
        org: "acme",
        repo: "orphan",
        serviceKey: null,
        status: null,
        inFleet: true,
      },
    ]);
    expect(rows.candidates).toEqual([]);
  });

  it("builds a stable org/repo key", () => {
    expect(fleetRepoKey("acme", "airforge")).toBe("acme/airforge");
  });
});
