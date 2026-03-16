import type { Assistant, MemoryOperationStatus, MemoryStats } from "backboard-sdk";

import type { MemoryRecord } from "../types";

export interface BackboardErrorShape {
  message: string;
  statusCode?: number;
  backboardCode?: string;
  retryable: boolean;
}

export interface BackboardClientOptions {
  baseUrl?: string;
  timeout?: number;
  sdkClient?: BackboardSdkClient;
  sdkFactory?: (options: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }) => Promise<BackboardSdkClient>;
}

export interface AddMemoryInput {
  content: string;
  metadata?: unknown;
}

export interface SearchMemoryResult {
  memories: MemoryRecord[];
  totalCount?: number;
}

export interface CreateAssistantInput {
  name: string;
  systemPrompt: string;
  description?: string;
}

export interface BackboardSdkClient {
  addMemory(assistantId: string, input: AddMemoryInput): Promise<unknown>;
  searchMemories(assistantId: string, query: string, limit?: number): Promise<unknown>;
  getMemory(assistantId: string, memoryId: string): Promise<unknown>;
  getMemories(
    assistantId: string,
    page?: number,
    pageSize?: number
  ): Promise<{ memories?: unknown[]; totalCount?: number } | unknown>;
  updateMemory(assistantId: string, memoryId: string, input: AddMemoryInput): Promise<unknown>;
  deleteMemory(assistantId: string, memoryId: string): Promise<unknown>;
  createAssistant(input: {
    name: string;
    description?: string;
    system_prompt: string;
  }): Promise<Assistant>;
  getMemoryStats(assistantId: string): Promise<MemoryStats>;
  getMemoryOperationStatus(operationId: string): Promise<MemoryOperationStatus>;
}
