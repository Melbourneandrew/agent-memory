# Implementation Plan: WO-8

**Work Order:** WO-8 — Build Memory Operations CLI Commands (Search, List, Update)
**Created At (UTC):** 2026-03-16T06:15:09Z

## Summary

Implement CLI handlers for `search`, `list`, and `update` inside the existing memory command module so memory operations share parsing, config resolution, and error semantics. Add support for `--limit` on search, `--page`/`--page-size` on list, and stdin content for update while preserving plain-text and JSON output modes. Expand integration tests with dependency-injected clients to verify success paths, validation failures, and API error mapping.

## File and Package Structure

- `cli/src/commands/memory-command-handlers.ts`
- `cli/src/commands/default-handlers.ts`
- `cli/src/commands/help-text.ts`
- `cli/tests/integration/cli-memory-commands.test.ts`
- `scratch/wo-execution/WO-8/*.md`

## Signatures

- `createMemoryCommandHandlers(dependencies?): Pick<CliCommandHandlers, "add" | "search" | "get" | "list" | "update" | "delete">`
- Internal helpers for search/list parsing:
  - `parseSearchArgs(args): { query: string; limit: number; format: OutputFormat }`
  - `parseListArgs(args): { page: number; pageSize: number; format: OutputFormat }`
- Internal update content helper:
  - `resolveUpdateContent(positionals, readStdin): Promise<string>`

## Control Flow

- Parser dispatch in `runCli()` sends command token to default handlers.
- Default handlers delegate `search/list/update` to memory command handlers.
- Handlers parse/validate command args, resolve config identity, and call `BackboardClient.searchMemory`, `BackboardClient.listMemories`, or `BackboardClient.updateMemory`.
- Results are rendered in plain text or JSON (`--format json`) and rely on central CLI error mapping for exit codes.

## Steps

1. **Extend memory handlers** — add `search`, `list`, and `update` handler implementations with validation and formatting behavior in `memory-command-handlers.ts`.
2. **Wire defaults and help text** — map handlers in `default-handlers.ts` and adjust usage lines in `help-text.ts` for list/update options.
3. **Expand integration tests** — add search/list/update success and failure scenarios (limits, pagination, stdin update, no results, empty list, API error mapping) in `cli-memory-commands.test.ts`.
4. **Run verification gates** — execute workspace and monorepo build/test/lint plus review-agent checks, then update WO-8 artifacts.
