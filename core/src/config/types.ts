export interface ConfigurationValues {
  apiKey: string | null;
  assistantId: string | null;
}

export interface PartialConfigurationValues {
  apiKey?: string | null;
  assistantId?: string | null;
}

export type ConfigurationTarget = "global" | "local" | "auto";

export interface ConfigurationReadResult {
  values: ConfigurationValues;
  source: "global" | "local" | "none";
  path: string | null;
}
