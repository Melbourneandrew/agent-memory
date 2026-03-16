import { join } from "node:path";

import { executeCliCommand } from "./helpers/command-harness";
import { createMockFileSystem } from "./helpers/mock-file-system";

describe("CLI config-path command", () => {
  test("prints local and global config paths derived from runtime context", async () => {
    const mockFs = createMockFileSystem();
    const cwd = join(mockFs.root, "project");

    try {
      const result = await executeCliCommand(["config-path"], {
        cwd,
        env: mockFs.env
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(`local: ${join(cwd, ".agent-memory", "config.json")}`);
      expect(result.stdout).toContain(
        `global: ${join(mockFs.env.XDG_CONFIG_HOME as string, "agent-memory", "config.json")}`
      );
      expect(result.stderr).toBe("");
    } finally {
      mockFs.cleanup();
    }
  });
});
