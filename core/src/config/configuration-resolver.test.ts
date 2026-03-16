import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ConfigurationReader } from "./configuration-reader";
import { ConfigurationResolver } from "./configuration-resolver";
import { FileSystemAdapter } from "./file-system-adapter";

class TestFileSystemAdapter extends FileSystemAdapter {
  constructor(
    private readonly root: string,
    private readonly globalPath: string
  ) {
    super();
  }

  public override getGlobalConfigPath(): string {
    return this.globalPath;
  }

  public override getLocalConfigPath(cwd = this.root): string {
    return join(cwd, ".agent-memory", "config.json");
  }
}

describe("ConfigurationResolver", () => {
  let testDir: string;
  let globalConfigPath: string;
  let adapter: TestFileSystemAdapter;
  let resolver: ConfigurationResolver;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "agent-memory-config-resolver-"));
    globalConfigPath = join(testDir, "global-config.json");
    adapter = new TestFileSystemAdapter(testDir, globalConfigPath);
    resolver = new ConfigurationResolver(new ConfigurationReader(adapter), adapter);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("resolves values with priority cli > env > local > global", () => {
    writeFileSync(
      globalConfigPath,
      JSON.stringify({ apiKey: "global-key", assistantId: "global-assistant" })
    );
    const localPath = adapter.getLocalConfigPath(testDir);
    mkdirSync(join(testDir, ".agent-memory"), { recursive: true });
    writeFileSync(
      localPath,
      JSON.stringify({ apiKey: "local-key", assistantId: "local-assistant" })
    );

    const resolved = resolver.resolve({
      cwd: testDir,
      env: {
        BACKBOARD_API_KEY: "env-key",
        BACKBOARD_ASSISTANT_ID: "env-assistant"
      } as NodeJS.ProcessEnv,
      cliOverrides: {
        assistantId: "cli-assistant"
      }
    });

    expect(resolved).toEqual({
      apiKey: "env-key",
      assistantId: "cli-assistant"
    });
  });

  it("returns null values when no source provides configuration", () => {
    const resolved = resolver.resolve({ cwd: testDir, env: {} as NodeJS.ProcessEnv });
    expect(resolved).toEqual({ apiKey: null, assistantId: null });
  });

  it("throws clear error when configuration JSON is invalid", () => {
    writeFileSync(globalConfigPath, "{invalid-json");
    expect(() => resolver.resolve({ cwd: testDir, env: {} as NodeJS.ProcessEnv })).toThrow(
      "Configuration file is invalid JSON"
    );
  });
});
