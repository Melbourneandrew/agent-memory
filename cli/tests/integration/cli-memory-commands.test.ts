import {
  BackboardError,
  type ConfigurationResolver,
  type ConfigurationWriter,
  type MemoryRecord,
  type SearchMemoryResult
} from "@agent-memory/core";

import { createMemoryCommandHandlers, type CliCommandHandlers } from "../../src/commands";
import { executeCliCommand } from "./helpers/command-harness";

describe("CLI memory command handlers", () => {
  test("adds memory from CLI argument and prints id", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      addMemory: async () => ({
        id: "mem_123",
        content: "user likes dark mode",
        createdAt: "2026-03-16T00:00:00.000Z"
      })
    });

    const result = await executeCliCommand(["add", "user likes dark mode"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ID: mem_123");
  });

  test("adds memory from stdin when argument missing", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      readStdin: async () => "streamed memory content"
    });
    const result = await executeCliCommand(["add"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ID: mem_default");
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

  test("searches memories with limit", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      searchMemory: async (_assistantId, query, limit) => ({
        memories: [
          {
            id: "mem_search",
            content: `${query}:${limit}`,
            relevanceScore: 0.91,
            createdAt: "2026-03-16T00:00:00.000Z"
          }
        ],
        totalCount: 1
      })
    });

    const result = await executeCliCommand(["search", "dark mode", "--limit", "5"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Found 1 memory result(s)");
    expect(result.stdout).toContain("relevance: 0.91");
  });

  test("shows no-results message for empty search", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      searchMemory: async () => ({ memories: [], totalCount: 0 })
    });

    const result = await executeCliCommand(["search", "none"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No matching memories found.");
  });

  test("validates search limit", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["search", "query", "--limit", "0"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid limit value");
  });

  test("rejects partially numeric pagination and limit values", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const search = await executeCliCommand(["search", "query", "--limit", "10abc"], { handlers });
    const listPage = await executeCliCommand(["list", "--page", "2x"], { handlers });
    const listSize = await executeCliCommand(["list", "--page-size", "5foo"], { handlers });

    expect(search.exitCode).toBe(1);
    expect(listPage.exitCode).toBe(1);
    expect(listSize.exitCode).toBe(1);
  });

  test("rejects unsupported flags for get/add/update", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const getResult = await executeCliCommand(["get", "mem_1", "--page", "2"], { handlers });
    const addResult = await executeCliCommand(["add", "note", "--limit", "5"], { handlers });
    const updateResult = await executeCliCommand(["update", "mem_1", "value", "--page-size", "4"], {
      handlers
    });

    expect(getResult.exitCode).toBe(1);
    expect(addResult.exitCode).toBe(1);
    expect(updateResult.exitCode).toBe(1);
  });

  test("lists memories with pagination and preview truncation", async () => {
    const longContent = "x".repeat(120);
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      listMemories: async () => ({
        memories: [{ id: "mem_list", content: longContent, createdAt: "2026-03-16T00:00:00.000Z" }],
        totalCount: 1
      })
    });

    const result = await executeCliCommand(["list", "--page", "2", "--page-size", "3"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("page 2, page size 3");
    expect(result.stdout).toContain("...");
  });

  test("shows empty message for list with no memories", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      listMemories: async () => ({ memories: [], totalCount: 0 })
    });

    const result = await executeCliCommand(["list"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Memory bank is empty.");
  });

  test("updates memory from stdin when content is omitted", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      readStdin: async () => "updated content",
      updateMemory: async (_assistantId, memoryId, input) => ({
        id: memoryId,
        content: input.content,
        createdAt: "2026-03-16T00:00:00.000Z"
      })
    });

    const result = await executeCliCommand(["update", "mem_1"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Memory updated successfully");
  });

  test("rejects update when content is missing", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      readStdin: async () => ""
    });

    const result = await executeCliCommand(["update", "mem_1"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No update content provided");
  });

  test("rejects update with empty memory id", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["update", "   ", "new"], { handlers });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Memory ID cannot be empty.");
  });

  test("returns get response in JSON format", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      getMemory: async () => ({
        id: "mem_get",
        content: "retrieved",
        createdAt: "2026-03-16T00:00:00.000Z"
      })
    });

    const result = await executeCliCommand(["get", "mem_get", "--format", "json"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("\"id\": \"mem_get\"");
  });

  test("returns list response in JSON format", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["list", "--format", "json"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("\"page\": 1");
    expect(result.stdout).toContain("\"pageSize\": 10");
  });

  test("returns update response in JSON format", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" }
    });

    const result = await executeCliCommand(["update", "mem_1", "new", "--format", "json"], { handlers });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("\"id\": \"mem_1\"");
  });

  test("errors when assistant id is missing for search/list/update", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: null }
    });

    const search = await executeCliCommand(["search", "query"], { handlers });
    const list = await executeCliCommand(["list"], { handlers });
    const update = await executeCliCommand(["update", "mem_1", "new"], { handlers });

    expect(search.exitCode).toBe(1);
    expect(list.exitCode).toBe(1);
    expect(update.exitCode).toBe(1);
    expect(search.stderr).toContain("No assistant ID configured");
    expect(list.stderr).toContain("No assistant ID configured");
    expect(update.stderr).toContain("No assistant ID configured");
  });

  test("maps Backboard errors to exit code 2", async () => {
    const handlers = createHandlers({
      resolverValues: { apiKey: "sk_test", assistantId: "asst_1" },
      searchMemory: async () => throwBackboardError("Search failed."),
      listMemories: async () => throwBackboardError("List failed."),
      updateMemory: async () => throwBackboardError("Update failed.")
    });

    const search = await executeCliCommand(["search", "query"], { handlers });
    const list = await executeCliCommand(["list"], { handlers });
    const update = await executeCliCommand(["update", "mem_1", "new"], { handlers });

    expect(search.exitCode).toBe(2);
    expect(list.exitCode).toBe(2);
    expect(update.exitCode).toBe(2);
  });
});

function createHandlers(options: {
  resolverValues: { apiKey: string | null; assistantId: string | null };
  addMemory?: (assistantId: string, input: { content: string }) => Promise<MemoryRecord>;
  searchMemory?: (assistantId: string, query: string, limit?: number) => Promise<SearchMemoryResult>;
  getMemory?: (assistantId: string, memoryId: string) => Promise<MemoryRecord>;
  listMemories?: (assistantId: string, page?: number, pageSize?: number) => Promise<SearchMemoryResult>;
  updateMemory?: (
    assistantId: string,
    memoryId: string,
    input: { content: string }
  ) => Promise<MemoryRecord>;
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
        values: { apiKey: updates.apiKey ?? null, assistantId: updates.assistantId ?? null }
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
    searchMemory:
      options.searchMemory ??
      (async (_assistantId: string, query: string, limit = 10) => ({
        memories: [
          {
            id: "mem_search_default",
            content: `${query}:${limit}`,
            createdAt: "2026-03-16T00:00:00.000Z"
          }
        ],
        totalCount: 1
      })),
    getMemory:
      options.getMemory ??
      (async (_assistantId: string, memoryId: string) => ({
        id: memoryId,
        content: "memory",
        createdAt: "2026-03-16T00:00:00.000Z"
      })),
    listMemories:
      options.listMemories ??
      (async () => ({
        memories: [{ id: "mem_list_default", content: "listed", createdAt: "2026-03-16T00:00:00.000Z" }],
        totalCount: 1
      })),
    updateMemory:
      options.updateMemory ??
      (async (_assistantId: string, memoryId: string, input: { content: string }) => ({
        id: memoryId,
        content: input.content,
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
    search: memoryHandlers.search,
    get: memoryHandlers.get,
    list: memoryHandlers.list,
    update: memoryHandlers.update,
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
  throw new BackboardError({ message, statusCode: 400, retryable: false });
}
