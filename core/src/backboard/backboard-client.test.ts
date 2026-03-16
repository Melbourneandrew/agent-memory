import { BackboardClient } from "./backboard-client";
import { BackboardError } from "./errors";
import { BackboardSdkClient } from "./types";

const createMockSdkClient = (): jest.Mocked<BackboardSdkClient> => ({
  addMemory: jest.fn(),
  searchMemories: jest.fn(),
  getMemory: jest.fn(),
  getMemories: jest.fn(),
  updateMemory: jest.fn(),
  deleteMemory: jest.fn(),
  createAssistant: jest.fn(),
  getMemoryStats: jest.fn(),
  getMemoryOperationStatus: jest.fn()
});

describe("BackboardClient wrapper", () => {
  it("maps memory operations to sdk methods", async () => {
    const sdk = createMockSdkClient();
    sdk.addMemory.mockResolvedValue({
      id: "mem_1",
      content: "hello",
      createdAt: "2026-03-16T00:00:00Z"
    });
    sdk.searchMemories.mockResolvedValue({
      memories: [{ id: "mem_2", content: "world", createdAt: "2026-03-16T00:00:00Z", score: 0.9 }],
      totalCount: 1
    });

    const client = new BackboardClient("api-key", { sdkClient: sdk });

    const added = await client.addMemory("assistant_1", { content: "hello" });
    expect(added.id).toBe("mem_1");
    expect(sdk.addMemory).toHaveBeenCalledWith("assistant_1", { content: "hello" });

    const searched = await client.searchMemory("assistant_1", "world", 5);
    expect(sdk.searchMemories).toHaveBeenCalledWith("assistant_1", "world", 5);
    expect(searched.memories[0].relevanceScore).toBe(0.9);
    expect(searched.totalCount).toBe(1);

    sdk.getMemories.mockResolvedValue({
      memories: [{ id: "mem_3", content: "list", createdAt: "2026-03-16T00:00:00Z" }],
      totalCount: 1
    });
    const listed = await client.listMemories("assistant_1");
    expect(sdk.getMemories).toHaveBeenCalledWith("assistant_1");
    expect(listed.memories[0].id).toBe("mem_3");

    sdk.updateMemory.mockResolvedValue({
      id: "mem_1",
      content: "updated",
      createdAt: "2026-03-16T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    });
    const updated = await client.updateMemory("assistant_1", "mem_1", { content: "updated" });
    expect(sdk.updateMemory).toHaveBeenCalledWith("assistant_1", "mem_1", { content: "updated" });
    expect(updated.updatedAt).toBe("2026-03-17T00:00:00Z");

    sdk.deleteMemory.mockResolvedValue({ operationId: "op_del_1" });
    const deleted = await client.deleteMemory("assistant_1", "mem_1");
    expect(sdk.deleteMemory).toHaveBeenCalledWith("assistant_1", "mem_1");
    expect(deleted).toEqual({ deleted: true, operationId: "op_del_1" });
  });

  it("maps createAssistant and system calls", async () => {
    const sdk = createMockSdkClient();
    sdk.createAssistant.mockResolvedValue({
      assistantId: "ast_1",
      name: "agent-memory-cli",
      systemPrompt: "prompt",
      tools: null,
      createdAt: new Date("2026-03-16T00:00:00Z")
    });
    sdk.getMemoryStats.mockResolvedValue({ totalMemories: 2 });
    sdk.getMemoryOperationStatus.mockResolvedValue({ operationId: "op_1", status: "completed" });

    const client = new BackboardClient("api-key", { sdkClient: sdk });
    const assistant = await client.createAssistant({
      name: "agent-memory-cli",
      systemPrompt: "prompt"
    });
    expect(sdk.createAssistant).toHaveBeenCalledWith({
      name: "agent-memory-cli",
      description: undefined,
      system_prompt: "prompt"
    });
    expect(assistant.assistantId).toBe("ast_1");

    const stats = await client.getStats("ast_1");
    expect(stats.totalMemories).toBe(2);
    const status = await client.getOperationStatus("op_1");
    expect(status.status).toBe("completed");
  });

  it("normalizes sdk errors to BackboardError", async () => {
    const sdk = createMockSdkClient();
    const error = Object.assign(new Error("Rate limited"), {
      name: "BackboardRateLimitError",
      statusCode: 429
    });
    sdk.addMemory.mockRejectedValue(error);

    const client = new BackboardClient("api-key", { sdkClient: sdk });

    await expect(client.addMemory("assistant_1", { content: "hello" })).rejects.toMatchObject<
      Partial<BackboardError>
    >({
      name: "BackboardError",
      message: "Rate limited",
      statusCode: 429,
      retryable: true,
      backboardCode: "BackboardRateLimitError"
    });
  });

  it("extracts backboardCode from response payload when available", async () => {
    const sdk = createMockSdkClient();
    const error = {
      name: "BackboardAPIError",
      message: "Request failed",
      statusCode: 400,
      response: {
        clone: () => ({
          json: async () => ({ error: { code: "invalid_input" } })
        })
      }
    };
    sdk.addMemory.mockRejectedValue(error);

    const client = new BackboardClient("api-key", { sdkClient: sdk });
    await expect(client.addMemory("assistant_1", { content: "hello" })).rejects.toMatchObject({
      backboardCode: "invalid_input",
      retryable: false
    });
  });

  it("normalizes network errors as retryable", async () => {
    const sdk = createMockSdkClient();
    const networkError = Object.assign(new Error("fetch failed"), { name: "TypeError" });
    sdk.getMemory.mockRejectedValue(networkError);
    const client = new BackboardClient("api-key", { sdkClient: sdk });

    await expect(client.getMemory("assistant_1", "mem_1")).rejects.toMatchObject({
      name: "BackboardError",
      retryable: true
    });
  });

  it("normalizes non-object thrown errors safely", async () => {
    const sdk = createMockSdkClient();
    sdk.getMemory.mockRejectedValue("plain string error");
    const client = new BackboardClient("api-key", { sdkClient: sdk });

    await expect(client.getMemory("assistant_1", "mem_1")).rejects.toMatchObject({
      name: "BackboardError",
      message: "plain string error"
    });
  });

  it("initializes sdk client with API key and options", async () => {
    const sdk = createMockSdkClient();
    sdk.getMemory.mockResolvedValue({
      id: "mem_10",
      content: "hello",
      createdAt: "2026-03-16T00:00:00Z"
    });
    const sdkFactory = jest.fn().mockResolvedValue(sdk);

    const client = new BackboardClient("api-key-123", {
      baseUrl: "https://example.backboard.io",
      timeout: 10000,
      sdkFactory
    });
    await client.getMemory("assistant_1", "mem_10");

    expect(sdkFactory).toHaveBeenCalledWith({
      apiKey: "api-key-123",
      baseUrl: "https://example.backboard.io",
      timeout: 10000
    });
  });
});
