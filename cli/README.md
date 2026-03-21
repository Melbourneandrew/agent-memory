# agent-memory-cli

TypeScript CLI package for Agent Memory.

## Package layout

- `src/bin.ts`: Node entrypoint with shebang for NPM `bin` mapping.
- `src/cli.ts`: Runtime command dispatcher, validation, and unified exit code handling.
- `src/commands/`: Command implementations and command help text.
- `src/utils/`: CLI utility helpers.
- `tests/integration/`: Integration test suite and test harness utilities.

## Command parser scope

- Global flags: `--help`/`-h`, `--version`/`-v`.
- Routed command families: memory (`add`, `search`, `get`, `list`, `update`, `delete`),
  configuration (`config set|show|clear`), system (`stats`, `status`), and `web`.
- Exit codes: `0` success, `1` usage/general errors, `2` API errors, `3` network errors.

## Development workflow

From repository root:

```bash
npm install
npm run build --workspace agent-memory-cli
npm run test --workspace agent-memory-cli
npm run lint --workspace agent-memory-cli
```

## Integration testing approach

- Execute command flows using `runCli()` through test harness helpers.
- Capture stdout/stderr to assert user-facing behavior and exit codes.
- Mock Backboard API with `nock` for deterministic integration tests.
- Use temporary filesystem fixtures for config path and config file behaviors.
