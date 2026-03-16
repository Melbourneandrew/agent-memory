export const HELP_TEXT = `agent-memory <command> [options]

Global flags:
  --help, -h         Show help information
  --version, -v      Show CLI version

Commands:
  add <content>                  Add a memory
  search <query>                 Search memories
  get <memory-id>                Get a memory by ID
  list [--page <n>]              List memories
  update <memory-id> <content>   Update a memory
  delete <memory-id>             Delete a memory
  config set <key> <value>       Set configuration value
  config show                    Show effective configuration
  config clear                    Clear configuration file
  stats                          Show memory statistics
  status                         Show operation status
  web [--port <n>]               Launch web UI
`;
