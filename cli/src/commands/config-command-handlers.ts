import {
  ConfigurationReader,
  ConfigurationWriter,
  FileSystemAdapter,
  type ConfigurationTarget
} from "@agent-memory-cli/core";

import { CliUsageError } from "../errors";
import type { CommandHandler } from "./types";

interface ConfigHandlerDependencies {
  readonly reader: ConfigurationReader;
  readonly writer: ConfigurationWriter;
}

export function createConfigCommandHandlers(
  fileSystem: FileSystemAdapter = new FileSystemAdapter()
): Pick<import("./types").CliCommandHandlers, "configSet" | "configShow" | "configClear"> {
  const dependencies: ConfigHandlerDependencies = {
    reader: new ConfigurationReader(fileSystem),
    writer: new ConfigurationWriter(fileSystem)
  };

  return {
    configSet: async (context) => configSetHandler(context, dependencies),
    configShow: async (context) => configShowHandler(context, dependencies),
    configClear: async (context) => configClearHandler(context, dependencies)
  };
}

const configSetHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  { writer }: ConfigHandlerDependencies
): Promise<void> => {
  const parsed = parseArgsAndTarget(args);
  if (parsed.positionals.length !== 2) {
    throw new CliUsageError(
      "Usage: agent-memory config set <api-key|assistant-id> <value> [--global|--local]"
    );
  }

  const [key, value] = parsed.positionals;
  if (value.trim().length === 0) {
    throw new CliUsageError("Configuration value cannot be empty.");
  }

  if (key === "api-key") {
    const result = writer.write({ apiKey: value }, parsed.target, cwd);
    writeStdout(`Saved api-key to ${result.path}\n`);
    return;
  }

  if (key === "assistant-id") {
    const result = writer.write({ assistantId: value }, parsed.target, cwd);
    writeStdout(`Saved assistant-id to ${result.path}\n`);
    return;
  }

  throw new CliUsageError("Unknown config key. Supported keys: api-key, assistant-id.");
};

const configShowHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  { reader }: ConfigHandlerDependencies
): Promise<void> => {
  const parsed = parseArgsAndTarget(args);
  if (parsed.positionals.length > 0) {
    throw new CliUsageError("Usage: agent-memory config show [--global|--local]");
  }

  const result = reader.read(parsed.target, cwd);
  if (result.source === "none") {
    if (parsed.target === "local" || parsed.target === "global") {
      writeStdout(`No ${parsed.target} configuration found at ${result.path}\n`);
      return;
    }

    writeStdout("No configuration found.\n");
    return;
  }

  const display = reader.formatForDisplay(result.values);
  writeStdout(`Source: ${result.source}\n`);
  writeStdout(`Path: ${result.path}\n`);
  writeStdout(`api-key: ${display.apiKey}\n`);
  writeStdout(`assistant-id: ${display.assistantId ?? "(not set)"}\n`);
};

const configClearHandler = async (
  { args, cwd, writeStdout }: Parameters<CommandHandler>[0],
  { writer }: ConfigHandlerDependencies
): Promise<void> => {
  const parsed = parseArgsAndTarget(args);
  if (parsed.positionals.length > 0) {
    throw new CliUsageError("Usage: agent-memory config clear [--global|--local]");
  }

  const result = writer.clear(parsed.target, cwd);
  if (result.deleted) {
    writeStdout(`Cleared configuration file at ${result.path}\n`);
    return;
  }

  writeStdout(`No configuration found to clear at ${result.path}\n`);
};

function parseArgsAndTarget(args: string[]): {
  positionals: string[];
  target: ConfigurationTarget;
} {
  const positionals: string[] = [];
  let target: ConfigurationTarget = "auto";

  for (const arg of args) {
    if (arg === "--global") {
      if (target === "local") {
        throw new CliUsageError("Cannot combine --global and --local.");
      }
      target = "global";
      continue;
    }

    if (arg === "--local") {
      if (target === "global") {
        throw new CliUsageError("Cannot combine --global and --local.");
      }
      target = "local";
      continue;
    }

    positionals.push(arg);
  }

  return { positionals, target };
}
