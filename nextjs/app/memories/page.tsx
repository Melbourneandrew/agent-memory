import Link from "next/link";
import { BackboardError } from "@agent-memory/core";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTimestamp, parsePositiveInt, toMemoryPreview } from "@/lib/memory-utils";
import { createServerBackboardClient, resolveServerConfiguration } from "@/lib/server/core";

import { searchMemoriesAction } from "./actions";

const DEFAULT_PAGE_SIZE = 20;
const QUERY_KEY = "query";
const PAGE_KEY = "page";

interface MemoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface StatsSummary {
  totalMemories: number;
  extras: Array<{ key: string; value: string }>;
}

export default async function MemoriesPage({ searchParams }: MemoriesPageProps) {
  const params = await searchParams;
  const page = parsePositiveInt(toSingleValue(params[PAGE_KEY]), 1);
  const query = (toSingleValue(params[QUERY_KEY]) ?? "").trim();
  const isSearchMode = query.length > 0;

  const configuration = resolveServerConfiguration();
  if (!configuration.apiKey) {
    return (
      <section className="space-y-4">
        <Alert>
          <AlertTitle>API key required</AlertTitle>
          <AlertDescription>
            Run <code>agent-memory config set api-key &lt;your-api-key&gt;</code> in your terminal,
            then reload this page.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!configuration.assistantId) {
    return (
      <section className="space-y-4">
        <Alert>
          <AlertTitle>Memory bank not configured</AlertTitle>
          <AlertDescription>
            Set an assistant ID in Configuration, or add your first memory to auto-create one.
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  let statsSummary: StatsSummary | null = null;
  let memories: MemoryView[] = [];
  let totalCount = 0;
  let fetchErrorMessage: string | null = null;

  try {
    const client = createServerBackboardClient();
    const [stats, memoryResponse] = await Promise.all([
      client.getStats(configuration.assistantId),
      isSearchMode
        ? client.searchMemory(configuration.assistantId, query, DEFAULT_PAGE_SIZE)
        : client.listMemories(configuration.assistantId, page, DEFAULT_PAGE_SIZE)
    ]);

    statsSummary = toStatsSummary(stats);
    memories = memoryResponse.memories;
    totalCount = memoryResponse.totalCount ?? memories.length;
  } catch (error) {
    fetchErrorMessage = toUiErrorMessage(error);
  }

  if (fetchErrorMessage || !statsSummary) {
    return (
      <section className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Could not load memories</AlertTitle>
          <AlertDescription>
            {fetchErrorMessage ?? "Unexpected error while loading memories."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  const hasPrevious = page > 1 && !isSearchMode;
  const hasNext = !isSearchMode && page * DEFAULT_PAGE_SIZE < totalCount;

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Memory Stats</CardTitle>
          <CardDescription>Current usage snapshot for this memory bank.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary">Total memories: {statsSummary.totalMemories}</Badge>
          {statsSummary.extras.map((entry) => (
            <Badge key={entry.key} variant="outline">
              {entry.key}: {entry.value}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div>
            <CardTitle>{isSearchMode ? "Search Results" : "Memories"}</CardTitle>
            <CardDescription>
              {isSearchMode
                ? `Showing results for "${query}".`
                : `Page ${page} with ${DEFAULT_PAGE_SIZE} memories per page.`}
            </CardDescription>
          </div>
          <form action={searchMemoriesAction} className="flex gap-2">
            <Input name="query" placeholder="Search memories..." defaultValue={query} />
            <Button type="submit">Search</Button>
            {isSearchMode ? (
              <Button asChild variant="outline">
                <Link href="/memories">Clear</Link>
              </Button>
            ) : null}
          </form>
        </CardHeader>
        <CardContent>
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isSearchMode ? "No matching memories were found." : "Memory bank is empty."}
            </p>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memory ID</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memories.map((memory) => (
                    <TableRow key={memory.id}>
                      <TableCell className="font-mono text-xs">
                        <Link href={`/memories/${memory.id}`} className="hover:underline">
                          {memory.id}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xl">
                        <div className="space-y-1">
                          <p className="text-sm">{toMemoryPreview(memory.content)}</p>
                          {typeof memory.relevanceScore === "number" ? (
                            <p className="text-xs text-muted-foreground">
                              Relevance: {memory.relevanceScore.toFixed(2)}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatTimestamp(memory.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!isSearchMode ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Showing {memories.length} of {totalCount}
                  </span>
                  <div className="flex gap-2">
                    {hasPrevious ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/memories?${PAGE_KEY}=${Math.max(1, page - 1)}`}>Previous</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                    )}
                    {hasNext ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/memories?${PAGE_KEY}=${page + 1}`}>Next</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function toSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function toStatsSummary(stats: unknown): StatsSummary {
  const statsRecord =
    typeof stats === "object" && stats !== null ? (stats as Record<string, unknown>) : {};
  const totalMemories =
    typeof statsRecord.totalMemories === "number" && Number.isFinite(statsRecord.totalMemories)
      ? statsRecord.totalMemories
      : 0;
  const extras = Object.entries(statsRecord)
    .filter(([key]) => key !== "totalMemories")
    .map(([key, value]) => ({ key, value: String(value) }));
  return { totalMemories, extras };
}

interface MemoryView {
  id: string;
  content: string;
  createdAt: string;
  relevanceScore?: number;
}

function toUiErrorMessage(error: unknown): string {
  if (error instanceof BackboardError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error while loading memories.";
}

