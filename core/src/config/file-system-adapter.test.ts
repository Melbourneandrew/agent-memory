import { mkdtempSync, rmSync } from "node:fs";
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
});
