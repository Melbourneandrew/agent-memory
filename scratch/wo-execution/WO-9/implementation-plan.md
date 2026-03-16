# Implementation Plan: WO-9

**Work Order:** WO-9 — Build System Operations CLI Commands
**Created At (UTC):** 2026-03-16T06:32:28Z

## Summary

Deliver CLI system commands `stats` and `status` as concrete handlers with strict argument validation and output formatting parity (`plain` and `json`). Reuse core `ConfigurationResolver` and `BackboardClient` to fetch memory stats and operation status. Add integration tests for happy paths, usage validation, and API error mapping to preserve consistent exit-code behavior.

## File and Package Structure

- `cli/src/commands/system-command-handlers.ts` (new)
- `cli/src/commands/default-handlers.ts`
- `cli/src/commands/index.ts`
- `cli/src/commands/help-text.ts`
- `cli/src/cli.ts`
- `cli/tests/integration/cli-system-commands.test.ts` (new)
- `scratch/wo-execution/WO-9/*.md`

## Signatures

- `createSystemCommandHandlers(dependencies?): Pick<CliCommandHandlers, "stats" | "status">`
- `stats` handler args: `stats [--format json]`
- `status` handler args: `status <operation-id> [--format json]`

## Control Flow

- `runCli` dispatches to default handlers for `stats`/`status`.
- Default handlers delegate to system command handlers.
- Handlers parse command args (`--format`, operation ID), resolve configuration, then call:
  - `BackboardClient.getStats(assistantId)`
  - `BackboardClient.getOperationStatus(operationId)`
- Output is rendered to stdout in plain or JSON form; errors flow to centralized `handleCliError`.

## Steps

1. **Build system handler module** — implement `stats` and `status` command handlers with dependency injection and argument parsing.
2. **Wire command routing** — connect handlers in `default-handlers.ts`, export in `commands/index.ts`, and relax parser-level arg constraints in `cli.ts` so handler-level validation controls flags and operation ID.
3. **Update user-facing help** — document status operation ID argument and optional JSON formatting.
4. **Add integration tests** — create `cli-system-commands.test.ts` covering success cases, JSON output, missing ID/config, and `BackboardError` mappings.
5. **Run full quality gates** — execute workspace and monorepo build/test/lint and address review findings.
