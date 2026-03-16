# Configuration

Agent Memory uses the same configuration model across the CLI and Web UI.

## API Key

Get a Backboard API key from the Backboard platform docs:

- [Backboard Documentation](https://docs.backboard.com)

Set the API key:

```bash
agent-memory config set api-key <your-api-key>
```

## Assistant ID (Memory Bank ID)

Assistant ID is the Backboard assistant identifier used to group memories in a single memory bank.

You can set it explicitly:

```bash
agent-memory config set assistant-id <assistant-id>
```

Or let Agent Memory create one automatically on your first `add` operation if it is missing.

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
