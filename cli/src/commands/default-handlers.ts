import type { CliCommandHandlers, CommandHandler } from "./types";
import { CliUsageError } from "../errors";
import { createConfigCommandHandlers } from "./config-command-handlers";
import { createMemoryCommandHandlers } from "./memory-command-handlers";
import { createSystemCommandHandlers } from "./system-command-handlers";

const notImplementedHandler: CommandHandler = async ({ command }) => {
  throw new CliUsageError(`Command \`${command}\` is not implemented yet.`);
};

const configHandlers = createConfigCommandHandlers();
const memoryHandlers = createMemoryCommandHandlers();
const systemHandlers = createSystemCommandHandlers();

export const defaultCommandHandlers: CliCommandHandlers = {
  add: memoryHandlers.add,
  search: memoryHandlers.search,
  get: memoryHandlers.get,
  list: memoryHandlers.list,
  update: memoryHandlers.update,
  delete: memoryHandlers.delete,
  configSet: configHandlers.configSet,
  configShow: configHandlers.configShow,
  configClear: configHandlers.configClear,
  stats: systemHandlers.stats,
  status: systemHandlers.status,
  web: notImplementedHandler
};
