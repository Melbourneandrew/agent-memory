import { BackboardError, type ConfigurationResolver, type ConfigurationWriter, type MemoryRecord } from "@agent-memory/core";

import { createMemoryCommandHandlers, type CliCommandHandlers } from "../../src/commands";
import { executeCliCommand } from "./helpers/command-harness";

describe("CLI memory command handlers", () => {
  test("adds memory from CLI argument and prints id", async () => {
    const stored: MemoryRecord = {
      id: "mem_123",
      content: "user likes dark mode",
      createdAt: "2026-03-16T00:00:00.000Z"
    };

    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      addMemory: async () => stored
    });

    const result = await executeCliCommand(["add", "user likes dark mode"], { handlers });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Memory added successfully");
    expect(result.stdout).toContain("ID: mem_123");
  });

  test("adds memory from stdin when argument missing", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      readStdin: async () => "streamed memory content",
      addMemory: async (_assistantId, input) => ({
        id: "mem_stream",
        content: input.content,
        createdAt: "2026-03-16T00:00:00.000Z"
      })
    });

    const result = await executeCliCommand(["add"], { handlers });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("ID: mem_stream");
  });

  test("auto-creates assistant id during add when missing", async () => {
    const writeCalls: Array<{ path: string; assistantId: string | null }> = [];
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null },
      ensuredAssistantId: "asst_created",
      writerWrite: () => {
        writeCalls.push({ path: "global", assistantId: "asst_created" });
      },
      addMemory: async (assistantId, input) => ({
        id: "mem_new",
        content: `${assistantId}:${input.content}`,
        createdAt: "2026-03-16T00:00:00.000Z"
      })
    });

    const result = await executeCliCommand(["add", "hello"], { handlers });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ID: mem_new");
    expect(writeCalls.length).toBe(1);
  });

  test("gets memory in JSON format", async () => {
    const memory: MemoryRecord = {
      id: "mem_get",
      content: "retrieved",
      createdAt: "2026-03-16T00:00:00.000Z"
    };
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getMemory: async () => memory
    });

    const result = await executeCliCommand(["get", "mem_get", "--format", "json"], { handlers });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("\"id\": \"mem_get\"");
  });

  test("deletes memory with JSON output", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      deleteMemory: async () => ({ deleted: true, operationId: "op_1" })
    });

    const result = await executeCliCommand(["delete", "mem_delete", "--format", "json"], {
      handlers
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("\"memoryId\": \"mem_delete\"");
    expect(result.stdout).toContain("\"operationId\": \"op_1\"");
  });

  test("errors when API key is missing", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: null, assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["get", "mem_1"], { handlers });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No API key configured");
  });

  test("errors when assistant id is missing for get", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null }
    });

    const result = await executeCliCommand(["get", "mem_1"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No assistant ID configured");
  });

  test("errors when assistant id is missing for delete", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null }
    });

    const result = await executeCliCommand(["delete", "mem_1"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No assistant ID configured");
  });

  test("maps add BackboardError to exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      addMemory: async () => {
        throwBackboardError("Add failed.");
      }
    });

    const result = await executeCliCommand(["add", "hello"], { handlers });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Add failed.");
  });

  test("maps get BackboardError to exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getMemory: async () => {
        throwBackboardError("Memory not found.");
      }
    });

    const result = await executeCliCommand(["get", "mem_missing"], { handlers });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Memory not found.");
  });

  test("maps delete BackboardError to exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      deleteMemory: async () => {
        throwBackboardError("Delete failed.");
      }
    });

    const result = await executeCliCommand(["delete", "mem_1"], { handlers });
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Delete failed.");
  });

  test("returns usage error for unsupported format", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["get", "mem_1", "--format", "yaml"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid format");
  });

  test("does not initialize assistant when add has no content", async () => {
    let ensureCalls = 0;
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null },
      readStdin: async () => "",
      ensureAssistantId: async () => {
        ensureCalls += 1;
        return "asst_created";
      }
    });

    const result = await executeCliCommand(["add"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No memory content provided");
    expect(ensureCalls).toBe(0);
  });
});

function createHandlers(options: {
  resolverValues: { apiKey: string | null; assistantId: string | null };
  addMemory?: (assistantId: string, input: { content: string }) => Promise<MemoryRecord>;
  getMemory?: (assistantId: string, memoryId: string) => Promise<MemoryRecord>;
  deleteMemory?: (
    assistantId: string,
    memoryId: string
  ) => Promise<{ deleted: boolean; operationId?: string }>;
  readStdin?: () => Promise<string>;
  ensuredAssistantId?: string;
  ensureAssistantId?: () => Promise<string>;
  writerWrite?: (
    updates: { apiKey?: string | null; assistantId?: string | null },
    target: "global" | "local" | "auto",
    cwd: string
  ) => void;
}): CliCommandHandlers {
  const resolver: Pick<ConfigurationResolver, "resolve"> = {
    resolve: () => ({
      apiKey: options.resolverValues.apiKey,
      assistantId: options.resolverValues.assistantId
    })
  };

  const writer: Pick<ConfigurationWriter, "write"> = {
    write: (updates, target, cwd) => {
      if (options.writerWrite) {
        options.writerWrite(updates, target ?? "auto", cwd ?? "");
      }

      return {
        path: `${target}:${cwd}`,
        values: {
          apiKey: updates.apiKey ?? null,
          assistantId: updates.assistantId ?? null
        }
      };
    }
  };

  const client = {
    addMemory:
      options.addMemory ??
      (async (_assistantId: string, input: { content: string }) => ({
        id: "mem_default",
        content: input.content,
        createdAt: "2026-03-16T00:00:00.000Z"
      })),
    getMemory:
      options.getMemory ??
      (async (_assistantId: string, memoryId: string) => ({
        id: memoryId,
        content: "memory",
        createdAt: "2026-03-16T00:00:00.000Z"
      })),
    deleteMemory:
      options.deleteMemory ??
      (async () => ({ deleted: true })),
    createAssistant: async () => ({
      assistantId: options.ensuredAssistantId ?? "asst_default",
      name: "agent-memory-cli",
      createdAt: new Date("2026-03-16T00:00:00.000Z")
    })
  };

  const memoryHandlers = createMemoryCommandHandlers({
    configurationResolver: resolver as ConfigurationResolver,
    configurationWriter: writer as ConfigurationWriter,
    createBackboardClient: () => client,
    ensureAssistantId:
      options.ensureAssistantId ?? (async () => options.ensuredAssistantId ?? "asst_default"),
    readStdin: options.readStdin ?? (async () => "")
  });

  const noop = async (): Promise<void> => undefined;
  return {
    add: memoryHandlers.add,
    search: noop,
    get: memoryHandlers.get,
    list: noop,
    update: noop,
    delete: memoryHandlers.delete,
    configSet: noop,
    configShow: noop,
    configClear: noop,
    stats: noop,
    status: noop,
    web: noop
  };
}

function throwBackboardError(message: string): never {
  throw new BackboardError({
    message,
    statusCode: 400,
    retryable: false
  });
}
