import { ConfigurationWriter } from "./configuration-writer";
import { ConfigurationError } from "./errors";
import { FileSystemAdapter } from "./file-system-adapter";

class ThrowingWriteAdapter extends FileSystemAdapter {
  public override getGlobalConfigPath(): string {
    return "/tmp/global-config.json";
  }

  public override getLocalConfigPath(): string {
    return "/tmp/local-config.json";
  }

  public override readConfiguration(): { apiKey: string | null; assistantId: string | null } {
    return { apiKey: null, assistantId: null };
  }

  public override writeConfiguration(): void {
    throw new ConfigurationError("disk full");
  }
}

describe("ConfigurationWriter error handling", () => {
  it("propagates write failures as ConfigurationError", () => {
    const writer = new ConfigurationWriter(new ThrowingWriteAdapter());
    expect(() => writer.write({ apiKey: "abc" }, "global", "/tmp")).toThrow("disk full");
  });
});
