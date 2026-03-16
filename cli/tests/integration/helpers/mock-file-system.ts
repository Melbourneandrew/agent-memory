import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export interface MockFileSystem {
  readonly root: string;
  readonly env: NodeJS.ProcessEnv;
  cleanup(): void;
}

export function createMockFileSystem(): MockFileSystem {
  const root = mkdtempSync(join(tmpdir(), "agent-memory-cli-test-"));
  const homePath = join(root, "home");
  const appDataPath = join(root, "appdata");

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HOME: homePath,
    USERPROFILE: homePath,
    APPDATA: appDataPath,
    XDG_CONFIG_HOME: join(root, "xdg")
  };

  return {
    root,
    env,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    }
  };
}
