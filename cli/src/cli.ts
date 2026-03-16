import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { HELP_TEXT, runPing } from "./commands";
import { resolveGlobalConfigPath, resolveLocalConfigPath } from "./utils/config-paths";

export interface CliRuntime {
  readonly stdout: NodeJS.WriteStream;
  readonly stderr: NodeJS.WriteStream;
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
}

const defaultRuntime: CliRuntime = {
  stdout: process.stdout,
  stderr: process.stderr,
  cwd: process.cwd(),
  env: process.env
};

export async function runCli(args: string[], runtime: CliRuntime = defaultRuntime): Promise<number> {
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    runtime.stdout.write(`${HELP_TEXT}\n`);
    return 0;
  }

  if (args[0] === "--version" || args[0] === "-v") {
    runtime.stdout.write(`${readPackageVersion()}\n`);
    return 0;
  }

  if (args[0] === "config-path") {
    const localPath = resolveLocalConfigPath(runtime.cwd);
    const globalPath = resolveGlobalConfigPath(runtime.env);
    runtime.stdout.write(`local: ${localPath}\n`);
    runtime.stdout.write(`global: ${globalPath}\n`);
    return 0;
  }

  if (args[0] === "ping") {
    const endpointResolution = getPingEndpoint(args.slice(1), runtime.env);
    if (endpointResolution.error !== undefined) {
      runtime.stderr.write(`${endpointResolution.error}\n`);
      return 1;
    }

    try {
      const status = await runPing(endpointResolution.endpoint);
      runtime.stdout.write(`Backboard connectivity OK (${status})\n`);
      return 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown network error.";
      runtime.stderr.write(`Backboard connectivity failed: ${message}\n`);
      return 3;
    }
  }

  runtime.stderr.write(`Unknown command: ${args[0]}\n`);
  runtime.stderr.write("Run `agent-memory --help` for available commands.\n");
  return 1;
}

function getPingEndpoint(
  args: string[],
  env: NodeJS.ProcessEnv
): { endpoint: string; error?: string } {
  const endpointIndex = args.findIndex((token) => token === "--endpoint");
  if (endpointIndex >= 0) {
    const value = args[endpointIndex + 1];
    if (typeof value === "string" && value.length > 0) {
      return { endpoint: value };
    }

    return { endpoint: "", error: "Missing value for --endpoint." };
  }

  const base = env.BACKBOARD_BASE_URL ?? "https://api.backboard.dev";
  return { endpoint: `${base.replace(/\/$/, "")}/health` };
}

function readPackageVersion(): string {
  const packageJson = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8")) as {
    version?: string;
  };
  return packageJson.version ?? "0.0.0";
}
