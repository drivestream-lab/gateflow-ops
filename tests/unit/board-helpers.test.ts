import { describe, expect, it } from "vitest";
import {
  boardTicketsFromListData,
  isBoardCreateIdempotentReplay,
  isBoardTicketListEmpty,
} from "@/hooks/use-board";

describe("isBoardTicketListEmpty", () => {
  it("detects empty and present lists", () => {
    expect(isBoardTicketListEmpty({ tickets: [] })).toBe(true);
    expect(isBoardTicketListEmpty({ tickets: [{ ticket_id: "1" }] })).toBe(false);
    expect(isBoardTicketListEmpty(null)).toBe(true);
  });
});

describe("boardTicketsFromListData", () => {
  it("whitelists ticket rows and drops rows without an id", () => {
    expect(
      boardTicketsFromListData({
        tickets: [
          {
            ticket_id: "t-1",
            title: "Epic",
            ticket_type: "EPIC",
            state: "open",
            column: "Todo",
            initiative_id: "INIT-1",
            link_ref: "pr/12",
            password: "nope",
          },
          { title: "missing id" },
        ],
      }),
    ).toEqual([
      {
        ticketId: "t-1",
        title: "Epic",
        ticketType: "EPIC",
        state: "open",
        column: "Todo",
        initiativeId: "INIT-1",
        linkRef: "pr/12",
      },
    ]);
  });
});

describe("isBoardCreateIdempotentReplay", () => {
  it("detects idempotent_replay flag", () => {
    expect(isBoardCreateIdempotentReplay({ idempotent_replay: true })).toBe(true);
    expect(isBoardCreateIdempotentReplay({ idempotent_replay: false })).toBe(false);
    expect(isBoardCreateIdempotentReplay({})).toBe(false);
  });
});
