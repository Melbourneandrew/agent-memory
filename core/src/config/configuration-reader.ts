import { FileSystemAdapter } from "./file-system-adapter";
import { ConfigurationReadResult, ConfigurationTarget, ConfigurationValues } from "./types";

export class ConfigurationReader {
  constructor(private readonly fileSystem: FileSystemAdapter = new FileSystemAdapter()) {}

  public read(target: ConfigurationTarget = "auto", cwd = process.cwd()): ConfigurationReadResult {
    if (target === "global") {
      const path = this.fileSystem.getGlobalConfigPath();
      return {
        values: this.fileSystem.readConfiguration(path),
        source: "global",
        path
      };
    }

    if (target === "local") {
      const path = this.fileSystem.getLocalConfigPath(cwd);
      return {
        values: this.fileSystem.readConfiguration(path),
        source: this.fileSystem.exists(path) ? "local" : "none",
        path
      };
    }

    const localPath = this.fileSystem.getLocalConfigPath(cwd);
    if (this.fileSystem.exists(localPath)) {
      return {
        values: this.fileSystem.readConfiguration(localPath),
        source: "local",
        path: localPath
      };
    }

    const globalPath = this.fileSystem.getGlobalConfigPath();
    if (this.fileSystem.exists(globalPath)) {
      return {
        values: this.fileSystem.readConfiguration(globalPath),
        source: "global",
        path: globalPath
      };
    }

    return {
      values: { apiKey: null, assistantId: null },
      source: "none",
      path: null
    };
  }

  public maskApiKey(apiKey: string | null): string {
    if (!apiKey) {
      return "••••••••";
    }

    if (apiKey.length <= 4) {
      return "••••••••";
    }

    return `••••••••${apiKey.slice(-4)}`;
  }

  public formatForDisplay(values: ConfigurationValues): ConfigurationValues {
    return {
      apiKey: this.maskApiKey(values.apiKey),
      assistantId: values.assistantId
    };
  }
}
