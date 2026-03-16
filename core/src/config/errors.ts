export class ConfigurationError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ConfigurationError";
    this.cause = cause;
  }
}
