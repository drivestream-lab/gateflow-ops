// Unit tests for lib/bff-logging.ts — verifies log contract: each function calls
// the correct log level with the expected shape, including durationMs.
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Logger } from "pino";

vi.mock("server-only", () => ({}));

const { logRequestStart, logRequestSuccess, logRequestError } = await import("@/lib/bff-logging");

function makeLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger;
}

describe("logRequestStart", () => {
  it("logs at info level and returns a number timestamp", () => {
    const logger = makeLogger();
    const before = Date.now();
    const startTime = logRequestStart(logger);
    expect(startTime).toBeGreaterThanOrEqual(before);
    expect(logger.info).toHaveBeenCalledWith("bff request started");
  });
});

describe("logRequestSuccess", () => {
  it("logs status and durationMs at info level", () => {
    const logger = makeLogger();
    const startTime = Date.now() - 50;
    logRequestSuccess(logger, startTime, 200);
    const infoMock = logger.info as ReturnType<typeof vi.fn>;
    expect(infoMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200 }),
      "bff request completed",
    );
    expect(infoMock.mock.calls[0]![0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("defaults to status 200 when omitted", () => {
    const logger = makeLogger();
    logRequestSuccess(logger, Date.now());
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200 }),
      "bff request completed",
    );
  });
});

describe("logRequestError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs status, durationMs, and error message at error level", () => {
    const logger = makeLogger();
    const startTime = Date.now() - 30;
    logRequestError(logger, startTime, new Error("upstream timeout"), 502);
    const errorMock = logger.error as ReturnType<typeof vi.fn>;
    expect(errorMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 502, error: "upstream timeout" }),
      "bff request failed",
    );
    expect(errorMock.mock.calls[0]![0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("coerces non-Error thrown values to string", () => {
    const logger = makeLogger();
    logRequestError(logger, Date.now(), "something went wrong", 500);
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ error: "something went wrong" }),
      "bff request failed",
    );
  });
});
