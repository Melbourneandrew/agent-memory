# Contributing to Agent Memory

Thanks for helping improve Agent Memory. This document explains how to set up the monorepo, run checks locally, and what we expect in pull requests.

## Prerequisites

- **Node.js 20 or newer** (matches CI and each package’s `engines` field)
- **npm** (workspaces are npm-based; `npm ci` is used in CI)
- Optional: **Python 3.10+** if you want to preview the published docs site locally with MkDocs

## Repository layout

This is an npm workspaces monorepo:

| Workspace              | Path      | Role                                          |
| ---------------------- | --------- | --------------------------------------------- |
| `@agent-memory/core`   | `core/`   | Shared library (Backboard-backed memory APIs) |
| `agent-memory`         | `cli/`    | CLI; publishes the `agent-memory` binary      |
| `@agent-memory/nextjs` | `nextjs/` | Next.js web UI (private package)              |

User-facing CLI and product documentation lives under [`docs/`](docs/); the root [`README.md`](README.md) has quick start and everyday commands.

## First-time setup

```bash
git clone https://github.com/Melbourneandrew/agent-memory.git
cd agent-memory
npm install
npm run build
```

`npm run build` compiles TypeScript in `core` and `cli` and builds the Next.js app. You need a successful build before running the CLI from source (the binary points at `cli/dist/`).

## Running the CLI and web UI locally

From the repo root, run the CLI without a global install:

```bash
npm exec --workspace agent-memory -- agent-memory --help
```

Run the Next.js app in development:

```bash
npm run dev --workspace @agent-memory/nextjs
```

To use the `agent-memory` command globally while developing:

```bash
npm run build --workspace agent-memory
cd cli && npm link
```

Remove the link when you are done: `npm unlink -g agent-memory`.

Backboard credentials for manual testing are described in [`docs/configuration.md`](docs/configuration.md) (environment variables and config files). Automated tests must not call real APIs; use mocks (see below).

## Tests

Run the full suite from the root (what CI runs):

```bash
npm run test
```

Target a single workspace:

```bash
npm run test --workspace @agent-memory/core
npm run test --workspace agent-memory
npm run test --workspace @agent-memory/nextjs
```

Conventions (more detail in [`.cursor/skills/testing/SKILL.md`](.cursor/skills/testing/SKILL.md)):

- Prefer deterministic tests; mock external HTTP (CLI tests use **nock** for Backboard).
- CLI integration tests live under `cli/tests/integration/` as `*.test.ts`.
- Add happy-path and failure-path coverage for new behavior where it applies.

Do not open a pull request with failing tests; CI will reject them.

## Lint and format

```bash
npm run lint
npm run format        # write fixes (Prettier) in workspaces
npm run format:check  # full-repo Prettier check (useful before pushing)
```

Pull requests run ESLint and tests on all workspaces, then Prettier `--check` on changed `ts`, `tsx`, `js`, `json`, `md`, `yml`, and `yaml` files compared to the base branch.

The repo installs **Husky** via the root `prepare` script; commit hooks may run **lint-staged** on staged files. Fix reported issues before committing when hooks are enabled.

## Documentation changes

End-user docs are Markdown in `docs/` and built with **MkDocs** (Material theme). Configuration is in [`mkdocs.yml`](mkdocs.yml).

To preview locally:

```bash
pip install mkdocs-material
mkdocs serve
```

Pushes to `main` that touch `docs/`, `mkdocs.yml`, or the docs workflow trigger deployment to GitHub Pages (see [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml)).

## Pull requests

1. **Branch from `main`** with a focused change set (one concern per PR when practical).
2. **Run locally** before opening or updating a PR:
   - `npm run lint`
   - `npm run build`
   - `npm run test`
   - If you changed formatted file types, ensure Prettier is clean (CI only checks changed files, but keeping formatting consistent avoids churn).
3. **Describe the change** in the PR: what problem it solves, how you verified it (commands run), and any follow-ups or risks.
4. **Keep commits readable**; maintainers may squash on merge, but a clear history helps review.

CI workflow: [`.github/workflows/pr-validation.yml`](.github/workflows/pr-validation.yml) (`npm ci`, lint, build, test, Prettier on changed files).

## Questions and scope

- For **product behavior** and CLI syntax, start from [`docs/index.md`](docs/index.md) and the command reference.
- If you are unsure whether an idea fits the project, open an issue or draft PR for discussion before investing in a large change.

Thank you for contributing.
