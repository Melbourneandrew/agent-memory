# Command Reference

Memory and system commands call the [Backboard](https://backboard.io) API using your configured API key. See [Configuration](configuration.md) and [Backboard documentation](https://docs.backboard.com) for setup details.

## Global Flags

- `--help`, `-h` - show help information
- `--version`, `-v` - show CLI version

## Memory Operations

### add

```bash
agent-memory add [content] [--format plain|json]
```

Adds memory content. If `content` is omitted, reads from standard input.

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
agent-memory stats [--format json]
```

Displays memory usage stats.

Required parameters:

- none

Optional parameters:

- `--format json` (default output is plain text)

Example:

```bash
agent-memory stats --format json
```

### status

```bash
agent-memory status <operation-id> [--format json]
```

Displays async operation status by operation ID.

Required parameters:

- `<operation-id>`

Optional parameters:

- `--format json` (default output is plain text)

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

Example:

```bash
agent-memory web --port 3000
```

Required parameters:

- none

Optional parameters:

- `--port <n>`

## Common Flags

- `--format` supports `plain` and `json`
- `--limit` sets max search results
- `--page` sets current list page
- `--page-size` sets list page size
