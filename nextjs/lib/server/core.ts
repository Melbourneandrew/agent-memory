import "server-only";

import { BackboardClient, ConfigurationResolver, type ConfigurationValues } from "@agent-memory/core";

const configurationResolver = new ConfigurationResolver();

export function resolveServerConfiguration(cwd = process.cwd()): ConfigurationValues {
  return configurationResolver.resolve({ cwd });
}

export function createServerBackboardClient(cwd = process.cwd()): BackboardClient {
  const configuration = resolveServerConfiguration(cwd);
  if (!configuration.apiKey) {
    throw new Error("No API key configured for server-side Backboard operations.");
  }

  return new BackboardClient(configuration.apiKey);
}

