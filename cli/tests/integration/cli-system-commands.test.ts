import {
  BackboardError,
  type BackboardClient,
  type ConfigurationResolver
} from "@agent-memory-cli/core";

import { createSystemCommandHandlers, type CliCommandHandlers } from "../../src/commands";
import { executeCliCommand } from "./helpers/command-harness";

describe("CLI system command handlers", () => {
  test("renders stats in plain text", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getStats: async () => ({ totalMemories: 2, storageBytes: 256 })
    });

    const result = await executeCliCommand(["stats"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Total memories: 2");
    expect(result.stdout).toContain("storageBytes: 256");
  });

  test("renders stats empty message when zero", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getStats: async () => ({ totalMemories: 0 })
    });

    const result = await executeCliCommand(["stats"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Memory bank is empty.");
  });

  test("renders stats as JSON", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getStats: async () => ({ totalMemories: 3 })
    });

    const result = await executeCliCommand(["stats", "--format", "json"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('"totalMemories": 3');
  });

  test("renders status in plain text", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getOperationStatus: async (operationId) => ({ operationId, status: "completed" })
    });

    const result = await executeCliCommand(["status", "op_1"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Operation ID: op_1");
    expect(result.stdout).toContain("Status: completed");
  });

  test("renders failed status error details", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getOperationStatus: async () => ({ operationId: "op_2", status: "failed", error: "boom" })
    });

    const result = await executeCliCommand(["status", "op_2"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Status: failed");
    expect(result.stdout).toContain("Error: boom");
  });

  test("requires operation id for status", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["status"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Usage: agent-memory status <operation-id>");
  });

  test("requires assistant id for stats", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null }
    });

    const result = await executeCliCommand(["stats"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No assistant ID configured");
  });

  test("requires api key for stats and status", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: null, assistantId: "asst_1" }
    });

    const stats = await executeCliCommand(["stats"], { handlers });
    const status = await executeCliCommand(["status", "op_1"], { handlers });
    expect(stats.exitCode).toBe(1);
    expect(status.exitCode).toBe(1);
    expect(stats.stderr).toContain("No API key configured");
  });

  test("maps BackboardError to exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getStats: async () => {
        throwBackboardError("Stats unavailable.");
      },
      getOperationStatus: async () => {
        throwBackboardError("Status lookup failed.");
      }
    });

    const stats = await executeCliCommand(["stats"], { handlers });
    const status = await executeCliCommand(["status", "op_1"], { handlers });
    expect(stats.exitCode).toBe(2);
    expect(status.exitCode).toBe(2);
  });

  test("reports authentication failures with exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getOperationStatus: async () => {
        throw new BackboardError({
          message: "Authentication failed: invalid credentials.",
          statusCode: 401,
          retryable: false
        });
      }
    });

    const result = await executeCliCommand(["status", "op_auth_fail"], { handlers });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Authentication failed");
  });

  test("maps network failures to exit code 3", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getStats: async () => {
        const error = new TypeError("fetch timeout");
        error.name = "TypeError";
        throw error;
      }
    });

    const result = await executeCliCommand(["stats"], { handlers });
    expect(result.exitCode).toBe(3);
    expect(result.stderr).toContain("fetch timeout");
  });

  test("rejects unknown flags and missing/invalid format values", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const unknown = await executeCliCommand(["stats", "--nope"], { handlers });
    const missing = await executeCliCommand(["stats", "--format"], { handlers });
    const invalid = await executeCliCommand(["status", "op_1", "--format", "yaml"], { handlers });

    expect(unknown.exitCode).toBe(1);
    expect(missing.exitCode).toBe(1);
    expect(invalid.exitCode).toBe(1);
    expect(unknown.stderr).toContain("Unknown flag");
    expect(missing.stderr).toContain("Invalid format");
    expect(invalid.stderr).toContain("Invalid format");
  });
});

function createHandlers(options: {
  resolverValues: { apiKey: string | null; assistantId: string | null };
  getStats?: (assistantId: string) => Promise<Record<string, unknown>>;
  getOperationStatus?: (operationId: string) => Promise<Record<string, unknown>>;
}): CliCommandHandlers {
  const resolver: Pick<ConfigurationResolver, "resolve"> = {
    resolve: () => ({
      apiKey: options.resolverValues.apiKey,
      assistantId: options.resolverValues.assistantId
    })
  };

  const systemHandlers = createSystemCommandHandlers({
    configurationResolver: resolver as ConfigurationResolver,
    createBackboardClient: () =>
      ({
        getStats:
          options.getStats ??
          (async () => ({
            totalMemories: 1
          })),
        getOperationStatus:
          options.getOperationStatus ??
          (async (operationId: string) => ({
            operationId,
            status: "pending"
          }))
      }) as unknown as Pick<BackboardClient, "getStats" | "getOperationStatus">
  });

  const noop = async (): Promise<void> => undefined;
  return {
    add: noop,
    search: noop,
    get: noop,
    list: noop,
    update: noop,
    delete: noop,
    configSet: noop,
    configShow: noop,
    configClear: noop,
    stats: systemHandlers.stats,
    status: systemHandlers.status,
    web: noop
  };
}

function throwBackboardError(message: string): never {
  throw new BackboardError({
    message,
    statusCode: 500,
    retryable: true
  });
}
