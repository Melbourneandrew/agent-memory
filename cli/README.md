# `@agent-memory-cli/cli` (workspace)

TypeScript CLI for Agent Memory. **Publishing:** this workspace is not published on its own. The repository root package [`agent-memory-cli`](../package.json) is the single npm release: it ships this CLI (bundled with core via esbuild), the built Next.js web UI under `nextjs/`, and runtime dependencies.

## Package layout

- `src/bin.ts`: Node entrypoint with shebang for the root package `bin` mapping.
- `src/cli.ts`: Runtime command dispatcher, validation, and unified exit code handling.
- `src/commands/`: Command implementations and command help text.
- `src/utils/`: CLI utility helpers.
- `tests/integration/`: Integration test suite and test harness utilities.

## Build

Production output is a **bundled** `dist/bin.js` (esbuild), not plain `tsc` output:

```bash
npm run build --workspace @agent-memory-cli/cli
```

From the repository root, `npm run build` builds core, the Next.js app, then this bundle.

## Development workflow

```bash
npm install
npm run build --workspace @agent-memory-cli/cli
npm run test --workspace @agent-memory-cli/cli
npm run lint --workspace @agent-memory-cli/cli
```

## Integration testing approach

- Execute command flows using `runCli()` through test harness helpers.
- Capture stdout/stderr to assert user-facing behavior and exit codes.
- Mock Backboard API with `nock` for deterministic integration tests.
- Use temporary filesystem fixtures for config path and config file behaviors.
