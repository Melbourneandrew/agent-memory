import { ConfigurationReader } from "./configuration-reader";
import { FileSystemAdapter } from "./file-system-adapter";
import { ConfigurationValues, PartialConfigurationValues } from "./types";

export interface ResolveConfigurationOptions {
  cwd?: string;
  cliOverrides?: PartialConfigurationValues;
  env?: NodeJS.ProcessEnv;
}

export class ConfigurationResolver {
  constructor(
    private readonly reader: ConfigurationReader = new ConfigurationReader(),
    private readonly fileSystem: FileSystemAdapter = new FileSystemAdapter()
  ) {}

  public resolve(options: ResolveConfigurationOptions = {}): ConfigurationValues {
    const cwd = options.cwd ?? process.cwd();
    const env = options.env ?? process.env;
    const cliOverrides = options.cliOverrides ?? {};

    const globalPath = this.fileSystem.getGlobalConfigPath();
    const localPath = this.fileSystem.getLocalConfigPath(cwd);

    const globalConfig = this.fileSystem.exists(globalPath)
      ? this.reader.read("global", cwd).values
      : { apiKey: null, assistantId: null };
    const localConfig = this.fileSystem.exists(localPath)
      ? this.reader.read("local", cwd).values
      : { apiKey: null, assistantId: null };

    return {
      apiKey:
        cliOverrides.apiKey ?? env.BACKBOARD_API_KEY ?? localConfig.apiKey ?? globalConfig.apiKey,
      assistantId:
        cliOverrides.assistantId ??
        env.BACKBOARD_ASSISTANT_ID ??
        localConfig.assistantId ??
        globalConfig.assistantId
    };
  }
}
