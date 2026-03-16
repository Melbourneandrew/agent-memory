# agent-memory CLI

TypeScript CLI package for Agent Memory.

## Package layout

- `src/bin.ts`: Node entrypoint with shebang for NPM `bin` mapping.
- `src/cli.ts`: Runtime command dispatcher and exit code handling.
- `src/commands/`: Command implementations and command help text.
- `src/utils/`: CLI utility helpers.
- `tests/integration/`: Integration test suite and test harness utilities.

## Development workflow

From repository root:

```bash
npm install
npm run build --workspace agent-memory
npm run test --workspace agent-memory
npm run lint --workspace agent-memory
```

## Integration testing approach

- Execute command flows using `runCli()` through test harness helpers.
- Capture stdout/stderr to assert user-facing behavior and exit codes.
- Mock Backboard API with `nock` for deterministic integration tests.
- Use temporary filesystem fixtures for config path and config file behaviors.
