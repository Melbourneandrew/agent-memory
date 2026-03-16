# Building Conventions

## TypeScript Patterns

- Enable and preserve strict typing in all package configs.
- Export public contracts from package root `index.ts`.
- Use explicit interfaces and narrow types for module boundaries.

## Module Organization

- Keep deep modules by domain (`config`, `backboard`, `assistant`, `utils`).
- Avoid mixing CLI/UI concerns inside the core library.
- Add new submodules only when they represent a stable domain boundary.

## Error Handling

- Throw descriptive errors with actionable context.
- Normalize external failure shapes near integration boundaries.
- Avoid swallowing errors; prefer fail-fast with useful messages.

## Build and Quality Gates

- `npm run build --workspace @agent-memory/core`
- `npm run test --workspace @agent-memory/core`
- `npm run lint --workspace @agent-memory/core`
- `npm run format --workspace @agent-memory/core` (when formatting changes are required)
