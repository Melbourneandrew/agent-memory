# Configuration

Agent Memory uses the same configuration model across the CLI and Web UI.

## API Key

Get a Backboard API key from [Backboard](https://backboard.io) (see [Backboard documentation](https://docs.backboard.com) for API keys and setup).

Set the API key:

```bash
agent-memory config set api-key <your-api-key>
```

## Assistant ID (Memory Bank ID)

Assistant ID is the [Backboard](https://backboard.io) assistant identifier used to group memories in a single memory bank.

You can set it explicitly:

```bash
agent-memory config set assistant-id <assistant-id>
```

Or let Agent Memory create one automatically on your first successful `add` operation if it is missing.

That automatic path is only used by `add`. Commands such as `search`, `get`, `list`, `update`, `delete`, and `stats` require an assistant ID to already exist. `status` is the exception: it only needs an API key plus the operation ID.

## View Current Configuration

```bash
agent-memory config show
```

## Clear Configuration

```bash
agent-memory config clear
```

Use `--global` or `--local` to target a specific config file.

## Resolution Priority

Configuration resolves in this order (highest first):

1. command-line arguments (core resolver capability used by embedded/programmatic usage)
2. environment variables
3. local config file
4. global config file

Note: the current public `agent-memory` CLI commands do not expose direct `--api-key` or
`--assistant-id` flags. For CLI usage, set values through `config set` or environment variables.

Environment variables:

- `BACKBOARD_API_KEY`
- `BACKBOARD_ASSISTANT_ID`

## Configuration File Locations

- Local: `.agent-memory/config.json` in your current working directory
- Global (macOS/Linux): `~/.config/agent-memory/config.json`
- Global (Windows): `%APPDATA%\agent-memory\config.json`
