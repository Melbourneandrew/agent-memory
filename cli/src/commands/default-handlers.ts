import type { CliCommandHandlers, CommandHandler } from "./types";
import { CliUsageError } from "../errors";

const notImplementedHandler: CommandHandler = async ({ command }) => {
  throw new CliUsageError(`Command \`${command}\` is not implemented yet.`);
};

export const defaultCommandHandlers: CliCommandHandlers = {
  add: notImplementedHandler,
  search: notImplementedHandler,
  get: notImplementedHandler,
  list: notImplementedHandler,
  update: notImplementedHandler,
  delete: notImplementedHandler,
  configSet: notImplementedHandler,
  configShow: notImplementedHandler,
  configClear: notImplementedHandler,
  stats: notImplementedHandler,
  status: notImplementedHandler,
  web: notImplementedHandler
};
