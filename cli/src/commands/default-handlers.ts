import type { CliCommandHandlers, CommandHandler } from "./types";
import { CliUsageError } from "../errors";
import { createConfigCommandHandlers } from "./config-command-handlers";

const notImplementedHandler: CommandHandler = async ({ command }) => {
  throw new CliUsageError(`Command \`${command}\` is not implemented yet.`);
};

const configHandlers = createConfigCommandHandlers();

export const defaultCommandHandlers: CliCommandHandlers = {
  add: notImplementedHandler,
  search: notImplementedHandler,
  get: notImplementedHandler,
  list: notImplementedHandler,
  update: notImplementedHandler,
  delete: notImplementedHandler,
  configSet: configHandlers.configSet,
  configShow: configHandlers.configShow,
  configClear: configHandlers.configClear,
  stats: notImplementedHandler,
  status: notImplementedHandler,
  web: notImplementedHandler
};
