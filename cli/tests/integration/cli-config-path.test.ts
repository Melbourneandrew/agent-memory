import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FileSystemAdapter } from "@agent-memory/core";

import { createConfigCommandHandlers, type CliCommandHandlers } from "../../src/commands";
import { executeCliCommand } from "./helpers/command-harness";

describe("CLI config command handlers", () => {
  let tempRoot: string;
  let handlers: CliCommandHandlers;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), "agent-memory-config-tests-"));
    handlers = createHandlers(join(tempRoot, "global", "config.json"));
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  test("writes API key to global config by default", async () => {
    const projectCwd = join(tempRoot, "project-global");
    const globalPath = join(tempRoot, "global", "config.json");
    const result = await executeCliCommand(["config", "set", "api-key", "sk-test-1234"], {
      cwd: projectCwd,
      handlers
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain(`Saved api-key to ${globalPath}`);
    expect(readFileSync(globalPath, "utf-8")).toContain("\"api_key\": \"sk-test-1234\"");
  });

  test("writes assistant id to local config with --local and shows masked key", async () => {
    const projectCwd = join(tempRoot, "project-local");
    const localPath = join(projectCwd, ".agent-memory", "config.json");

    const setApi = await executeCliCommand(
      ["config", "set", "api-key", "sk-local-abcde1234", "--local"],
      { cwd: projectCwd, handlers }
    );
    const setAssistant = await executeCliCommand(
      ["config", "set", "assistant-id", "asst_123", "--local"],
      { cwd: projectCwd, handlers }
    );
    const showLocal = await executeCliCommand(["config", "show", "--local"], {
      cwd: projectCwd,
      handlers
    });

    expect(setApi.exitCode).toBe(0);
    expect(setAssistant.exitCode).toBe(0);
    expect(showLocal.exitCode).toBe(0);
    expect(showLocal.stdout).toContain("Source: local");
    expect(showLocal.stdout).toContain("api-key: ••••••••1234");
    expect(showLocal.stdout).toContain("assistant-id: asst_123");
    expect(existsSync(localPath)).toBe(true);
  });

  test("clears local config and reports when already missing", async () => {
    const projectCwd = join(tempRoot, "project-clear");
    const localPath = join(projectCwd, ".agent-memory", "config.json");

    await executeCliCommand(["config", "set", "api-key", "sk-clear-0000", "--local"], {
      cwd: projectCwd,
      handlers
    });

    const firstClear = await executeCliCommand(["config", "clear", "--local"], {
      cwd: projectCwd,
      handlers
    });
    const secondClear = await executeCliCommand(["config", "clear", "--local"], {
      cwd: projectCwd,
      handlers
    });

    expect(firstClear.exitCode).toBe(0);
    expect(firstClear.stdout).toContain(`Cleared configuration file at ${localPath}`);
    expect(secondClear.exitCode).toBe(0);
    expect(secondClear.stdout).toContain(`No configuration found to clear at ${localPath}`);
  });

  test("fails on invalid config invocations", async () => {
    const projectCwd = join(tempRoot, "project-invalid");
    const missingSubcommand = await executeCliCommand(["config"], { cwd: projectCwd, handlers });
    const missingSetValue = await executeCliCommand(["config", "set", "api-key"], {
      cwd: projectCwd,
      handlers
    });
    const conflictingFlags = await executeCliCommand(
      ["config", "show", "--global", "--local"],
      { cwd: projectCwd, handlers }
    );

    expect(missingSubcommand.exitCode).toBe(1);
    expect(missingSubcommand.stderr).toContain("Missing config subcommand");
    expect(missingSetValue.exitCode).toBe(1);
    expect(missingSetValue.stderr).toContain("Usage: agent-memory config set");
    expect(conflictingFlags.exitCode).toBe(1);
    expect(conflictingFlags.stderr).toContain("Cannot combine --global and --local");
  });
});

class TestFileSystemAdapter extends FileSystemAdapter {
  constructor(private readonly globalPath: string) {
    super();
  }

  public override getGlobalConfigPath(): string {
    return this.globalPath;
  }
}

function createHandlers(globalPath: string): CliCommandHandlers {
  const configHandlers = createConfigCommandHandlers(new TestFileSystemAdapter(globalPath));
  const noop = async (): Promise<void> => undefined;

  return {
    add: noop,
    search: noop,
    get: noop,
    list: noop,
    update: noop,
    delete: noop,
    configSet: configHandlers.configSet,
    configShow: configHandlers.configShow,
    configClear: configHandlers.configClear,
    stats: noop,
    status: noop,
    web: noop
  };
}
