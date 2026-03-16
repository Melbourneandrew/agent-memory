# Agent Memory

Agent Memory is a command-line interface and local web UI for persistent memory workflows backed by Backboard.

## Why Agent Memory

AI agents often lose context between sessions. Agent Memory provides a simple interface for:

- adding memories
- searching memories semantically
- listing, updating, and deleting memories
- checking memory stats and operation status
- using either CLI commands or a local browser UI

## Quick Start

```bash
npm install -g agent-memory
agent-memory --version
agent-memory config set api-key <your-api-key>
agent-memory add "User prefers dark mode and short summaries."
agent-memory search "dark mode"
```

## Main Sections

- [Installation](installation.md) - setup and verification
- [Configuration](configuration.md) - API key, assistant ID, and config resolution
- [Command Reference](command-reference.md) - complete CLI command syntax
- [Usage Examples](usage-examples.md) - practical workflows and automation patterns
- [Web UI](web-ui.md) - launching and using the browser interface
- [Resources](resources.md) - GitHub links and Backboard documentation
