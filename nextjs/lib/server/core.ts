import "server-only";

import {
  AssistantInitializer,
  BackboardClient,
  ConfigurationResolver,
  ConfigurationWriter,
  type ConfigurationValues
} from "@agent-memory/core";

const configurationResolver = new ConfigurationResolver();
const configurationWriter = new ConfigurationWriter();
const assistantInitializationByCwd = new Map<
  string,
  Promise<{ assistantId: string; created: boolean }>
>();

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

export async function ensureServerAssistantId(
  cwd = process.cwd()
): Promise<{ assistantId: string; created: boolean }> {
  const configuration = resolveServerConfiguration(cwd);
  if (!configuration.apiKey) {
    throw new Error("No API key configured for server-side Backboard operations.");
  }

  const existingAssistantId = configuration.assistantId?.trim();
  if (existingAssistantId) {
    return { assistantId: existingAssistantId, created: false };
  }

  const existingInitialization = assistantInitializationByCwd.get(cwd);
  if (existingInitialization) {
    return existingInitialization;
  }

  const initialization = createAndPersistAssistantId(cwd, configuration.apiKey);
  assistantInitializationByCwd.set(cwd, initialization);

  try {
    return await initialization;
  } finally {
    assistantInitializationByCwd.delete(cwd);
  }
}

async function createAndPersistAssistantId(
  cwd: string,
  apiKey: string
): Promise<{ assistantId: string; created: boolean }> {
  const refreshed = resolveServerConfiguration(cwd);
  const existingAssistantId = refreshed.assistantId?.trim();
  if (existingAssistantId) {
    return { assistantId: existingAssistantId, created: false };
  }

  const client = new BackboardClient(apiKey);
  const initializer = new AssistantInitializer(client);
  const assistantId = await initializer.createAssistantId();
  configurationWriter.write({ assistantId }, "auto", cwd);
  return { assistantId, created: true };
}

