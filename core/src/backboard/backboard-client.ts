import type {
  BackboardClient as SdkBackboardClient,
  Memory,
  MemoryOperationStatus,
  MemoryStats
} from "backboard-sdk";

import type { MemoryRecord } from "../types";
import { BackboardError } from "./errors";
import type {
  AddMemoryInput,
  BackboardClientOptions,
  BackboardSdkClient,
  CreateAssistantInput,
  SearchMemoryResult
} from "./types";

type BackboardSdkModule = {
  BackboardClient: new (options: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }) => SdkBackboardClient;
};

const dynamicImportBackboardSdk = new Function("modulePath", "return import(modulePath)") as (
  modulePath: string
) => Promise<BackboardSdkModule>;

export class BackboardClient {
  private readonly sdkClient?: BackboardSdkClient;
  private sdkClientPromise?: Promise<BackboardSdkClient>;

  constructor(
    private readonly apiKey: string,
    private readonly options: BackboardClientOptions = {}
  ) {
    this.sdkClient = options.sdkClient;
  }

  public async addMemory(assistantId: string, input: AddMemoryInput): Promise<MemoryRecord> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = await client.addMemory(assistantId, input);
      return this.toMemoryRecord(response);
    });
  }

  public async searchMemory(
    assistantId: string,
    query: string,
    limit = 10
  ): Promise<SearchMemoryResult> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = (await client.searchMemories(assistantId, query, limit)) as {
        memories?: unknown[];
        totalCount?: number;
      };
      return {
        memories: (response.memories ?? []).map((memory) => this.toMemoryRecord(memory)),
        totalCount: response.totalCount
      };
    });
  }

  public async getMemory(assistantId: string, memoryId: string): Promise<MemoryRecord> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = await client.getMemory(assistantId, memoryId);
      return this.toMemoryRecord(response);
    });
  }

  public async listMemories(assistantId: string): Promise<SearchMemoryResult> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = (await client.getMemories(assistantId)) as {
        memories?: unknown[];
        totalCount?: number;
      };
      return {
        memories: (response.memories ?? []).map((memory) => this.toMemoryRecord(memory)),
        totalCount: response.totalCount
      };
    });
  }

  public async updateMemory(
    assistantId: string,
    memoryId: string,
    input: AddMemoryInput
  ): Promise<MemoryRecord> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = await client.updateMemory(assistantId, memoryId, input);
      return this.toMemoryRecord(response);
    });
  }

  public async deleteMemory(
    assistantId: string,
    memoryId: string
  ): Promise<{ deleted: boolean; operationId?: string }> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = (await client.deleteMemory(assistantId, memoryId)) as {
        operationId?: string;
      };

      return {
        deleted: true,
        operationId: response.operationId
      };
    });
  }

  public async createAssistant(input: CreateAssistantInput): Promise<{
    assistantId: string;
    name: string;
    systemPrompt?: string;
    createdAt: Date;
  }> {
    return this.execute(async () => {
      const client = await this.getClient();
      const response = await client.createAssistant({
        name: input.name,
        description: input.description,
        system_prompt: input.systemPrompt
      });

      return {
        assistantId: response.assistantId,
        name: response.name,
        systemPrompt: response.systemPrompt,
        createdAt: response.createdAt
      };
    });
  }

  public async getStats(assistantId: string): Promise<MemoryStats> {
    return this.execute(async () => {
      const client = await this.getClient();
      return client.getMemoryStats(assistantId);
    });
  }

  public async getOperationStatus(operationId: string): Promise<MemoryOperationStatus> {
    return this.execute(async () => {
      const client = await this.getClient();
      return client.getMemoryOperationStatus(operationId);
    });
  }

  private async getClient(): Promise<BackboardSdkClient> {
    if (this.sdkClient) {
      return this.sdkClient;
    }

    if (!this.sdkClientPromise) {
      this.sdkClientPromise = this.createSdkClient();
    }

    return this.sdkClientPromise;
  }

  private async createSdkClient(): Promise<BackboardSdkClient> {
    if (this.options.sdkFactory) {
      return this.options.sdkFactory({
        apiKey: this.apiKey,
        baseUrl: this.options.baseUrl,
        timeout: this.options.timeout
      });
    }

    const sdkModule = await dynamicImportBackboardSdk("backboard-sdk");
    return new sdkModule.BackboardClient({
      apiKey: this.apiKey,
      baseUrl: this.options.baseUrl,
      timeout: this.options.timeout
    });
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw await this.normalizeError(error);
    }
  }

  private async normalizeError(error: unknown): Promise<BackboardError> {
    const asRecord = this.isRecord(error) ? error : {};
    const statusCode = typeof asRecord.statusCode === "number" ? asRecord.statusCode : undefined;
    const message =
      typeof asRecord.message === "string" && asRecord.message.length > 0
        ? asRecord.message
        : typeof error === "string" && error.length > 0
          ? error
          : "Backboard request failed.";
    const backboardCode =
      (await this.extractBackboardCode(asRecord)) ??
      (typeof asRecord.name === "string" ? asRecord.name : undefined);

    return new BackboardError({
      message,
      statusCode,
      backboardCode,
      retryable: this.isRetryable(statusCode, asRecord)
    });
  }

  private async extractBackboardCode(error: Record<string, unknown>): Promise<string | undefined> {
    const response = error.response as
      | { clone?: () => { json?: () => Promise<unknown> } }
      | undefined;
    if (!response || typeof response.clone !== "function") {
      return undefined;
    }

    try {
      const responseData = await response.clone().json?.();
      const responseRecord = responseData as Record<string, unknown> | undefined;
      const directCode = responseRecord?.code;
      if (typeof directCode === "string" && directCode.length > 0) {
        return directCode;
      }

      const nestedCode = (responseRecord?.error as Record<string, unknown> | undefined)?.code;
      if (typeof nestedCode === "string" && nestedCode.length > 0) {
        return nestedCode;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  private isRetryable(statusCode: number | undefined, error: Record<string, unknown>): boolean {
    if (statusCode === 429 || (typeof statusCode === "number" && statusCode >= 500)) {
      return true;
    }

    if (typeof statusCode === "number" && statusCode >= 400) {
      return false;
    }

    const errorName = typeof error.name === "string" ? error.name : "";
    return errorName === "TypeError" || errorName === "AbortError";
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private toMemoryRecord(payload: unknown): MemoryRecord {
    const memory = payload as Partial<Memory> & Record<string, unknown>;
    const id = typeof memory.id === "string" ? memory.id : "";
    const content = typeof memory.content === "string" ? memory.content : "";
    const createdAt = typeof memory.createdAt === "string" ? memory.createdAt : "";
    const updatedAt = typeof memory.updatedAt === "string" ? memory.updatedAt : undefined;
    const relevanceScore = typeof memory.score === "number" ? memory.score : undefined;

    return {
      id,
      content,
      createdAt,
      ...(updatedAt ? { updatedAt } : {}),
      ...(typeof relevanceScore === "number" ? { relevanceScore } : {})
    };
  }
}
