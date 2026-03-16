import type { CliCommandHandlers } from "./types";
import { createConfigCommandHandlers } from "./config-command-handlers";
import { createMemoryCommandHandlers } from "./memory-command-handlers";
import { createSystemCommandHandlers } from "./system-command-handlers";
import { createWebCommandHandler } from "./web-command-handler";

const configHandlers = createConfigCommandHandlers();
const memoryHandlers = createMemoryCommandHandlers();
const systemHandlers = createSystemCommandHandlers();
const webHandler = createWebCommandHandler();

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
  web: webHandler.web
};
