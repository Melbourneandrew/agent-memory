import { BackboardError } from "../backboard";

export class InitializationError extends Error {
  public readonly cause?: unknown;
  public readonly backboardError?: BackboardError;

  constructor(message: string, options?: { cause?: unknown; backboardError?: BackboardError }) {
    super(message);
    this.name = "InitializationError";
    this.cause = options?.cause;
    this.backboardError = options?.backboardError;
  }
}
