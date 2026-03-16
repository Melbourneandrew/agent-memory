import { homedir } from "node:os";
import { join } from "node:path";

export function resolveGlobalConfigPath(env: NodeJS.ProcessEnv): string {
  if (process.platform === "win32") {
    const appData = env.APPDATA;
    if (typeof appData === "string" && appData.length > 0) {
      return join(appData, "agent-memory", "config.json");
    }

    return join(homedir(), "AppData", "Roaming", "agent-memory", "config.json");
  }

  const xdgConfigHome = env.XDG_CONFIG_HOME;
  if (typeof xdgConfigHome === "string" && xdgConfigHome.length > 0) {
    return join(xdgConfigHome, "agent-memory", "config.json");
  }

  return join(homedir(), ".config", "agent-memory", "config.json");
}

export function resolveLocalConfigPath(cwd: string): string {
  return join(cwd, ".agent-memory", "config.json");
}
