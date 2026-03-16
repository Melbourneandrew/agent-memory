import { BackboardError } from "@agent-memory/core";

import { executeCliCommand } from "./helpers/command-harness";

describe("CLI command routing and errors", () => {
  test("routes memory command handlers", async () => {
    const result = await executeCliCommand(["add", "hello"], {
      handlers: {
        add: async ({ writeStdout }) => {
          writeStdout("add handled\n");
        },
        search: async () => undefined,
        get: async () => undefined,
        list: async () => undefined,
        update: async () => undefined,
        delete: async () => undefined,
        configSet: async () => undefined,
        configShow: async () => undefined,
        configClear: async () => undefined,
        stats: async () => undefined,
        status: async () => undefined,
        web: async () => undefined
      }
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("add handled");
    expect(result.stderr).toBe("");
  });

  test("returns usage error when command is unknown", async () => {
    const result = await executeCliCommand(["not-a-command"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown command");
  });

  test("rejects unexpected arguments for zero-arg commands", async () => {
    const result = await executeCliCommand(["stats", "extra-arg"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unexpected argument(s) for `stats`.");
  });

  test("maps BackboardError to exit code 2", async () => {
    const result = await executeCliCommand(["status"], {
      handlers: {
        add: async () => undefined,
        search: async () => undefined,
        get: async () => undefined,
        list: async () => undefined,
        update: async () => undefined,
        delete: async () => undefined,
        configSet: async () => undefined,
        configShow: async () => undefined,
        configClear: async () => undefined,
        stats: async () => undefined,
        status: async () => {
          throw new BackboardError({
            message: "API rejected request.",
            statusCode: 401,
            retryable: false
          });
        },
        web: async () => undefined
      }
    });

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("API rejected request.");
  });

  test("maps network error to exit code 3", async () => {
    const result = await executeCliCommand(["stats"], {
      handlers: {
        add: async () => undefined,
        search: async () => undefined,
        get: async () => undefined,
        list: async () => undefined,
        update: async () => undefined,
        delete: async () => undefined,
        configSet: async () => undefined,
        configShow: async () => undefined,
        configClear: async () => undefined,
        stats: async () => {
          const networkError = new TypeError("fetch failed");
          networkError.name = "TypeError";
          throw networkError;
        },
        status: async () => undefined,
        web: async () => undefined
      }
    });

    expect(result.exitCode).toBe(3);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("fetch failed");
  });
});
