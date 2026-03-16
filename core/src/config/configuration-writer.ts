import { FileSystemAdapter } from "./file-system-adapter";
import { ConfigurationTarget, ConfigurationValues, PartialConfigurationValues } from "./types";

export class ConfigurationWriter {
  constructor(private readonly fileSystem: FileSystemAdapter = new FileSystemAdapter()) {}

  public write(
    updates: PartialConfigurationValues,
    target: ConfigurationTarget = "auto",
    cwd = process.cwd()
  ): { path: string; values: ConfigurationValues } {
    const path = this.resolveTargetPath(target, cwd);
    const existing = this.fileSystem.readConfiguration(path);
    const merged: ConfigurationValues = {
      apiKey: Object.prototype.hasOwnProperty.call(updates, "apiKey")
        ? this.normalizeValue(updates.apiKey)
        : existing.apiKey,
      assistantId: Object.prototype.hasOwnProperty.call(updates, "assistantId")
        ? this.normalizeValue(updates.assistantId)
        : existing.assistantId
    };

    this.fileSystem.writeConfiguration(path, merged);
    return { path, values: merged };
  }

  public clear(
    target: ConfigurationTarget = "auto",
    cwd = process.cwd()
  ): { path: string; deleted: boolean } {
    const path = this.resolveTargetPath(target, cwd);
    const deleted = this.fileSystem.deleteFile(path);
    return { path, deleted };
  }

  private resolveTargetPath(target: ConfigurationTarget, cwd: string): string {
    if (target === "global") {
      return this.fileSystem.getGlobalConfigPath();
    }

    if (target === "local") {
      return this.fileSystem.getLocalConfigPath(cwd);
    }

    const localPath = this.fileSystem.getLocalConfigPath(cwd);
    if (this.fileSystem.exists(localPath)) {
      return localPath;
    }

    return this.fileSystem.getGlobalConfigPath();
  }

  private normalizeValue(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
