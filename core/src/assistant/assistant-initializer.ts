import { BackboardClient, BackboardError } from "../backboard";
import type { ConfigurationValues } from "../config";
import { InitializationError } from "./errors";

export const DEFAULT_ASSISTANT_NAME = "agent-memory-cli";
export const DEFAULT_ASSISTANT_SYSTEM_PROMPT =
  "You are an assistant that stores and retrieves user-provided facts in persistent memory.";

export class AssistantInitializer {
  constructor(private readonly backboardClient: BackboardClient) {}

  public async ensureAssistantId(configuration: ConfigurationValues): Promise<string> {
    const existingAssistantId = configuration.assistantId?.trim();
    if (existingAssistantId) {
      return existingAssistantId;
    }

    return this.createAssistantId();
  }

  public async createAssistantId(): Promise<string> {
    try {
      const response = await this.backboardClient.createAssistant({
        name: DEFAULT_ASSISTANT_NAME,
        systemPrompt: DEFAULT_ASSISTANT_SYSTEM_PROMPT
      });
      return response.assistantId;
    } catch (error) {
      const backboardError = error instanceof BackboardError ? error : undefined;
      const message = backboardError
        ? `Assistant initialization failed: ${backboardError.message}`
        : "Assistant initialization failed.";
      throw new InitializationError(message, {
        cause: error,
        backboardError
      });
    }
  }
}
