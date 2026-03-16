# Implementation Plan: WO-5

**Work Order:** WO-5 — Build CLI Command Parser and Entry Point
**Created At (UTC):** 2026-03-16T05:33:31Z

## Summary

Implement a production-facing CLI parser and entrypoint that routes supported command families to handlers while enforcing argument validation and consistent Unix exit codes. The approach keeps command business logic out of this work order by routing to default placeholder handlers and focusing on parser correctness, error semantics, and test coverage.

## File and Package Structure

- `cli/src/cli.ts` (parser dispatch, validation, and error-to-exit-code mapping)
- `cli/src/commands/help-text.ts` (global help output for all command families)
- `cli/src/commands/types.ts` (handler contracts for routed commands)
- `cli/src/commands/default-handlers.ts` (default handler stubs for out-of-scope command implementations)
- `cli/src/commands/index.ts` (command module exports)
- `cli/src/errors.ts` (CLI usage error type)
- `cli/tests/integration/helpers/command-harness.ts` (support custom handlers in parser tests)
- `cli/tests/integration/cli-help.test.ts` (global help assertions)
- `cli/tests/integration/cli-config-path.test.ts` (repurposed to config parser tests)
- `cli/tests/integration/cli-ping.test.ts` (repurposed to routing and error-code tests)
- `cli/README.md` (updated parser scope and exit-code documentation)
- `scratch/wo-execution/WO-5/*.md` (execution evidence)

## Signatures

- `runCli(args: string[], runtime?: CliRuntime, handlers?: CliCommandHandlers): Promise<number>`
- `CliCommandHandlers` interface with grouped command handler functions for memory, config, system, and web commands
- `CliUsageError` class for argument/usage validation failures

## Control Flow

1. `bin.ts` invokes `runCli(process.argv.slice(2))`.
2. `runCli` handles global flags (`--help`, `--version`) before dispatching command tokens.
3. `dispatchCommand` validates required positional args and routes to command-family handlers (`memory`, `config`, `system`, `web`).
4. Parser catches all thrown errors and maps them to standard exit codes:
   - usage/general: `1`
   - API (`BackboardError`): `2`
   - network (`TypeError`/`AbortError`): `3`
5. Integration tests execute `runCli` through command harness with injected handlers for deterministic route and error-path assertions.

## Steps

1. **Define parser contracts** — add handler interfaces and default command handlers under `cli/src/commands/`.
2. **Implement parser dispatch** — update `cli/src/cli.ts` with command hierarchy routing, global flags, and usage validation.
3. **Implement unified error mapping** — map `CliUsageError`, `BackboardError`, and network errors to required exit codes.
4. **Update tests for parser behavior** — extend integration tests to verify routing, validation failures, and exit-code semantics.
5. **Document parser scope** — update `cli/README.md` to reflect command families and exit-code policy.
