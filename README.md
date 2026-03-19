# Agent Memory Monorepo

This repository contains Agent Memory packages and tooling managed with NPM workspaces:

- **`@agent-memory/core`** — shared library (Backboard-backed memory operations)
- **`agent-memory`** — CLI (`agent-memory` binary)
- **`@agent-memory/nextjs`** — Next.js web UI (private workspace package)

## Requirements

- **Node.js 20+** (see each package’s `engines` field)

## Install

**Clone and install all workspace dependencies** (contributors, local development):

```bash
git clone https://github.com/Melbourneandrew/agent-memory.git
cd agent-memory
npm install
```

**Use only the published core library** in another project:

```bash
npm install @agent-memory/core
```

After cloning, build once so compiled outputs exist for the CLI and apps:

```bash
npm run build
```

## Quick usage

### CLI

Run the CLI from the repo root without a global install:

```bash
npm exec --workspace agent-memory -- agent-memory --help
```

Typical commands (configure Backboard credentials first — see below):

```bash
# Effective config (env, config file, flags)
npm exec --workspace agent-memory -- agent-memory config show

# Memories
npm exec --workspace agent-memory -- agent-memory add "Remember: deploy checklist"
npm exec --workspace agent-memory -- agent-memory search "deploy"
npm exec --workspace agent-memory -- agent-memory list

# Local web UI (Next.js)
npm exec --workspace agent-memory -- agent-memory web
```

Configuration is resolved from environment variables, then local/global config files. Common variables:

- `BACKBOARD_API_KEY`
- `BACKBOARD_ASSISTANT_ID`

Use `agent-memory config set …` / `config show` to inspect what the CLI will use.

### Web app (Next.js)

```bash
npm run dev --workspace @agent-memory/nextjs
```

Then open the URL printed in the terminal (default Next dev port is [http://localhost:3000](http://localhost:3000)).

### Core library

Import from `@agent-memory/core` in Node or bundled apps after `npm install @agent-memory/core`. Types ship with the package (`dist/index.d.ts`).

## Development

```bash
npm install
npm run build
npm run test
npm run lint
```

## CI/CD Workflows

The repository uses three GitHub Actions workflows:

- `.github/workflows/pr-validation.yml` for pull request lint/build/test/format checks.
- `.github/workflows/publish-npm.yml` for publishing `@agent-memory/core` to NPM after successful build and tests.
- `.github/workflows/deploy-docs.yml` for deploying MkDocs documentation to GitHub Pages.

## Required Repository Configuration

1. Create an NPM automation token with publish permissions and store it as repository secret `NPM_TOKEN`.
2. In GitHub Pages settings, set the source to `GitHub Actions`.
3. Ensure workflow permissions satisfy each workflow's declared needs; `Deploy Docs` requires `pages: write` and `id-token: write`, while CI and NPM publish only require read access to repository contents.
4. Optionally configure branch protection on `main` to require `PR Validation` before merge.
