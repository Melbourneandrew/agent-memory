"use server";

import { BackboardError, type MemoryRecord } from "@agent-memory-cli/core";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  createServerBackboardClient,
  ensureServerAssistantId,
  resolveServerConfiguration,
} from "@/lib/server/core";

export interface MemoryActionResult {
  ok: boolean;
  message: string;
  memoryId?: string;
  memory?: MemoryRecord;
  deleted?: boolean;
  memories?: MemoryRecord[];
  totalCount?: number;
}

const SEARCH_QUERY_PARAM = "query";
const DEFAULT_SEARCH_LIMIT = 20;

export async function searchMemoriesAction(formData: FormData): Promise<void> {
  const raw = formData.get("query");
  const query = typeof raw === "string" ? raw.trim() : "";
  if (!query) {
    redirect("/memories");
  }

  const encoded = encodeURIComponent(query);
  redirect(`/memories?${SEARCH_QUERY_PARAM}=${encoded}`);
}

export async function createMemoryAction(
  content: string,
): Promise<MemoryActionResult> {
  if (content.trim().length === 0) {
    return {
      ok: false,
      message: "Memory content is required.",
    };
  }

  try {
    const configuration = resolveServerConfiguration();
    if (!configuration.apiKey) {
      return {
        ok: false,
        message:
          "Authentication required. Set an API key in Configuration before creating memories.",
      };
    }

    const { assistantId } = await ensureServerAssistantId();
    const client = createServerBackboardClient();
    const memory = await client.addMemory(assistantId, { content });

    revalidatePath("/memories");
    revalidatePath(`/memories/${memory.id}`);
    return {
      ok: true,
      message: "Memory added successfully.",
      memoryId: memory.id,
      memory,
    };
  } catch (error) {
    return {
      ok: false,
      message: toActionErrorMessage(error),
    };
  }
}

export async function updateMemoryAction(
  memoryId: string,
  content: string,
): Promise<MemoryActionResult> {
  const normalizedId = memoryId.trim();
  if (!normalizedId) {
    return {
      ok: false,
      message: "A valid memory ID is required.",
    };
  }

  if (content.trim().length === 0) {
    return {
      ok: false,
      message: "Updated memory content is required.",
    };
  }

  try {
    const client = createServerBackboardClient();
    const assistantId = resolveAssistantIdForMutations();
    const memory = await client.updateMemory(assistantId, normalizedId, {
      content,
    });

    revalidatePath("/memories");
    revalidatePath(`/memories/${normalizedId}`);
    return {
      ok: true,
      message: "Memory updated successfully.",
      memoryId: memory.id,
      memory,
    };
  } catch (error) {
    return {
      ok: false,
      message: toActionErrorMessage(error),
    };
  }
}

export async function deleteMemoryAction(
  memoryId: string,
): Promise<MemoryActionResult> {
  const normalizedId = memoryId.trim();
  if (!normalizedId) {
    return {
      ok: false,
      message: "A valid memory ID is required.",
    };
  }

  try {
    const client = createServerBackboardClient();
    const assistantId = resolveAssistantIdForMutations();
    await client.deleteMemory(assistantId, normalizedId);

    revalidatePath("/memories");
    revalidatePath(`/memories/${normalizedId}`);
    return {
      ok: true,
      message: "Memory deleted successfully.",
      memoryId: normalizedId,
      deleted: true,
    };
  } catch (error) {
    return {
      ok: false,
      message: toActionErrorMessage(error),
    };
  }
}

export async function searchMemoryAction(
  query: string,
  limit = DEFAULT_SEARCH_LIMIT,
): Promise<MemoryActionResult> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return {
      ok: false,
      message: "Search query is required.",
    };
  }

  const normalizedLimit =
    Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_SEARCH_LIMIT;

  try {
    const client = createServerBackboardClient();
    const assistantId = resolveAssistantIdForMutations();
    const results = await client.searchMemory(
      assistantId,
      normalizedQuery,
      normalizedLimit,
    );
    return {
      ok: true,
      message:
        results.memories.length > 0
          ? "Search completed successfully."
          : "No matching memories were found.",
      memories: results.memories,
      totalCount: results.totalCount ?? results.memories.length,
    };
  } catch (error) {
    return {
      ok: false,
      message: toActionErrorMessage(error),
    };
  }
}

function resolveAssistantIdForMutations(): string {
  const configuration = resolveServerConfiguration();
  if (!configuration.apiKey) {
    throw new Error(
      "Authentication required. Set an API key in Configuration.",
    );
  }

  const assistantId = configuration.assistantId?.trim();
  if (!assistantId) {
    throw new Error(
      "Memory bank not configured. Add a memory first or set assistant-id in Configuration.",
    );
  }

  return assistantId;
}

function toActionErrorMessage(error: unknown): string {
  if (error instanceof BackboardError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "Authentication failed. Update your API key in Configuration and try again.";
    }

    if (error.statusCode === 404) {
      return "Memory not found.";
    }

    return error.message;
  }

  if (isNetworkError(error)) {
    return "Connection problem while contacting Backboard. Please check your network and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected server action error.";
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "AbortError") {
    return true;
  }

  if (error.name !== "TypeError") {
    return false;
  }

  return [
    /fetch/i,
    /network/i,
    /timeout/i,
    /econn/i,
    /enotfound/i,
    /socket/i,
  ].some((pattern) => pattern.test(error.message));
}
