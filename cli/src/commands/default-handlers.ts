import type { CliCommandHandlers, CommandHandler } from "./types";
import { CliUsageError } from "../errors";
import { createConfigCommandHandlers } from "./config-command-handlers";
import { createMemoryCommandHandlers } from "./memory-command-handlers";

const notImplementedHandler: CommandHandler = async ({ command }) => {
  throw new CliUsageError(`Command \`${command}\` is not implemented yet.`);
};

const configHandlers = createConfigCommandHandlers();
const memoryHandlers = createMemoryCommandHandlers();

export const defaultCommandHandlers: CliCommandHandlers = {
  add: memoryHandlers.add,
  search: notImplementedHandler,
  get: memoryHandlers.get,
  list: notImplementedHandler,
  update: notImplementedHandler,
  delete: memoryHandlers.delete,
  configSet: configHandlers.configSet,
  configShow: configHandlers.configShow,
  configClear: configHandlers.configClear,
  stats: notImplementedHandler,
  status: notImplementedHandler,
  web: notImplementedHandler
};
