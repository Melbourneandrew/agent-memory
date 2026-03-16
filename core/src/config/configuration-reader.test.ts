import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ConfigurationReader } from "./configuration-reader";
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

describe("ConfigurationReader", () => {
  let testDir: string;
  let globalConfigPath: string;
  let adapter: TestFileSystemAdapter;
  let reader: ConfigurationReader;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "agent-memory-config-reader-"));
    globalConfigPath = join(testDir, "global-config.json");
    adapter = new TestFileSystemAdapter(testDir, globalConfigPath);
    reader = new ConfigurationReader(adapter);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("returns local config in auto mode when local file exists", () => {
    const localConfigPath = adapter.getLocalConfigPath(testDir);
    mkdirSync(join(testDir, ".agent-memory"), { recursive: true });
    writeFileSync(
      localConfigPath,
      JSON.stringify({ apiKey: "local-key", assistantId: "local-assistant" })
    );
    writeFileSync(
      globalConfigPath,
      JSON.stringify({ apiKey: "global-key", assistantId: "global-assistant" })
    );

    const result = reader.read("auto", testDir);
    expect(result.source).toBe("local");
    expect(result.values).toEqual({ apiKey: "local-key", assistantId: "local-assistant" });
  });

  it("returns global config in auto mode when local file does not exist", () => {
    writeFileSync(
      globalConfigPath,
      JSON.stringify({ apiKey: "global-key", assistantId: "global-assistant" })
    );

    const result = reader.read("auto", testDir);
    expect(result.source).toBe("global");
    expect(result.values).toEqual({ apiKey: "global-key", assistantId: "global-assistant" });
  });

  it("masks API keys for display output", () => {
    expect(reader.maskApiKey("bb_12345678abcd")).toBe("••••••••abcd");
    expect(reader.maskApiKey("abc")).toBe("••••••••");
    expect(reader.maskApiKey(null)).toBe("••••••••");
  });
});
