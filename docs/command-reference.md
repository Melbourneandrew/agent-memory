# Command Reference

Memory and system commands call the [Backboard](https://backboard.io) API using your configured API key. Commands that work with a memory bank also need an assistant ID. `agent-memory add` can create one automatically if it is missing; `agent-memory status` only needs the API key. See [Configuration](configuration.md) and [Backboard documentation](https://docs.backboard.com) for setup details.

## Global Flags

- `--help`, `-h` - show help information
- `--version`, `-v` - show CLI version

## Memory Operations

All memory commands require an API key. `add` creates and saves an assistant ID automatically if one is missing. `search`, `get`, `list`, `update`, and `delete` require an assistant ID to already exist.

### add

```bash
agent-memory add [content] [--format plain|json]
```

Adds memory content. If `content` is omitted, reads from standard input.

If no assistant ID is configured yet, this command creates one automatically and saves it before adding the memory.

Required parameters:

- none (content can come from stdin)

Optional parameters:

- `content`
- `--format plain|json`

Example:

```bash
agent-memory add "User prefers markdown responses."
echo "Remember this from stdin" | agent-memory add
```

### search

```bash
agent-memory search <query> [--limit <n>] [--format plain|json]
```

Performs semantic search.

Required parameters:

- `<query>`

Optional parameters:

- `--limit <n>`
- `--format plain|json`

Example:

```bash
agent-memory search "markdown" --limit 5
```

### get

```bash
agent-memory get <memory-id> [--format plain|json]
```

Fetches a memory by ID.

Required parameters:

- `<memory-id>`

Optional parameters:

- `--format plain|json`

Example:

```bash
agent-memory get mem_123
```

### list

```bash
agent-memory list [--page <n>] [--page-size <n>] [--format plain|json]
```

Lists memories with pagination.

Required parameters:

- none

Optional parameters:

- `--page <n>`
- `--page-size <n>`
- `--format plain|json`

Example:

```bash
agent-memory list --page 2 --page-size 20
```

### update

```bash
agent-memory update <memory-id> [content] [--format plain|json]
```

Updates memory content. If `content` is omitted, reads from standard input.

Required parameters:

- `<memory-id>`

Optional parameters:

- `content`
- `--format plain|json`

Example:

```bash
agent-memory update mem_123 "Updated details"
```

### delete

```bash
agent-memory delete <memory-id> [--format plain|json]
```

Deletes a memory by ID.

Required parameters:

- `<memory-id>`

Optional parameters:

- `--format plain|json`

Example:

```bash
agent-memory delete mem_123
```

## System Operations

### stats

```bash
agent-memory stats [--format plain|json]
```

Displays memory usage stats for the configured memory bank.

Required parameters:

- none

Requires configuration:

- API key
- assistant ID (or one created by a previous `add`)

Optional parameters:

- `--format plain|json`

Example:

```bash
agent-memory stats --format json
```

### status

```bash
agent-memory status <operation-id> [--format plain|json]
```

Displays async operation status by operation ID.

Required parameters:

- `<operation-id>`

Optional parameters:

- `--format plain|json`

Example:

```bash
agent-memory status op_456 --format json
```

## Configuration Commands

### config set

```bash
agent-memory config set <api-key|assistant-id> <value> [--global|--local]
```

Sets a configuration value.

Required parameters:

- `<api-key|assistant-id>`
- `<value>`

Optional parameters:

- `--global`
- `--local`

Example:

```bash
agent-memory config set api-key sk_example
agent-memory config set assistant-id asst_123 --local
```

### config show

```bash
agent-memory config show [--global|--local]
```

Shows effective or targeted configuration.

Required parameters:

- none

Optional parameters:

- `--global`
- `--local`

Example:

```bash
agent-memory config show
agent-memory config show --local
```

### config clear

```bash
agent-memory config clear [--global|--local]
```

Clears config at the selected target.

Required parameters:

- none

Optional parameters:

- `--global`
- `--local`

Example:

```bash
agent-memory config clear --local
```

## Web UI Command

### web

```bash
agent-memory web [--port <n>]
```

Starts the local Next.js web UI (default port `8090`) and attempts to open your default browser.

This command requires a configured API key before launch. The UI can create an assistant ID later when you add your first memory.

Example:

```bash
agent-memory web --port 3000
```

Required parameters:

- none

Optional parameters:

- `--port <n>`

## Common Flags

- `--format` supports `plain` and `json` on memory, `stats`, and `status` commands
- `--limit` sets max search results
- `--page` sets current list page
- `--page-size` sets list page size
