import { describe, expect, it } from "vitest";
import { isBoardCreateIdempotentReplay, isBoardTicketListEmpty } from "@/hooks/use-board";

describe("isBoardTicketListEmpty", () => {
  it("detects empty and present lists", () => {
    expect(isBoardTicketListEmpty({ tickets: [] })).toBe(true);
    expect(isBoardTicketListEmpty({ tickets: [{ ticket_id: "1" }] })).toBe(false);
    expect(isBoardTicketListEmpty(null)).toBe(true);
  });
});

describe("isBoardCreateIdempotentReplay", () => {
  it("detects idempotent_replay flag", () => {
    expect(isBoardCreateIdempotentReplay({ idempotent_replay: true })).toBe(true);
    expect(isBoardCreateIdempotentReplay({ idempotent_replay: false })).toBe(false);
    expect(isBoardCreateIdempotentReplay({})).toBe(false);
  });
});
