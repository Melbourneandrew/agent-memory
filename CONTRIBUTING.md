# Contributing to Agent Memory

This document covers setup, how to work on each package (`core`, CLI, Next.js), and pull request expectations.

## Prerequisites

- **Node.js 20+** (matches CI and each package’s `engines` field)
- **npm** (workspaces; CI uses `npm ci`)
- Optional: **Python 3.10+** to preview MkDocs for [`docs/`](docs/)

## Clone, install, build

```bash
git clone https://github.com/Melbourneandrew/agent-memory.git
cd agent-memory
npm install
npm run build
```

`npm run build` compiles TypeScript in `core` and `cli` and runs `next build` for the web app. The CLI reads compiled output from `cli/dist/`.

**Shared dependency:** `cli` and `nextjs` both use `@agent-memory-cli/core`. After you change `core`, rebuild it (`npm run build --workspace @agent-memory-cli/core`) or run `npm run build` from the repo root so `dist/` stays in sync for dependents.

## `core` (`@agent-memory-cli/core`)

Shared library: Backboard access, config resolution, assistant helpers, shared types.

- **Source:** `core/src/` — `config/`, `backboard/`, `assistant/`, `utils/`, `types.ts`
- **Tests:** Colocated `*.test.ts` next to source; Jest with coverage (`npm run test` includes `--coverage`)
- **Package scripts:** `build`, `test`, `lint`, `format`

From the repo root:

```bash
npm run test --workspace @agent-memory-cli/core
npm run build --workspace @agent-memory-cli/core
```

This package is published to npm. More detail: [`core/README.md`](core/README.md).

## CLI (workspace `@agent-memory-cli/cli`, published as `agent-memory-cli`)

The `agent-memory` command-line tool is the `bin` of the **root** npm package `agent-memory-cli`. The CLI workspace bundles `cli/src` plus `@agent-memory-cli/core` with esbuild into `cli/dist/bin.js`.

- **Source:** `cli/src/` — `bin.ts`, `cli.ts`, `commands/`, `utils/`
- **Tests:** `cli/tests/integration/*.test.ts` — mock Backboard with **nock**, use temp dirs for config; no live API calls in CI
- **Package scripts:** `build`, `test`, `lint`, `format`

Run from the repo root without installing globally:

```bash
npx agent-memory --help
```

(`agent-memory` comes from the root package `bin`; run from the repo root after `npm run build`.)

Optional global link while developing (so you can type `agent-memory` in any terminal):

```bash
npm run build
npm link
```

Remove with `npm unlink -g agent-memory-cli`.

**Why `agent-memory` is “command not found”:** Link the **root** package (`npm link` from the repository root after `npm run build`) so npm registers the `agent-memory` binary from the root `package.json` `bin` field.

If the binary exists but the shell still cannot find it, ensure your global npm bin directory is on `PATH` (often `$(npm config get prefix)/bin`; Homebrew Node on macOS typically already includes it). Manual testing with real Backboard: [`docs/configuration.md`](docs/configuration.md).

## Web UI (`@agent-memory/nextjs`)

Next.js App Router app (private workspace package; not published).

- **Source:** `nextjs/app/` (routes), `nextjs/components/`, `nextjs/lib/`
- **Tests:** `nextjs/tests/` — pages, server actions, and server-only boundaries; mock `@agent-memory-cli/core` at the server boundary (see [`.cursor/skills/testing/SKILL.md`](.cursor/skills/testing/SKILL.md))
- **Package scripts:** `dev`, `build`, `start`, `test`, `lint` — there is **no** `format` script here; formatting is enforced from the root (below)

```bash
npm run dev --workspace @agent-memory/nextjs
```

Production-style check: `npm run build --workspace @agent-memory/nextjs`.

## Testing

```bash
npm run test
```

Runs all workspace test suites (what CI runs). Per-workspace commands are listed above. General conventions: deterministic tests, mock external HTTP and APIs, not internal implementation details — details in [`.cursor/skills/testing/SKILL.md`](.cursor/skills/testing/SKILL.md).

## Lint and format

```bash
npm run lint
npm run format        # Prettier in core + cli workspaces
npm run format:check  # Prettier across repo (includes nextjs/, docs/, etc.)
```

Pull requests run ESLint on every workspace, then Prettier `--check` on **changed** `ts`, `tsx`, `js`, `json`, `md`, `yml`, and `yaml` files vs the base branch ([`.github/workflows/pr-validation.yml`](.github/workflows/pr-validation.yml)). Husky **lint-staged** may run on commit (see root `package.json`).

To format Next.js files by hand from the repo root:

```bash
npx prettier --write "nextjs/**/*.{ts,tsx,js}"
```

## Documentation

User-facing docs live in `docs/` and are built with MkDocs ([`mkdocs.yml`](mkdocs.yml)).

```bash
pip install mkdocs-material
mkdocs serve
```

Pushes to `main` that touch `docs/`, `mkdocs.yml`, or the docs workflow deploy GitHub Pages ([`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)).

## Pull requests

1. Branch from `main`; keep the change set focused when practical.
2. Before you open or update a PR, run `npm run lint`, `npm run build`, and `npm run test`; ensure Prettier is clean (`npm run format:check` or your editor / lint-staged).
3. Describe the problem, the approach, and how you verified (commands you ran).
4. For product behavior and CLI syntax, align with [`docs/index.md`](docs/index.md) and [`docs/command-reference.md`](docs/command-reference.md). If a large feature is uncertain, open an issue or draft PR first.

Thank you for contributing.
