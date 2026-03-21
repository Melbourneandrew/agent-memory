export const HELP_TEXT = `agent-memory <command> [options]

Global flags:
  --help, -h         Show help information
  --version, -v      Show CLI version

Commands:
  add [content] [--format plain|json]         Add a memory (or read from stdin)
  search <query> [--limit <n>] [--format plain|json] Search memories
  get <memory-id> [--format plain|json]       Get a memory by ID
  list [--page <n>] [--page-size <n>] [--format plain|json] List memories
  update <memory-id> [content] [--format plain|json] Update a memory (or read from stdin)
  delete <memory-id> [--format plain|json]    Delete a memory
  config set <api-key|assistant-id> <value>   Set configuration value
  config show [--global|--local]              Show effective configuration
  config clear [--global|--local]             Clear configuration file
  stats [--format plain|json]                 Show memory statistics
  status <operation-id> [--format plain|json] Show operation status
  web [--port <n>]                            Launch web UI
`;
