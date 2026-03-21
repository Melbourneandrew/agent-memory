import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join, resolve } from "node:path";

import { ConfigurationResolver } from "@agent-memory-cli/core";

import { CliUsageError } from "../errors";
import type { CliCommandHandlers, CommandHandler } from "./types";

const DEFAULT_WEB_PORT = 8090;
const READY_TIMEOUT_MS = 15000;
const READY_CHECK_INTERVAL_MS = 250;

export interface WebCommandDependencies {
  readonly configurationResolver: Pick<ConfigurationResolver, "resolve">;
  readonly checkPortAvailability: (port: number) => Promise<PortAvailabilityResult>;
  readonly resolveWebAppDirectory: (cwd: string) => string;
  readonly resolveNextBinPath: (cwd: string) => string;
  readonly fileExists: (path: string) => boolean;
  readonly spawnProcess: (
    command: string,
    args: string[],
    options: {
      cwd: string;
      env: NodeJS.ProcessEnv;
      stdio: ["ignore", "pipe", "pipe"];
    }
  ) => ChildProcess;
  readonly waitForServerReady: (url: string, timeoutMs: number) => Promise<void>;
  readonly openBrowser: (url: string, platform: NodeJS.Platform) => Promise<void>;
  readonly platform: NodeJS.Platform;
}

const defaultDependencies: WebCommandDependencies = {
  configurationResolver: new ConfigurationResolver(),
  checkPortAvailability,
  resolveWebAppDirectory,
  resolveNextBinPath,
  fileExists: existsSync,
  spawnProcess: (command, args, options) => spawn(command, args, options),
  waitForServerReady,
  openBrowser,
  platform: process.platform
};

export function createWebCommandHandler(
  dependencies: Partial<WebCommandDependencies> = {}
): Pick<CliCommandHandlers, "web"> {
  const resolved: WebCommandDependencies = {
    ...defaultDependencies,
    ...dependencies
  };

  return {
    web: async (context) => webHandler(context, resolved)
  };
}

async function webHandler(
  { args, cwd, writeStdout, writeStderr }: Parameters<CommandHandler>[0],
  dependencies: WebCommandDependencies
): Promise<void> {
  const port = parseWebPort(args);
  const configuration = dependencies.configurationResolver.resolve({ cwd });
  if (!configuration.apiKey?.trim()) {
    throw new CliUsageError(
      "No API key configured. Use `agent-memory config set api-key <value>` before launching the web UI."
    );
  }

  const portStatus = await dependencies.checkPortAvailability(port);
  if (!portStatus.available) {
    if (portStatus.errorCode === "EADDRINUSE") {
      throw new CliUsageError(
        `Port ${port} is already in use. Try \`agent-memory web --port <n>\`.`
      );
    }
    if (portStatus.errorCode === "EACCES") {
      throw new CliUsageError(
        `Permission denied when binding port ${port}. Try a higher port such as 8090.`
      );
    }
    if (portStatus.errorCode === "EADDRNOTAVAIL") {
      throw new CliUsageError(`Address 127.0.0.1 is not available on this machine.`);
    }
    throw new CliUsageError(`Could not bind port ${port}. Try \`agent-memory web --port <n>\`.`);
  }

  const appDirectory = dependencies.resolveWebAppDirectory(cwd);
  const nextBinPath = dependencies.resolveNextBinPath(cwd);
  assertWebUiBuilt(appDirectory, dependencies.fileExists);
  const url = `http://localhost:${port}`;

  writeStdout(`Starting Agent Memory web UI at ${url}...\n`);
  const child = dependencies.spawnProcess(
    process.execPath,
    [nextBinPath, "start", appDirectory, "--port", String(port), "--hostname", "127.0.0.1"],
    {
      cwd: appDirectory,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  child.stdout?.on("data", (chunk) => {
    writeStdout(Buffer.isBuffer(chunk) ? chunk.toString("utf-8") : String(chunk));
  });
  child.stderr?.on("data", (chunk) => {
    writeStderr(Buffer.isBuffer(chunk) ? chunk.toString("utf-8") : String(chunk));
  });

  const startupExit = waitForProcessExit(child);
  await waitForStartup(url, child, startupExit, dependencies.waitForServerReady);
  try {
    await dependencies.openBrowser(url, dependencies.platform);
    writeStdout(`Opened browser at ${url}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown browser launch error.";
    writeStderr(`Could not open browser automatically (${message}). Open ${url} manually.\n`);
  }

  await waitForChildProcess(child, writeStdout);
}

function parseWebPort(args: string[]): number {
  let port = DEFAULT_WEB_PORT;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--port") {
      const raw = args[index + 1];
      if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) {
        throw new CliUsageError("Invalid --port value. Must be an integer between 1 and 65535.");
      }
      port = Number.parseInt(raw, 10);
      if (port < 1 || port > 65535) {
        throw new CliUsageError("Invalid --port value. Must be an integer between 1 and 65535.");
      }
      index += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new CliUsageError(`Unknown flag: ${arg}`);
    }

    throw new CliUsageError("Usage: agent-memory web [--port <n>]");
  }

  return port;
}

function assertWebUiBuilt(appDirectory: string, fileExists: (path: string) => boolean): void {
  const buildIdPath = join(appDirectory, ".next", "BUILD_ID");
  if (!fileExists(buildIdPath)) {
    throw new CliUsageError(
      "Web UI has no production build (missing nextjs/.next/BUILD_ID). " +
        "From this repository run `npm run build` before `agent-memory web`, or use `npm run dev --workspace @agent-memory/nextjs` while developing the UI. " +
        "The published npm package includes a prebuilt .next from CI; reinstall if files are missing."
    );
  }
}

async function waitForChildProcess(
  child: ChildProcess,
  writeStdout: (value: string) => void
): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    if (child.exitCode === 0 || child.signalCode === "SIGINT" || child.signalCode === "SIGTERM") {
      return;
    }
    throw new Error(`Web server exited unexpectedly (code: ${child.exitCode ?? "null"}).`);
  }

  await new Promise<void>((resolvePromise, rejectPromise) => {
    let shuttingDown = false;
    const onSignal = (): void => {
      shuttingDown = true;
      writeStdout("Shutting down web UI...\n");
      child.kill("SIGINT");
    };

    const cleanup = (): void => {
      process.off("SIGINT", onSignal);
      process.off("SIGTERM", onSignal);
    };

    process.on("SIGINT", onSignal);
    process.on("SIGTERM", onSignal);

    child.on("error", (error) => {
      cleanup();
      rejectPromise(error);
    });

    child.on("exit", (code, signal) => {
      cleanup();
      if (shuttingDown || signal === "SIGINT" || signal === "SIGTERM" || code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(new Error(`Web server exited unexpectedly (code: ${code ?? "null"}).`));
    });
  });
}

interface PortAvailabilityResult {
  readonly available: boolean;
  readonly errorCode?: string;
}

interface ProcessExitResult {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}

async function checkPortAvailability(port: number): Promise<PortAvailabilityResult> {
  return new Promise<PortAvailabilityResult>((resolvePromise) => {
    const server = createServer();

    server.once("error", (error: NodeJS.ErrnoException) => {
      resolvePromise({
        available: false,
        errorCode: typeof error.code === "string" ? error.code : undefined
      });
    });

    server.once("listening", () => {
      server.close(() =>
        resolvePromise({
          available: true
        })
      );
    });

    server.listen(port, "127.0.0.1");
  });
}

function resolveWebAppDirectory(cwd: string): string {
  const candidates = [
    resolve(cwd, "nextjs"),
    // Bundled CLI (single file in cli/dist): __dirname is cli/dist
    resolve(__dirname, "..", "..", "nextjs"),
    // Unbundled / tests: __dirname is cli/dist/commands
    resolve(__dirname, "..", "..", "..", "nextjs")
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const normalized = resolve(candidate);
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    if (existsSync(join(normalized, "package.json"))) {
      return normalized;
    }
  }

  throw new CliUsageError("Could not locate bundled Next.js web UI assets.");
}

function resolveNextBinPath(cwd: string): string {
  try {
    return require.resolve("next/dist/bin/next", {
      paths: [cwd, resolve(cwd, ".."), resolve(cwd, "..", "..")]
    });
  } catch {
    throw new CliUsageError("Next.js runtime is not available. Reinstall the CLI package.");
  }
}

async function waitForServerReady(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok || response.status >= 300) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await sleep(READY_CHECK_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for web server at ${url}.`);
}

async function waitForStartup(
  url: string,
  child: ChildProcess,
  startupExit: Promise<ProcessExitResult>,
  waitForReady: (url: string, timeoutMs: number) => Promise<void>
): Promise<void> {
  try {
    await Promise.race([
      waitForReady(url, READY_TIMEOUT_MS),
      startupExit.then((result) => {
        throw new Error(
          `Web server exited before becoming ready (code: ${result.code ?? "null"}, signal: ${result.signal ?? "none"}).`
        );
      })
    ]);
  } catch (error) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill("SIGINT");
      await startupExit.catch(() => undefined);
    }
    throw error;
  }
}

function waitForProcessExit(child: ChildProcess): Promise<ProcessExitResult> {
  return new Promise<ProcessExitResult>((resolvePromise, rejectPromise) => {
    child.once("error", (error) => {
      rejectPromise(error);
    });
    child.once("exit", (code, signal) => {
      resolvePromise({
        code,
        signal
      });
    });
  });
}

async function openBrowser(url: string, platform: NodeJS.Platform): Promise<void> {
  const opener =
    platform === "darwin"
      ? { command: "open", args: [url] }
      : platform === "win32"
        ? { command: "cmd", args: ["/c", "start", "", url] }
        : { command: "xdg-open", args: [url] };

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const openerProcess = spawn(opener.command, opener.args, {
      stdio: "ignore",
      detached: true
    });
    openerProcess.once("error", rejectPromise);
    openerProcess.once("spawn", () => {
      openerProcess.unref();
      resolvePromise();
    });
  });
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}
