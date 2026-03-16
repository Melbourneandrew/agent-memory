# Implementation Plan: WO-6

**Work Order:** WO-6 — Build Configuration Management CLI Commands
**Created At (UTC):** 2026-03-16T05:41:12Z

## Summary

Deliver the three configuration management commands in the CLI: `config set`, `config show`, and `config clear`. The implementation composes existing core `ConfigurationReader` and `ConfigurationWriter` components, adds robust `--global`/`--local` targeting, and validates behavior through command-level integration tests with isolated filesystem paths.

## File and Package Structure

- `cli/src/commands/config-command-handlers.ts` (new): Implements config command behavior using core config services.
- `cli/src/commands/default-handlers.ts` (modified): Wires real config handlers while preserving placeholders for out-of-scope commands.
- `cli/src/commands/index.ts` (modified): Exports config handler factory.
- `cli/src/commands/help-text.ts` (modified): Updates clear command usage text.
- `cli/src/cli.ts` (modified): Passes runtime cwd to handlers and delegates config validation to handlers for flag-aware parsing.
- `cli/src/commands/types.ts` (modified): Adds `cwd` to handler context.
- `cli/tests/integration/helpers/command-harness.ts` (modified): Supports custom `cwd` for deterministic config file tests.
- `cli/tests/integration/cli-config-path.test.ts` (modified): Converts to true config command integration coverage.
- `scratch/wo-execution/WO-6/*.md` (modified): Context, plan, checklist, and review records.

## Signatures

- `createConfigCommandHandlers(fileSystem?: FileSystemAdapter): Pick<CliCommandHandlers, "configSet" | "configShow" | "configClear">`
- `CommandHandlerContext.cwd: string` (new handler contract input)
- `runCli(args, runtime, handlers): Promise<number>` now propagates runtime cwd into routed handlers

## Control Flow

1. `runCli` parses command hierarchy and routes `config set|show|clear`.
2. `dispatchConfigSubcommand` forwards raw subcommand args (including flags) and cwd to the selected config handler.
3. Config handlers parse flags and determine `ConfigurationTarget` (`global`, `local`, `auto`) with conflict checking.
4. `config set` invokes `ConfigurationWriter.write`, `config show` invokes `ConfigurationReader.read` + masking, and `config clear` invokes `ConfigurationWriter.clear`.
5. Handlers return user-facing output indicating source/path/result and parser-level error handling maps failures to standard exit codes.

## Steps

1. **Implement config handlers** — Add `config-command-handlers.ts` with target-flag parsing and key-specific set/show/clear operations.
2. **Integrate with command routing** — Wire handlers in defaults and adjust parser to support config flags and runtime cwd propagation.
3. **Add integration coverage** — Update CLI config integration tests to validate global/local targeting, masked output, and clear behavior.
4. **Run full verification** — Execute root build/test/lint and linter diagnostics on changed files.
