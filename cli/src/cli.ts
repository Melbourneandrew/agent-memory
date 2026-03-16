import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { BackboardError } from "@agent-memory/core";

import { defaultCommandHandlers, type CliCommandHandlers, HELP_TEXT } from "./commands";
import { CliUsageError } from "./errors";

export interface CliRuntime {
  readonly stdout: NodeJS.WriteStream;
  readonly stderr: NodeJS.WriteStream;
  readonly cwd: string;
}

const defaultRuntime: CliRuntime = {
  stdout: process.stdout,
  stderr: process.stderr,
  cwd: process.cwd()
};

export async function runCli(
  args: string[],
  runtime: CliRuntime = defaultRuntime,
  handlers: CliCommandHandlers = defaultCommandHandlers
): Promise<number> {
  const writeStdout = (value: string): void => {
    runtime.stdout.write(value);
  };
  const writeStderr = (value: string): void => {
    runtime.stderr.write(value);
  };

  try {
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
      writeStdout(`${HELP_TEXT}\n`);
      return 0;
    }

    if (args[0] === "--version" || args[0] === "-v") {
      writeStdout(`${readPackageVersion()}\n`);
      return 0;
    }

    await dispatchCommand(args, handlers, writeStdout, writeStderr, runtime.cwd);
    return 0;
  } catch (error) {
    return handleCliError(error, writeStderr);
  }
}

function readPackageVersion(): string {
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8")) as {
    version?: string;
  };
  return packageJson.version ?? "0.0.0";
}

async function dispatchCommand(
  args: string[],
  handlers: CliCommandHandlers,
  writeStdout: (value: string) => void,
  writeStderr: (value: string) => void,
  cwd: string
): Promise<void> {
  const [command, ...commandArgs] = args;

  if (command === "config") {
    await dispatchConfigSubcommand(commandArgs, handlers, writeStdout, writeStderr, cwd);
    return;
  }

  if (command === "add") {
    await handlers.add({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "search") {
    requirePositional(commandArgs, "search", "<query>");
    await handlers.search({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "get") {
    requirePositional(commandArgs, "get", "<memory-id>");
    await handlers.get({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "list") {
    await handlers.list({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "update") {
    requirePositionals(commandArgs, "update", ["<memory-id>", "<content>"]);
    await handlers.update({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "delete") {
    requirePositional(commandArgs, "delete", "<memory-id>");
    await handlers.delete({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "stats") {
    requireNoPositionals(commandArgs, "stats");
    await handlers.stats({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "status") {
    requireNoPositionals(commandArgs, "status");
    await handlers.status({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  if (command === "web") {
    await handlers.web({ command, args: commandArgs, cwd, writeStdout, writeStderr });
    return;
  }

  throw new CliUsageError(`Unknown command: ${command}\nRun \`agent-memory --help\` for available commands.`);
}

async function dispatchConfigSubcommand(
  args: string[],
  handlers: CliCommandHandlers,
  writeStdout: (value: string) => void,
  writeStderr: (value: string) => void,
  cwd: string
): Promise<void> {
  if (args.length === 0) {
    throw new CliUsageError("Missing config subcommand. Use: config set|show|clear");
  }

  const [subcommand, ...subcommandArgs] = args;

  if (subcommand === "set") {
    await handlers.configSet({
      command: "config set",
      args: subcommandArgs,
      cwd,
      writeStdout,
      writeStderr
    });
    return;
  }

  if (subcommand === "show") {
    await handlers.configShow({
      command: "config show",
      args: subcommandArgs,
      cwd,
      writeStdout,
      writeStderr
    });
    return;
  }

  if (subcommand === "clear") {
    await handlers.configClear({
      command: "config clear",
      args: subcommandArgs,
      cwd,
      writeStdout,
      writeStderr
    });
    return;
  }

  throw new CliUsageError(`Unknown config subcommand: ${subcommand}`);
}

function requirePositional(args: string[], command: string, usage: string): void {
  if (args.length < 1 || args[0].trim().length === 0) {
    throw new CliUsageError(`Missing required argument for \`${command}\`: ${usage}`);
  }
}

function requirePositionals(args: string[], command: string, usageItems: string[]): void {
  if (args.length < usageItems.length) {
    throw new CliUsageError(
      `Missing required argument(s) for \`${command}\`: ${usageItems.join(" ")}`
    );
  }

  const hasEmptyValue = args.slice(0, usageItems.length).some((value) => value.trim().length === 0);
  if (hasEmptyValue) {
    throw new CliUsageError(`Invalid empty argument for \`${command}\`.`);
  }
}

function requireNoPositionals(args: string[], command: string): void {
  if (args.length > 0) {
    throw new CliUsageError(`Unexpected argument(s) for \`${command}\`.`);
  }
}

function handleCliError(error: unknown, writeStderr: (value: string) => void): number {
  if (error instanceof CliUsageError) {
    writeStderr(`${error.message}\n`);
    return 1;
  }

  if (error instanceof BackboardError) {
    writeStderr(`${error.message}\n`);
    return 2;
  }

  if (isNetworkError(error)) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    writeStderr(`${message}\n`);
    return 3;
  }

  const message = error instanceof Error ? error.message : "Unexpected CLI error.";
  writeStderr(`${message}\n`);
  return 1;
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

  const networkMessagePatterns = [
    /fetch/i,
    /network/i,
    /timeout/i,
    /econn/i,
    /enotfound/i,
    /socket/i
  ];
  return networkMessagePatterns.some((pattern) => pattern.test(error.message));
}
