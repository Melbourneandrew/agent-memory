import { BackboardError } from "@agent-memory-cli/core";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mockResolveServerConfiguration = jest.fn();
const mockCreateServerBackboardClient = jest.fn();
const mockNotFound = jest.fn(() => {
  throw new Error("NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

jest.mock("@/lib/server/core", () => ({
  resolveServerConfiguration: () => mockResolveServerConfiguration(),
  createServerBackboardClient: () => mockCreateServerBackboardClient(),
}));

import MemoryDetailPage from "@/app/memories/[id]/page";

describe("MemoryDetailPage server component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders auth warning when API key is missing", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: null,
      assistantId: null,
    });

    const element = await MemoryDetailPage({
      params: Promise.resolve({ id: "mem_1" }),
    });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("API key required");
  });

  test("renders detail when memory fetch succeeds", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123",
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getMemory: jest.fn().mockResolvedValue({
        id: "mem_1",
        content: "Detailed memory",
        createdAt: "2026-03-15T00:00:00.000Z",
        updatedAt: "2026-03-15T00:01:00.000Z",
      }),
    });

    const element = await MemoryDetailPage({
      params: Promise.resolve({ id: "mem_1" }),
    });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Memory Detail");
    expect(html).toContain("mem_1");
    expect(html).toContain("Detailed memory");
  });

  test("delegates 404 errors to Next notFound", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123",
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getMemory: jest.fn().mockRejectedValue(
        new BackboardError({
          message: "missing",
          statusCode: 404,
          retryable: false,
        }),
      ),
    });

    await expect(
      MemoryDetailPage({ params: Promise.resolve({ id: "mem_404" }) }),
    ).rejects.toThrow("NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalled();
  });
});
