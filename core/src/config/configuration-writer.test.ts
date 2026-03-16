import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FileSystemAdapter } from "./file-system-adapter";
import { ConfigurationWriter } from "./configuration-writer";

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

describe("ConfigurationWriter", () => {
  let testDir: string;
  let globalConfigPath: string;
  let adapter: TestFileSystemAdapter;
  let writer: ConfigurationWriter;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "agent-memory-config-writer-"));
    globalConfigPath = join(testDir, "global-config.json");
    adapter = new TestFileSystemAdapter(testDir, globalConfigPath);
    writer = new ConfigurationWriter(adapter);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("writes to global config by default when local config is absent", () => {
    const result = writer.write({ apiKey: "global-key" }, "auto", testDir);

    expect(result.path).toBe(globalConfigPath);
    expect(existsSync(globalConfigPath)).toBe(true);
    const stored = JSON.parse(readFileSync(globalConfigPath, "utf-8")) as Record<string, string>;
    expect(stored.apiKey).toBe("global-key");
  });

  it("writes to local config by default when local config already exists", () => {
    writer.write({ assistantId: "seed" }, "local", testDir);

    const result = writer.write({ apiKey: "local-key" }, "auto", testDir);
    const localPath = adapter.getLocalConfigPath(testDir);
    expect(result.path).toBe(localPath);
    const stored = JSON.parse(readFileSync(localPath, "utf-8")) as Record<string, string>;
    expect(stored.apiKey).toBe("local-key");
    expect(stored.assistantId).toBe("seed");
  });

  it("clears targeted configuration files", () => {
    writer.write({ apiKey: "delete-me" }, "global", testDir);
    const result = writer.clear("global", testDir);
    expect(result.deleted).toBe(true);
    expect(existsSync(result.path)).toBe(false);
  });

  it("normalizes empty string updates to null", () => {
    writer.write({ apiKey: "seed-key", assistantId: "seed-assistant" }, "global", testDir);
    const result = writer.write({ apiKey: "   " }, "global", testDir);
    expect(result.values.apiKey).toBeNull();

    const stored = JSON.parse(readFileSync(globalConfigPath, "utf-8")) as Record<string, string>;
    expect(stored.apiKey).toBeUndefined();
    expect(stored.assistantId).toBe("seed-assistant");
  });
});
