import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { ConfigurationError } from "./errors";
import { ConfigurationValues } from "./types";

export class FileSystemAdapter {
  public getGlobalConfigPath(): string {
    if (process.platform === "win32") {
      const appData = process.env.APPDATA ?? join(homedir(), "AppData", "Roaming");
      return join(appData, "agent-memory", "config.json");
    }

    return join(homedir(), ".config", "agent-memory", "config.json");
  }

  public getLocalConfigPath(cwd = process.cwd()): string {
    return join(cwd, ".agent-memory", "config.json");
  }

  public exists(path: string): boolean {
    return existsSync(path);
  }

  public readConfiguration(path: string): ConfigurationValues {
    if (!this.exists(path)) {
      return { apiKey: null, assistantId: null };
    }

    try {
      const rawContent = readFileSync(path, "utf-8");
      if (rawContent.trim().length === 0) {
        return { apiKey: null, assistantId: null };
      }

      const parsed = JSON.parse(rawContent) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new ConfigurationError(`Configuration file must contain a JSON object: ${path}`);
      }

      const apiKey = parsed.api_key ?? parsed.apiKey;
      const assistantId = parsed.assistant_id ?? parsed.assistantId;
      return {
        apiKey: typeof apiKey === "string" ? apiKey : null,
        assistantId: typeof assistantId === "string" ? assistantId : null
      };
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new ConfigurationError(`Configuration file is invalid JSON: ${path}`, error);
      }

      throw new ConfigurationError(`Failed to read configuration file: ${path}`, error);
    }
  }

  public writeConfiguration(path: string, values: ConfigurationValues): void {
    this.ensureParentDirectory(path);
    const tempPath = `${path}.tmp-${process.pid}-${Date.now()}`;

    try {
      const normalized = {
        ...(values.apiKey !== null ? { api_key: values.apiKey } : {}),
        ...(values.assistantId !== null ? { assistant_id: values.assistantId } : {})
      };
      writeFileSync(tempPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf-8");
      if (process.platform !== "win32") {
        chmodSync(tempPath, 0o600);
      }
      renameSync(tempPath, path);
    } catch (error) {
      if (this.exists(tempPath)) {
        rmSync(tempPath, { force: true });
      }
      throw new ConfigurationError(`Failed to write configuration file: ${path}`, error);
    }
  }

  public deleteFile(path: string): boolean {
    if (!this.exists(path)) {
      return false;
    }

    try {
      rmSync(path);
      return true;
    } catch (error) {
      throw new ConfigurationError(`Failed to delete configuration file: ${path}`, error);
    }
  }

  private ensureParentDirectory(path: string): void {
    try {
      mkdirSync(dirname(path), { recursive: true });
    } catch (error) {
      throw new ConfigurationError(`Failed to create configuration directory for: ${path}`, error);
    }
  }
}
