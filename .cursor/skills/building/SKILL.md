# Building Conventions

## TypeScript Patterns

- Enable and preserve strict typing in all package configs.
- Export public contracts from package root `index.ts`.
- Use explicit interfaces and narrow types for module boundaries.

## Module Organization

- Keep deep modules by domain (`config`, `backboard`, `assistant`, `utils`).
- Avoid mixing CLI/UI concerns inside the core library.
- Add new submodules only when they represent a stable domain boundary.
- Keep CLI package concerns isolated under `cli/src/commands` and `cli/src/utils`.

## Error Handling

- Throw descriptive errors with actionable context.
- Normalize external failure shapes near integration boundaries.
- Avoid swallowing errors; prefer fail-fast with useful messages.

## Build and Quality Gates

- `npm run build --workspace @agent-memory/core`
- `npm run build --workspace agent-memory`
- `npm run test --workspace @agent-memory/core`
- `npm run test --workspace agent-memory`
- `npm run lint --workspace @agent-memory/core`
- `npm run lint --workspace agent-memory`
- `npm run format --workspace @agent-memory/core` (when formatting changes are required)
- `npm run format --workspace agent-memory` (when formatting changes are required)

## CLI Building Conventions

- Keep `agent-memory` bin mapping pointed at compiled `dist/bin.js`.
- Preserve shebang in CLI entrypoint (`#!/usr/bin/env node`) for global installs.
- Keep command parsing thin; business logic should stay in `@agent-memory/core`.

## Web UI Building Conventions

- Use Next.js App Router with Server Components by default; introduce Client Components only for browser interactivity.
- Keep Backboard and configuration access behind server-only modules (for example `lib/server/*` plus `server-only` guards).
- Use shadcn/ui primitives from `components/ui/` and compose feature UIs in route segments under `app/`.
- Keep route structure explicit (`app/memories`, `app/config`, nested routes for detail/edit flows).
- Prefer direct imports over barrel files in performance-sensitive paths.

## Maintenance

- Update this guide periodically as CLI and Web UI architecture conventions mature.
