import { BackboardClient, ConfigurationResolver } from "@agent-memory-cli/core";
import type { MemoryOperationStatus, MemoryStats } from "backboard-sdk";

import { CliUsageError } from "../errors";
import type { CliCommandHandlers, CommandHandler } from "./types";

type OutputFormat = "plain" | "json";

interface SystemCommandHandlerDependencies {
  readonly configurationResolver: ConfigurationResolver;
  readonly createBackboardClient: (
    apiKey: string
  ) => Pick<BackboardClient, "getStats" | "getOperationStatus">;
}

const defaultDependencies: SystemCommandHandlerDependencies = {
  configurationResolver: new ConfigurationResolver(),
  createBackboardClient: (apiKey) => new BackboardClient(apiKey)
};

export function createSystemCommandHandlers(
  dependencies: Partial<SystemCommandHandlerDependencies> = {}
): Pick<CliCommandHandlers, "stats" | "status"> {
  const resolved: SystemCommandHandlerDependencies = {
    ...defaultDependencies,
    ...dependencies
  };

  return {
    stats: async (context) => statsHandler(context, resolved),
    status: async (context) => statusHandler(context, resolved)
  };
}

const statsHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: SystemCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length > 0) {
    throw new CliUsageError("Usage: agent-memory stats [--format json]");
  }

  const { apiKey, assistantId } = resolveStatsIdentity(dependencies, cwd);
  const client = dependencies.createBackboardClient(apiKey);
  const stats = await client.getStats(assistantId);

  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(stats, null, 2)}\n`);
    return;
  }

  const totalMemories = stats.totalMemories;
  writeStdout(`Total memories: ${totalMemories}\n`);
  if (totalMemories === 0) {
    writeStdout("Memory bank is empty.\n");
  }

  if (typeof stats.lastUpdated === "string" && stats.lastUpdated.length > 0) {
    writeStdout(`lastUpdated: ${stats.lastUpdated}\n`);
  }
  if (typeof stats.limits !== "undefined") {
    writeStdout(`limits: ${JSON.stringify(stats.limits)}\n`);
  }
  for (const [key, value] of extractAdditionalStats(stats)) {
    writeStdout(`${key}: ${JSON.stringify(value)}\n`);
  }
};

const statusHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  dependencies: SystemCommandHandlerDependencies
): Promise<void> => {
  const parsed = parseFormatAndPositionals(args);
  if (parsed.positionals.length !== 1) {
    throw new CliUsageError("Usage: agent-memory status <operation-id> [--format json]");
  }

  const operationId = parsed.positionals[0].trim();
  if (operationId.length === 0) {
    throw new CliUsageError("Operation ID cannot be empty.");
  }

  const { apiKey } = resolveApiKey(dependencies, cwd);
  const client = dependencies.createBackboardClient(apiKey);
  const status = await client.getOperationStatus(operationId);

  if (parsed.format === "json") {
    writeStdout(`${JSON.stringify(status, null, 2)}\n`);
    return;
  }

  const resolvedOperationId = status.operationId || operationId;
  const state = status.status || "unknown";
  writeStdout(`Operation ID: ${resolvedOperationId}\n`);
  writeStdout(`Status: ${state}\n`);
  const details = extractStatusErrorDetails(status);
  if (state === "failed" && details) {
    writeStdout(`Error: ${details}\n`);
  }
  writeStatusDetails(writeStdout, status);
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

function resolveApiKey(
  dependencies: SystemCommandHandlerDependencies,
  cwd: string
): { apiKey: string; assistantId: string | null } {
  const configuration = dependencies.configurationResolver.resolve({ cwd });
  const apiKey = configuration.apiKey?.trim();
  if (!apiKey) {
    throw new CliUsageError(
      "No API key configured. Use `agent-memory config set api-key <value>` or BACKBOARD_API_KEY."
    );
  }

  return {
    apiKey,
    assistantId: configuration.assistantId?.trim() ?? null
  };
}

function resolveStatsIdentity(
  dependencies: SystemCommandHandlerDependencies,
  cwd: string
): { apiKey: string; assistantId: string } {
  const { apiKey, assistantId } = resolveApiKey(dependencies, cwd);
  if (!assistantId) {
    throw new CliUsageError(
      "No assistant ID configured. Use `agent-memory config set assistant-id <id>` or run `agent-memory add` first."
    );
  }

  return { apiKey, assistantId };
}

function writeStatusDetails(
  writeStdout: (value: string) => void,
  status: MemoryOperationStatus
): void {
  if (typeof status.resultCount === "number") {
    writeStdout(`Result count: ${status.resultCount}\n`);
  }
  if (Array.isArray(status.memoryIds) && status.memoryIds.length > 0) {
    writeStdout(`Memory IDs: ${status.memoryIds.join(", ")}\n`);
  }
  if (status.createdAt instanceof Date) {
    writeStdout(`Created: ${status.createdAt.toISOString()}\n`);
  }
  if (status.updatedAt instanceof Date) {
    writeStdout(`Updated: ${status.updatedAt.toISOString()}\n`);
  }
}

function extractAdditionalStats(stats: MemoryStats): Array<[string, unknown]> {
  const record = stats as unknown as Record<string, unknown>;
  return Object.entries(record).filter(
    ([key]) => key !== "totalMemories" && key !== "lastUpdated" && key !== "limits"
  );
}

function extractStatusErrorDetails(status: MemoryOperationStatus): string | undefined {
  const maybe = status as unknown as { error?: unknown; message?: unknown };
  if (typeof maybe.error === "string" && maybe.error.length > 0) {
    return maybe.error;
  }
  if (typeof maybe.message === "string" && maybe.message.length > 0) {
    return maybe.message;
  }
  return undefined;
}
