import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mockResolveServerConfiguration = jest.fn();
const mockCreateServerBackboardClient = jest.fn();

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: ReactElement | string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

jest.mock("@/lib/server/core", () => ({
  resolveServerConfiguration: () => mockResolveServerConfiguration(),
  createServerBackboardClient: () => mockCreateServerBackboardClient()
}));

import MemoriesPage from "@/app/memories/page";

describe("MemoriesPage server component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders authentication requirement when api key is missing", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: null,
      assistantId: null
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("API key required");
    expect(html).toContain("agent-memory config set api-key");
  });

  test("renders stats and memories when data loads", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123"
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getStats: jest.fn().mockResolvedValue({ totalMemories: 2, storageBytes: 256 }),
      listMemories: jest.fn().mockResolvedValue({
        memories: [{ id: "mem_1", content: "Memory content", createdAt: "2026-03-15T00:00:00.000Z" }],
        totalCount: 1
      }),
      searchMemory: jest.fn()
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({ page: "1" }) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Memory Stats");
    expect(html).toContain("Total memories: 2");
    expect(html).toContain("mem_1");
    expect(html).toContain("Memory content");
  });

  test("renders error state when fetching fails", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123"
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getStats: jest.fn().mockRejectedValue(new Error("boom")),
      listMemories: jest.fn(),
      searchMemory: jest.fn()
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Could not load memories");
    expect(html).toContain("boom");
  });

  test("renders search results mode with clear action", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123"
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getStats: jest.fn().mockResolvedValue({ totalMemories: 2 }),
      listMemories: jest.fn(),
      searchMemory: jest.fn().mockResolvedValue({
        memories: [{ id: "mem_search", content: "query match", createdAt: "2026-03-15T00:00:00.000Z" }],
        totalCount: 1
      })
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({ query: "query" }) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Search Results");
    expect(html).toContain("mem_search");
    expect(html).toContain("Clear");
  });

  test("renders empty memory-bank state when list is empty", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123"
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getStats: jest.fn().mockResolvedValue({ totalMemories: 0 }),
      listMemories: jest.fn().mockResolvedValue({
        memories: [],
        totalCount: 0
      }),
      searchMemory: jest.fn()
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("Memory bank is empty.");
  });

  test("renders empty search-results state", async () => {
    mockResolveServerConfiguration.mockReturnValue({
      apiKey: "sk_test",
      assistantId: "asst_123"
    });
    mockCreateServerBackboardClient.mockReturnValue({
      getStats: jest.fn().mockResolvedValue({ totalMemories: 1 }),
      listMemories: jest.fn(),
      searchMemory: jest.fn().mockResolvedValue({
        memories: [],
        totalCount: 0
      })
    });

    const element = await MemoriesPage({ searchParams: Promise.resolve({ query: "none" }) });
    const html = renderToStaticMarkup(element as ReactElement);
    expect(html).toContain("No matching memories were found.");
  });
});
