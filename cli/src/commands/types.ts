export interface CommandHandlerContext {
  readonly command: string;
  readonly args: string[];
  readonly writeStdout: (value: string) => void;
  readonly writeStderr: (value: string) => void;
}

export type CommandHandler = (context: CommandHandlerContext) => Promise<void>;

export interface CliCommandHandlers {
  readonly add: CommandHandler;
  readonly search: CommandHandler;
  readonly get: CommandHandler;
  readonly list: CommandHandler;
  readonly update: CommandHandler;
  readonly delete: CommandHandler;
  readonly configSet: CommandHandler;
  readonly configShow: CommandHandler;
  readonly configClear: CommandHandler;
  readonly stats: CommandHandler;
  readonly status: CommandHandler;
  readonly web: CommandHandler;
}
