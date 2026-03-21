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

The Web UI uses the same configuration sources as the CLI to talk to [Backboard](https://backboard.io):

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
- `agent-memory web` always runs **`next start`** against a **production** build (`nextjs/.next/BUILD_ID`). The published npm tarball includes that output from CI; it is **not** committed to git. From a source checkout, run `npm run build` (or at least `npm run build --workspace @agent-memory/nextjs`) before `agent-memory web`. For day-to-day UI work, use `npm run dev --workspace @agent-memory/nextjs` instead.
