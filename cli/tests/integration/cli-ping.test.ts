import nock from "nock";

import { executeCliCommand } from "./helpers/command-harness";

describe("CLI ping command", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.cleanAll();
    nock.restore();
  });

  test("returns success with mocked API status", async () => {
    nock("https://api.backboard.dev").get("/health").reply(200, { ok: true });

    const result = await executeCliCommand(["ping"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Backboard connectivity OK (200)");
    expect(result.stderr).toBe("");
  });

  test("returns network exit code when endpoint is unavailable", async () => {
    nock("https://api.backboard.dev")
      .get("/health")
      .replyWithError(new Error("simulated network outage"));

    const result = await executeCliCommand(["ping"]);

    expect(result.exitCode).toBe(3);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Backboard connectivity failed");
  });

  test("returns network exit code for non-2xx HTTP response", async () => {
    nock("https://api.backboard.dev").get("/health").reply(503, { ok: false });

    const result = await executeCliCommand(["ping"]);

    expect(result.exitCode).toBe(3);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Backboard connectivity failed: HTTP 503");
  });

  test("returns validation error when --endpoint value is missing", async () => {
    const result = await executeCliCommand(["ping", "--endpoint"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Missing value for --endpoint.");
  });
});
