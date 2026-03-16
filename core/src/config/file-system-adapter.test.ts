import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FileSystemAdapter } from "./file-system-adapter";

describe("FileSystemAdapter", () => {
  let testDir: string;
  let adapter: FileSystemAdapter;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "agent-memory-fs-adapter-"));
    adapter = new FileSystemAdapter();
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("writes, reads, and deletes configuration files", () => {
    const path = join(testDir, "nested", "config.json");

    adapter.writeConfiguration(path, {
      apiKey: "test-key",
      assistantId: "assistant-1"
    });

    expect(adapter.exists(path)).toBe(true);
    const storedRaw = JSON.parse(readFileSync(path, "utf-8")) as Record<string, string>;
    expect(storedRaw).toEqual({
      api_key: "test-key",
      assistant_id: "assistant-1"
    });
    expect(adapter.readConfiguration(path)).toEqual({
      apiKey: "test-key",
      assistantId: "assistant-1"
    });

    expect(adapter.deleteFile(path)).toBe(true);
    expect(adapter.exists(path)).toBe(false);
  });

  it("returns empty configuration for missing files", () => {
    expect(adapter.readConfiguration(join(testDir, "missing.json"))).toEqual({
      apiKey: null,
      assistantId: null
    });
  });

  it("parses legacy camelCase keys for compatibility", () => {
    const path = join(testDir, "legacy-config.json");
    writeFileSync(path, JSON.stringify({ apiKey: "legacy-key", assistantId: "legacy-assistant" }));

    expect(adapter.readConfiguration(path)).toEqual({
      apiKey: "legacy-key",
      assistantId: "legacy-assistant"
    });
  });

  it("throws clear error for invalid JSON", () => {
    const path = join(testDir, "invalid.json");
    writeFileSync(path, "{ this is not json }");

    expect(() => adapter.readConfiguration(path)).toThrow("Configuration file is invalid JSON");
  });

  it("does not leave temporary files after atomic write", () => {
    const path = join(testDir, "atomic", "config.json");
    adapter.writeConfiguration(path, { apiKey: "atomic-key", assistantId: null });

    const dirEntries = readdirSync(join(testDir, "atomic"));
    expect(dirEntries).toEqual(["config.json"]);
  });

  it("applies restrictive permissions on unix-like systems", () => {
    if (process.platform === "win32") {
      return;
    }

    const path = join(testDir, "perms", "config.json");
    adapter.writeConfiguration(path, { apiKey: "secret", assistantId: null });
    const mode = statSync(path).mode & 0o777;
    expect(mode).toBe(0o600);
  });
});
