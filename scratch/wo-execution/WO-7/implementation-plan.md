# Implementation Plan: WO-7

**Work Order:** WO-7 — Build Memory Operations CLI Commands (Add, Get, Delete)
**Created At (UTC):** 2026-03-16T05:51:01Z

## Summary

Implement concrete CLI handlers for `add`, `get`, and `delete` on top of the existing parser/dispatcher. Handlers resolve runtime configuration from core, initialize assistant IDs for first-run add flows, call Backboard client operations, and emit plain or JSON output. Add integration tests with injected dependencies to validate success paths, failure mappings, and usage validation.

## File and Package Structure

- `cli/src/commands/memory-command-handlers.ts` (new)
- `cli/src/commands/default-handlers.ts`
- `cli/src/commands/index.ts`
- `cli/src/commands/help-text.ts`
- `cli/src/cli.ts`
- `cli/tests/integration/cli-memory-commands.test.ts` (new)
- `scratch/wo-execution/WO-7/*.md`

## Signatures

- `createMemoryCommandHandlers(dependencies?): { add, get, delete }`
  - Produces CLI command handlers with injectable resolver/client/stdin dependencies.
- Internal helper: `parseFormatAndPositionals(args): { positionals: string[]; format: "plain" | "json" }`
- Internal helper: `resolveConfiguredIdentity(deps, cwd, allowAutoCreate): Promise<{ apiKey: string; assistantId: string }>`

## Control Flow

- `runCli()` dispatches command token to default handlers.
- Default handlers delegate `add/get/delete` to memory command handlers.
- Handlers parse positional/flag input, validate command usage, then resolve config via `ConfigurationResolver`.
- `add` resolves content from CLI arg or stdin first, then ensures assistant ID (auto-create when missing), persists it, and calls `BackboardClient.addMemory()`.
- `get`/`delete` require configured assistant ID and call `BackboardClient.getMemory()` / `BackboardClient.deleteMemory()`.
- Handlers write plain-text output by default or structured JSON for `--format json`.

## Steps

1. **Implement memory command module** — add `memory-command-handlers.ts` with parsing, config resolution, API calls, stdin support, and output formatting.
2. **Wire handlers into CLI defaults** — update `default-handlers.ts` and exports in `commands/index.ts`; relax parser positional requirement for `add` to allow stdin mode.
3. **Add integration tests** — create `cli-memory-commands.test.ts` covering add/get/delete success paths, JSON output, missing config, Backboard error mapping, invalid format usage, and no-side-effect validation.
4. **Update user-facing help and validate** — update `help-text.ts` to reflect `add [content]`, run full build/test/lint quality gates.
