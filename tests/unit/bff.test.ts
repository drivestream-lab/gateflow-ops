// Unit-test branching logic extracted from route handlers — full HTTP journeys
// belong to live verify (testing-verify-flows.mdc: no-overlap policy).
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
process.env.UPSTREAM_BASE_URL = "http://localhost:3000";

const { mapUpstreamStatus } = await import("@/lib/bff");

describe("mapUpstreamStatus", () => {
  it("passes auth statuses through", () => {
    expect(mapUpstreamStatus(401)).toBe(401);
    expect(mapUpstreamStatus(403)).toBe(403);
    expect(mapUpstreamStatus(404)).toBe(404);
  });

  it("collapses other 4xx to 400", () => {
    expect(mapUpstreamStatus(422)).toBe(400);
    expect(mapUpstreamStatus(409)).toBe(400);
  });

  it("maps upstream 5xx to 502 — internals never leak", () => {
    expect(mapUpstreamStatus(500)).toBe(502);
    expect(mapUpstreamStatus(503)).toBe(502);
  });
});
