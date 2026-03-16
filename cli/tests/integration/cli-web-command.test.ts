import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";

import type { CliCommandHandlers } from "../../src/commands";
import { createWebCommandHandler } from "../../src/commands";
import { executeCliCommand } from "./helpers/command-harness";

class FakeChildProcess extends EventEmitter {
  public readonly stdout = new PassThrough();
  public readonly stderr = new PassThrough();
  public exitCode: number | null = null;
  public signalCode: NodeJS.Signals | null = null;
  public readonly kill = jest.fn(() => true);

  public emitExit(code: number | null, signal: NodeJS.Signals | null): void {
    this.exitCode = code;
    this.signalCode = signal;
    this.emit("exit", code, signal);
  }
}

function buildHandlers(web: CliCommandHandlers["web"]): CliCommandHandlers {
  return {
    add: async () => undefined,
    search: async () => undefined,
    get: async () => undefined,
    list: async () => undefined,
    update: async () => undefined,
    delete: async () => undefined,
    configSet: async () => undefined,
    configShow: async () => undefined,
    configClear: async () => undefined,
    stats: async () => undefined,
    status: async () => undefined,
    web
  };
}

describe("CLI web command", () => {
  test("launches web server and opens browser", async () => {
    const spawnMock = jest.fn(() => {
      const child = new FakeChildProcess();
      setTimeout(() => {
        child.stdout.write("ready\n");
        child.emitExit(0, null);
      }, 10);
      return child as unknown as ChildProcess;
    });
    const openBrowser = jest.fn(async () => undefined);
    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: "sk_test", assistantId: null })
      },
      checkPortAvailability: async () => ({ available: true }),
      resolveWebAppDirectory: () => "/tmp/nextjs",
      resolveNextBinPath: () => "/tmp/next-bin.js",
      fileExists: () => false,
      spawnProcess: spawnMock,
      waitForServerReady: async () => undefined,
      openBrowser,
      platform: "darwin"
    }).web;

    const result = await executeCliCommand(["web", "--port", "4100"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Starting Agent Memory web UI at http://localhost:4100 (dev mode)");
    expect(result.stdout).toContain("Opened browser at http://localhost:4100");
    expect(openBrowser).toHaveBeenCalledWith("http://localhost:4100", "darwin");
    expect(spawnMock).toHaveBeenCalled();
  });

  test("fails when api key is missing", async () => {
    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: null, assistantId: null })
      }
    }).web;

    const result = await executeCliCommand(["web"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No API key configured");
  });

  test("fails when requested port is already in use", async () => {
    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: "sk_test", assistantId: null })
      },
      checkPortAvailability: async () => ({ available: false, errorCode: "EADDRINUSE" })
    }).web;

    const result = await executeCliCommand(["web", "--port", "8090"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Port 8090 is already in use");
  });

  test("rejects invalid port values", async () => {
    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: "sk_test", assistantId: null })
      }
    }).web;

    const result = await executeCliCommand(["web", "--port", "abc"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("between 1 and 65535");
  });

  test("kills server when startup readiness fails", async () => {
    const child = new FakeChildProcess();
    child.kill.mockImplementation(() => {
      setImmediate(() => {
        child.emitExit(null, "SIGINT");
      });
      return true;
    });
    const spawnMock = jest.fn(() => child as unknown as ChildProcess);
    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: "sk_test", assistantId: null })
      },
      checkPortAvailability: async () => ({ available: true }),
      resolveWebAppDirectory: () => "/tmp/nextjs",
      resolveNextBinPath: () => "/tmp/next-bin.js",
      fileExists: () => false,
      spawnProcess: spawnMock,
      waitForServerReady: async () => {
        throw new Error("Timed out waiting for web server.");
      },
      openBrowser: async () => undefined,
      platform: "darwin"
    }).web;

    const result = await executeCliCommand(["web"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Timed out waiting for web server");
    expect(child.kill).toHaveBeenCalledWith("SIGINT");
  });

  test("fails fast when server exits before readiness", async () => {
    const spawnMock = jest.fn(() => {
      const child = new FakeChildProcess();
      setImmediate(() => {
        child.emitExit(1, null);
      });
      return child as unknown as ChildProcess;
    });

    const webHandler = createWebCommandHandler({
      configurationResolver: {
        resolve: () => ({ apiKey: "sk_test", assistantId: null })
      },
      checkPortAvailability: async () => ({ available: true }),
      resolveWebAppDirectory: () => "/tmp/nextjs",
      resolveNextBinPath: () => "/tmp/next-bin.js",
      fileExists: () => false,
      spawnProcess: spawnMock,
      waitForServerReady: async () =>
        new Promise<void>((resolvePromise) => {
          setTimeout(resolvePromise, 1000);
        }),
      openBrowser: async () => undefined,
      platform: "darwin"
    }).web;

    const result = await executeCliCommand(["web"], {
      handlers: buildHandlers(webHandler)
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("exited before becoming ready");
  });
});
