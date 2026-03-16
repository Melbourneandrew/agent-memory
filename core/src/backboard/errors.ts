import type { BackboardErrorShape } from "./types";

export class BackboardError extends Error implements BackboardErrorShape {
  public readonly statusCode?: number;
  public readonly backboardCode?: string;
  public readonly retryable: boolean;

  constructor({
    message,
    statusCode,
    backboardCode,
    retryable
  }: {
    message: string;
    statusCode?: number;
    backboardCode?: string;
    retryable: boolean;
  }) {
    super(message);
    this.name = "BackboardError";
    this.statusCode = statusCode;
    this.backboardCode = backboardCode;
    this.retryable = retryable;
  }
}
