import {
  AssistantInitializer,
  BackboardClient,
  ConfigurationResolver,
  ConfigurationWriter
} from "@agent-memory-cli/core";

import { CliUsageError } from "../errors";
import type { CliCommandHandlers, CommandHandler } from "./types";

type OutputFormat = "plain" | "json";

interface MemoryCommandHandlerDependencies {
  readonly configurationResolver: ConfigurationResolver;
  readonly configurationWriter: ConfigurationWriter;
  readonly createBackboardClient: (
    apiKey: string
  ) => Pick<
    BackboardClient,
    | "addMemory"
    | "searchMemory"
    | "getMemory"
    | "listMemories"
    | "updateMemory"
    | "deleteMemory"
    | "createAssistant"
  >;
  readonly ensureAssistantId: (apiKey: string, assistantId: string | null) => Promise<string>;
  readonly readStdin: () => Promise<string>;
}

const defaultDependencies: MemoryCommandHandlerDependencies = {
  configurationResolver: new ConfigurationResolver(),
  configurationWriter: new ConfigurationWriter(),
  createBackboardClient: (apiKey) => new BackboardClient(apiKey),
  ensureAssistantId: async (apiKey, assistantId) => {
    const initializer = new AssistantInitializer(new BackboardClient(apiKey));
    return initializer.ensureAssistantId({ apiKey, assistantId });
  },
  readStdin: readStdinContent
};

export function createMemoryCommandHandlers(
  dependencies: Partial<MemoryCommandHandlerDependencies> = {}
): Pick<CliCommandHandlers, "add" | "search" | "get" | "list" | "update" | "delete"> {
  const resolved: MemoryCommandHandlerDependencies = {
    ...defaultDependencies,
    ...dependencies
  };

  return {
    add: async (context) => addMemoryHandler(context, resolved),
    search: async (context) => searchMemoryHandler(context, resolved),
    get: async (context) => getMemoryHandler(context, resolved),
    list: async (context) => listMemoriesHandler(context, resolved),
    update: async (context) => updateMemoryHandler(context, resolved),
    delete: async (context) => deleteMemoryHandler(context, resolved)
  };
}

const addMemoryHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length > 1) {
    throw new CliUsageError("Usage: agent-memory add [content] [--format json]");
  }

  const contentFromArg = parsed.positionals[0];
  const content =
    typeof contentFromArg === "string" && contentFromArg.trim().length > 0
      ? contentFromArg
      : await readContentFromStdin(dependencies);
  if (content.length === 0) {
    throw new CliUsageError("No memory content provided. Pass content arg or stdin.");
  }

  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, true);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const created = await backboardClient.addMemory(assistantId, { content });
  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(created, null, 2)}\n`);
    return;
  }

  writeStdout("Memory added successfully\n");
  writeStdout(`ID: ${created.id}\n`);
};

const searchMemoryHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseSearchArgs(args);
  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, false);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const result = await backboardClient.searchMemory(assistantId, parsed.query, parsed.limit);

  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.memories.length === 0) {
    writeStdout("No matching memories found.\n");
    return;
  }

  writeStdout(`Found ${result.memories.length} memory result(s)\n`);
  for (const memory of result.memories) {
    const score =
      typeof memory.relevanceScore === "number" ? ` (relevance: ${memory.relevanceScore})` : "";
    writeStdout(`- ${memory.id}${score}\n`);
    writeStdout(`  ${memory.content}\n`);
  }
};

const getMemoryHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length !== 1) {
    throw new CliUsageError("Usage: agent-memory get <memory-id> [--format json]");
  }

  const memoryId = parsed.positionals[0];
  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, false);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const memory = await backboardClient.getMemory(assistantId, memoryId);

  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(memory, null, 2)}\n`);
    return;
  }

  writeStdout(`ID: ${memory.id}\n`);
  writeStdout(`Content: ${memory.content}\n`);
  writeStdout(`Created: ${memory.createdAt}\n`);
  if (memory.updatedAt) {
    writeStdout(`Updated: ${memory.updatedAt}\n`);
  }
};

const listMemoriesHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseListArgs(args);
  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, false);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const result = await backboardClient.listMemories(assistantId, parsed.page, parsed.pageSize);

  if (parsed.format === "json") {
    writeStdout(
      `${JSON.stringify(
        {
          page: parsed.page,
          pageSize: parsed.pageSize,
          totalCount: result.totalCount,
          memories: result.memories
        },
        null,
        2
      )}\n`
    );
    return;
  }

  if (result.memories.length === 0) {
    writeStdout("Memory bank is empty.\n");
    return;
  }

  writeStdout(`Memories (page ${parsed.page}, page size ${parsed.pageSize})\n`);
  for (const memory of result.memories) {
    writeStdout(`- ${memory.id}\n`);
    writeStdout(`  ${toPreview(memory.content)}\n`);
    writeStdout(`  Created: ${memory.createdAt}\n`);
  }
};

const updateMemoryHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length < 1 || parsed.positionals.length > 2) {
    throw new CliUsageError("Usage: agent-memory update <memory-id> [content] [--format json]");
  }

  const memoryId = parsed.positionals[0];
  if (memoryId.trim().length === 0) {
    throw new CliUsageError("Memory ID cannot be empty.");
  }
  const contentFromArg = parsed.positionals[1];
  const content =
    typeof contentFromArg === "string" && contentFromArg.trim().length > 0
      ? contentFromArg
      : await readContentFromStdin(dependencies);

  if (content.length === 0) {
    throw new CliUsageError("No update content provided. Pass content arg or stdin.");
  }

  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, false);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const updated = await backboardClient.updateMemory(assistantId, memoryId, { content });

  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(updated, null, 2)}\n`);
    return;
  }

  writeStdout("Memory updated successfully\n");
  writeStdout(`ID: ${updated.id}\n`);
};

const deleteMemoryHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: MemoryCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length !== 1) {
    throw new CliUsageError("Usage: agent-memory delete <memory-id> [--format json]");
  }

  const memoryId = parsed.positionals[0];
  const { apiKey, assistantId } = await resolveConfiguredIdentity(dependencies, cwd, false);
  const backboardClient = dependencies.createBackboardClient(apiKey);
  const deleted = await backboardClient.deleteMemory(assistantId, memoryId);

  if (parsed.format === "json") {
    writeStdout(
      `${JSON.stringify(
        { memoryId, deleted: deleted.deleted, operationId: deleted.operationId },
        null,
        2
      )}\n`
    );
    return;
  }

  writeStdout("Memory deleted successfully\n");
  writeStdout(`ID: ${memoryId}\n`);
  if (deleted.operationId) {
    writeStdout(`Operation ID: ${deleted.operationId}\n`);
  }
};

function parseFormatAndPositionals(args: string[]): {
  positionals: string[];
  format: OutputFormat;
} {
  let format: OutputFormat = "plain";
  const positionals: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--format") {
      const value = args[index + 1];
      if (value !== "json" && value !== "plain") {
        throw new CliUsageError("Invalid format. Supported values: plain, json.");
      }

      format = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new CliUsageError(`Unknown flag: ${arg}`);
    }

    positionals.push(arg);
  }

  return { positionals, format };
}

function parseSearchArgs(args: string[]): {
  query: string;
  limit: number;
  format: OutputFormat;
} {
  let limit = 10;
  let format: OutputFormat = "plain";
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--limit") {
      const value = args[index + 1];
      const numeric = parseStrictPositiveInt(value, "--limit");
      if (!Number.isFinite(numeric) || numeric <= 0) {
        throw new CliUsageError("Invalid limit value. `--limit` must be a positive integer.");
      }
      limit = numeric;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = args[index + 1];
      if (value !== "json" && value !== "plain") {
        throw new CliUsageError("Invalid format. Supported values: plain, json.");
      }
      format = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new CliUsageError(`Unknown flag: ${arg}`);
    }

    positionals.push(arg);
  }

  if (positionals.length !== 1) {
    throw new CliUsageError("Usage: agent-memory search <query> [--limit <n>] [--format json]");
  }

  const query = positionals[0].trim();
  if (query.length === 0) {
    throw new CliUsageError("Search query cannot be empty.");
  }

  return { query, limit, format };
}

function parseListArgs(args: string[]): { page: number; pageSize: number; format: OutputFormat } {
  let page = 1;
  let pageSize = 10;
  let format: OutputFormat = "plain";
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--page" || arg === "--page-size") {
      const value = args[index + 1];
      const numeric = parseStrictPositiveInt(value, arg);

      if (arg === "--page") {
        page = numeric;
      } else {
        pageSize = numeric;
      }
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = args[index + 1];
      if (value !== "json" && value !== "plain") {
        throw new CliUsageError("Invalid format. Supported values: plain, json.");
      }
      format = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new CliUsageError(`Unknown flag: ${arg}`);
    }

    throw new CliUsageError(
      "Usage: agent-memory list [--page <n>] [--page-size <n>] [--format json]"
    );
  }

  return { page, pageSize, format };
}

async function resolveConfiguredIdentity(
  dependencies: MemoryCommandHandlerDependencies,
  cwd: string,
  allowAutoCreate: boolean
): Promise<{ apiKey: string; assistantId: string }> {
  const configuration = dependencies.configurationResolver.resolve({ cwd });
  const apiKey = configuration.apiKey?.trim();
  let assistantId = configuration.assistantId?.trim();

  if (!apiKey) {
    throw new CliUsageError(
      "No API key configured. Use `agent-memory config set api-key <value>` or BACKBOARD_API_KEY."
    );
  }

  if (!assistantId) {
    if (!allowAutoCreate) {
      throw new CliUsageError(
        "No assistant ID configured. Use `agent-memory config set assistant-id <id>` or run `agent-memory add` first."
      );
    }

    assistantId = await dependencies.ensureAssistantId(apiKey, configuration.assistantId);
    dependencies.configurationWriter.write({ assistantId }, "global", cwd);
  }

  return { apiKey, assistantId };
}

async function readContentFromStdin(
  dependencies: Pick<MemoryCommandHandlerDependencies, "readStdin">
): Promise<string> {
  const raw = await dependencies.readStdin();
  if (raw.length === 0) {
    return "";
  }

  if (raw.endsWith("\r\n")) {
    return raw.slice(0, -2);
  }

  if (raw.endsWith("\n")) {
    return raw.slice(0, -1);
  }

  return raw;
}

async function readStdinContent(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
}

function toPreview(content: string): string {
  if (content.length <= 100) {
    return content;
  }

  return `${content.slice(0, 97)}...`;
}

function parseStrictPositiveInt(raw: string | undefined, flagName: string): number {
  if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) {
    if (flagName === "--limit") {
      throw new CliUsageError("Invalid limit value. `--limit` must be a positive integer.");
    }
    throw new CliUsageError(`Invalid ${flagName} value. Must be a positive integer.`);
  }

  return Number.parseInt(raw, 10);
}
