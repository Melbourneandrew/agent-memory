# Web UI

Agent Memory includes a local browser interface powered by Next.js.

## Launch

```bash
agent-memory web
```

Default URL:

```text
http://localhost:8090
```

Custom port:

```bash
agent-memory web --port 3000
```

## Configuration Behavior

The Web UI uses the same configuration sources as the CLI:

- API key
- assistant ID (memory bank ID)

Any configuration changes in the Web UI are immediately available to CLI commands.

## Features

- memory list and detail views
- create, update, delete, and search operations
- configuration management (set and clear local config)
- memory usage stats displayed on the main memory list view

## Notes

- The server runs locally and remains active until you terminate it (for example, `Ctrl+C`).
- If automatic browser opening fails, use the printed localhost URL manually.
