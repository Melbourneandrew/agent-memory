import { BackboardError } from "@agent-memory-cli/core";

const mockRedirect = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
const mockRevalidatePath = jest.fn();
const mockResolveServerConfiguration = jest.fn();
const mockEnsureServerAssistantId = jest.fn();
const mockCreateServerBackboardClient = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}));

jest.mock("@/lib/server/core", () => ({
  resolveServerConfiguration: () => mockResolveServerConfiguration(),
  ensureServerAssistantId: () => mockEnsureServerAssistantId(),
  createServerBackboardClient: () => mockCreateServerBackboardClient(),
}));

import {
  createMemoryAction,
  deleteMemoryAction,
  searchMemoriesAction,
  searchMemoryAction,
  updateMemoryAction,
} from "@/app/memories/actions";

describe("memories server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("searchMemoriesAction redirects to base route when query is empty", async () => {
    const formData = new FormData();
    formData.set("query", "   ");

    await expect(searchMemoriesAction(formData)).rejects.toThrow(
      "REDIRECT:/memories",
    );
  });

  test("createMemoryAction validates content and auth", async () => {
    const empty = await createMemoryAction("  ");
    expect(empty).toEqual({
      ok: false,
      message: "Memory content is required.",
    });

    mockResolveServerConfiguration.mockReturnValue({
      apiKey: null,
      assistantId: null,
    });
    const missingAuth = await createMemoryAction("hello");
    expect(missingAuth.ok).toBe(false);
    expect(missingAuth.message).toContain("Authentication required");
  });

  test("createMemoryAction creates memory and revalidates routes", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: null,
    });
    mockEnsureServerAssistantId.mockResolvedValue({
      assistantId: "asst_123",
      created: true,
    });
    mockCreateServerBackboardClient.mockReturnValue({
      addMemory: jest.fn().mockResolvedValue({
        id: "mem_1",
        content: "Created memory",
        createdAt: "2026-03-15T00:00:00.000Z",
      }),
    });

    const result = await createMemoryAction("Created memory");
    expect(result.ok).toBe(true);
    expect(result.memoryId).toBe("mem_1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/memories");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/memories/mem_1");
  });

  test("maps network and backboard auth errors to user-friendly messages", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: null,
    });
    mockEnsureServerAssistantId.mockResolvedValue({
      assistantId: "asst_123",
      created: false,
    });
    mockCreateServerBackboardClient.mockReturnValue({
      addMemory: jest.fn().mockRejectedValue(
        new BackboardError({
          message: "forbidden",
          statusCode: 403,
          retryable: false,
        }),
      ),
    });

    const authError = await createMemoryAction("hello");
    expect(authError.message).toContain("Authentication failed");

    mockCreateServerBackboardClient.mockReturnValue({
      addMemory: jest.fn().mockRejectedValue(new TypeError("fetch failed")),
    });
    const networkError = await createMemoryAction("hello");
    expect(networkError.message).toContain("Connection problem");
  });

  test("critical memory flow: create, search, update, delete", async () => {
    const records = new Map<
      string,
      { id: string; content: string; createdAt: string }
    >();
    let idCounter = 1;

    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123",
    });
    mockEnsureServerAssistantId.mockResolvedValue({
      assistantId: "asst_123",
      created: false,
    });

    mockCreateServerBackboardClient.mockReturnValue({
      addMemory: jest.fn(
        async (_assistantId: string, input: { content: string }) => {
          const id = `mem_${idCounter++}`;
          const record = {
            id,
            content: input.content,
            createdAt: "2026-03-15T00:00:00.000Z",
          };
          records.set(id, record);
          return record;
        },
      ),
      updateMemory: jest.fn(
        async (
          _assistantId: string,
          memoryId: string,
          input: { content: string },
        ) => {
          const existing = records.get(memoryId);
          if (!existing) {
            throw new Error("missing");
          }
          const updated = { ...existing, content: input.content };
          records.set(memoryId, updated);
          return updated;
        },
      ),
      deleteMemory: jest.fn(async (_assistantId: string, memoryId: string) => {
        records.delete(memoryId);
        return { deleted: true };
      }),
      searchMemory: jest.fn(async (_assistantId: string, query: string) => {
        const memories = Array.from(records.values()).filter((entry) =>
          entry.content.includes(query),
        );
        return { memories, totalCount: memories.length };
      }),
    });

    const created = await createMemoryAction("alpha memory");
    expect(created.ok).toBe(true);
    expect(created.memoryId).toBeDefined();

    const searched = await searchMemoryAction("alpha");
    expect(searched.ok).toBe(true);
    expect(searched.memories).toHaveLength(1);

    const updated = await updateMemoryAction(
      created.memoryId ?? "",
      "beta memory",
    );
    expect(updated.ok).toBe(true);
    expect(updated.memory?.content).toBe("beta memory");

    const deleted = await deleteMemoryAction(created.memoryId ?? "");
    expect(deleted.ok).toBe(true);
    expect(deleted.deleted).toBe(true);
  });

  test("updateMemoryAction validates inputs and missing auth context", async () => {
    const missingId = await updateMemoryAction(" ", "content");
    expect(missingId).toEqual({
      ok: false,
      message: "A valid memory ID is required.",
    });

    const missingContent = await updateMemoryAction("mem_1", " ");
    expect(missingContent).toEqual({
      ok: false,
      message: "Updated memory content is required.",
    });

    mockResolveServerConfiguration.mockReturnValue({
      apiKey: null,
      assistantId: null,
    });
    const missingAuth = await updateMemoryAction("mem_1", "content");
    expect(missingAuth.ok).toBe(false);
    expect(missingAuth.message).toContain("Authentication required");
  });

  test("deleteMemoryAction validates IDs and maps not-found errors", async () => {
    const missingId = await deleteMemoryAction(" ");
    expect(missingId).toEqual({
      ok: false,
      message: "A valid memory ID is required.",
    });

    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123",
    });
    mockCreateServerBackboardClient.mockReturnValue({
      deleteMemory: jest.fn().mockRejectedValue(
        new BackboardError({
          message: "not found",
          statusCode: 404,
          retryable: false,
        }),
      ),
    });

    const notFound = await deleteMemoryAction("mem_missing");
    expect(notFound.ok).toBe(false);
    expect(notFound.message).toBe("Memory not found.");
  });

  test("searchMemoryAction validates query and maps search errors", async () => {
    const missingQuery = await searchMemoryAction("  ");
    expect(missingQuery).toEqual({
      ok: false,
      message: "Search query is required.",
    });

    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123",
    });
    mockCreateServerBackboardClient.mockReturnValue({
      searchMemory: jest.fn().mockRejectedValue(
        new BackboardError({
          message: "forbidden",
          statusCode: 403,
          retryable: false,
        }),
      ),
    });

    const result = await searchMemoryAction("alpha");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Authentication failed");
  });
});
