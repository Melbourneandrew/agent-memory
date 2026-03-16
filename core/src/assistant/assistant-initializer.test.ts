import { BackboardError, BackboardClient } from "../backboard";
import { ConfigurationValues } from "../config";
import {
  AssistantInitializer,
  DEFAULT_ASSISTANT_NAME,
  DEFAULT_ASSISTANT_SYSTEM_PROMPT
} from "./assistant-initializer";
import { InitializationError } from "./errors";

const createBackboardClientMock = (): jest.Mocked<Pick<BackboardClient, "createAssistant">> => ({
  createAssistant: jest.fn()
});

describe("AssistantInitializer", () => {
  it("returns existing assistant id when present", async () => {
    const backboardClient = createBackboardClientMock();
    const initializer = new AssistantInitializer(backboardClient as unknown as BackboardClient);

    const configuration: ConfigurationValues = {
      apiKey: "test-key",
      assistantId: "assistant_existing"
    };

    const assistantId = await initializer.ensureAssistantId(configuration);
    expect(assistantId).toBe("assistant_existing");
    expect(backboardClient.createAssistant).not.toHaveBeenCalled();
  });

  it("trims existing assistant id before returning", async () => {
    const backboardClient = createBackboardClientMock();
    const initializer = new AssistantInitializer(backboardClient as unknown as BackboardClient);

    const assistantId = await initializer.ensureAssistantId({
      apiKey: "test-key",
      assistantId: "  assistant_trimmed  "
    });

    expect(assistantId).toBe("assistant_trimmed");
    expect(backboardClient.createAssistant).not.toHaveBeenCalled();
  });

  it("creates assistant when id is missing", async () => {
    const backboardClient = createBackboardClientMock();
    backboardClient.createAssistant.mockResolvedValue({
      assistantId: "assistant_new",
      name: DEFAULT_ASSISTANT_NAME,
      systemPrompt: DEFAULT_ASSISTANT_SYSTEM_PROMPT,
      createdAt: new Date("2026-03-16T00:00:00Z")
    });

    const initializer = new AssistantInitializer(backboardClient as unknown as BackboardClient);
    const configuration: ConfigurationValues = {
      apiKey: "test-key",
      assistantId: null
    };

    const assistantId = await initializer.ensureAssistantId(configuration);
    expect(assistantId).toBe("assistant_new");
    expect(backboardClient.createAssistant).toHaveBeenCalledWith({
      name: DEFAULT_ASSISTANT_NAME,
      systemPrompt: DEFAULT_ASSISTANT_SYSTEM_PROMPT
    });
  });

  it("throws InitializationError with wrapped BackboardError", async () => {
    const backboardClient = createBackboardClientMock();
    const backboardError = new BackboardError({
      message: "Invalid API key",
      statusCode: 401,
      retryable: false,
      backboardCode: "unauthorized"
    });
    backboardClient.createAssistant.mockRejectedValue(backboardError);

    const initializer = new AssistantInitializer(backboardClient as unknown as BackboardClient);

    await expect(
      initializer.ensureAssistantId({
        apiKey: "test-key",
        assistantId: null
      })
    ).rejects.toMatchObject<Partial<InitializationError>>({
      name: "InitializationError",
      message: "Assistant initialization failed: Invalid API key",
      backboardError
    });
  });

  it("throws InitializationError for unexpected failures", async () => {
    const backboardClient = createBackboardClientMock();
    backboardClient.createAssistant.mockRejectedValue(new Error("unexpected"));
    const initializer = new AssistantInitializer(backboardClient as unknown as BackboardClient);

    await expect(
      initializer.ensureAssistantId({
        apiKey: "test-key",
        assistantId: null
      })
    ).rejects.toMatchObject<Partial<InitializationError>>({
      name: "InitializationError",
      message: "Assistant initialization failed."
    });
  });
});
