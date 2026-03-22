import { BackboardError } from "@agent-memory-cli/core";
import { notFound } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTimestamp } from "@/lib/memory-utils";
import {
  createServerBackboardClient,
  resolveServerConfiguration,
} from "@/lib/server/core";

interface MemoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemoryDetailPage({
  params,
}: MemoryDetailPageProps) {
  const { id } = await params;

  const configuration = resolveServerConfiguration();
  if (!configuration.apiKey) {
    return (
      <Alert>
        <AlertTitle>API key required</AlertTitle>
        <AlertDescription>
          Run <code>agent-memory config set api-key &lt;your-api-key&gt;</code>{" "}
          in your terminal, then reload this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!configuration.assistantId) {
    return (
      <Alert>
        <AlertTitle>Memory bank not configured</AlertTitle>
        <AlertDescription>
          Configure an assistant ID from the Configuration page before opening
          memory details.
        </AlertDescription>
      </Alert>
    );
  }

  let memory: MemoryDetail | null = null;
  let fetchErrorMessage: string | null = null;

  try {
    const client = createServerBackboardClient();
    const loaded = await client.getMemory(configuration.assistantId, id);
    memory = {
      id: loaded.id,
      content: loaded.content,
      createdAt: loaded.createdAt,
      updatedAt: loaded.updatedAt,
    };
  } catch (error) {
    if (error instanceof BackboardError && error.statusCode === 404) {
      notFound();
    }
    fetchErrorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected error while loading memory.";
  }

  if (fetchErrorMessage || !memory) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load memory</AlertTitle>
        <AlertDescription>
          {fetchErrorMessage ?? "Unexpected error while loading memory."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Memory Detail</CardTitle>
          <CardDescription>Full memory content and metadata.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm">
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Memory ID</dt>
              <dd className="font-mono">{memory.id}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatTimestamp(memory.createdAt)}</dd>
            </div>
            {memory.updatedAt ? (
              <div className="grid gap-1">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{formatTimestamp(memory.updatedAt)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="space-y-1">
            <p className="text-sm font-medium">Content</p>
            <pre className="overflow-x-auto rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {memory.content}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Edit (WO-12)
            </Button>
            <Button variant="destructive" disabled>
              Delete (WO-12)
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface MemoryDetail {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
