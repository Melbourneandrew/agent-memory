# Installation

## Requirements

- Node.js 20 or newer
- npm (or another Node package manager)

Verify Node.js:

```bash
node --version
```

## Install the CLI

The npm package `@melbourneandrew/agent-memory-cli` is a single install: it includes the bundled CLI, shared runtime code, and a **prebuilt** Next.js output under `webui/.next` (produced when the package is built for publish — not checked into git).

```bash
npm install -g @melbourneandrew/agent-memory-cli
```

## Verify Installation

```bash
agent-memory --version
```

Expected output is a semantic version string, for example:

```text
0.1.0
```

## Next Step

After installation, continue to [Configuration](configuration.md) to set your [Backboard](https://backboard.io) API key and assistant ID behavior.
