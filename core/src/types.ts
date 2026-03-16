export interface MemoryRecord {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  relevanceScore?: number;
}

export interface RuntimeConfiguration {
  apiKey?: string;
  assistantId?: string;
}
