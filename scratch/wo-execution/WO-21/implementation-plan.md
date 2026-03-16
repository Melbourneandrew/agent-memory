# Implementation Plan: WO-21

**Work Order:** WO-21 — Setup CLI Package & Integration Testing Infrastructure
**Created At (UTC):** 2026-03-16T05:24:46Z

## Summary

Bootstrap the CLI workspace and integration testing infrastructure so feature work orders can focus on command behavior instead of setup overhead. The implementation creates a publish-ready `agent-memory` package with bin mapping, TypeScript/Jest/ESLint/Prettier tooling, deterministic integration tests with HTTP and filesystem mocking, and updated shared skill conventions for CLI development.

## File and Package Structure

- Root:
  - `package.json` (update workspaces and root scripts for CLI workspace)
  - `.gitignore` (ignore CLI build and coverage artifacts)
  - `package-lock.json` (workspace dependency updates)
- CLI workspace:
  - `cli/package.json`
  - `cli/tsconfig.json`
  - `cli/tsconfig.eslint.json`
  - `cli/jest.config.js`
  - `cli/.eslintrc.json`
  - `cli/.prettierrc`
  - `cli/README.md`
  - `cli/src/bin.ts`
  - `cli/src/index.ts`
  - `cli/src/cli.ts`
  - `cli/src/commands/index.ts`
  - `cli/src/commands/help-text.ts`
  - `cli/src/commands/ping-command.ts`
  - `cli/src/utils/config-paths.ts`
  - `cli/tests/integration/cli-help.test.ts`
  - `cli/tests/integration/cli-version.test.ts`
  - `cli/tests/integration/cli-ping.test.ts`
  - `cli/tests/integration/cli-config-path.test.ts`
  - `cli/tests/integration/helpers/command-harness.ts`
  - `cli/tests/integration/helpers/mock-file-system.ts`
- Conventions:
  - `.cursor/skills/README.md`
  - `.cursor/skills/testing/SKILL.md`
  - `.cursor/skills/review/SKILL.md`
  - `.cursor/skills/building/SKILL.md`
- WO artifacts:
  - `scratch/wo-execution/WO-21/*.md`

## Signatures

- `runCli(args: string[], runtime?: CliRuntime): Promise<number>` in `cli/src/cli.ts`
- `runPing(endpoint: string): Promise<number>` in `cli/src/commands/ping-command.ts`
- `resolveGlobalConfigPath(env: NodeJS.ProcessEnv): string` in `cli/src/utils/config-paths.ts`
- `resolveLocalConfigPath(cwd: string): string` in `cli/src/utils/config-paths.ts`
- `executeCliCommand(args: string[], options?): Promise<{ exitCode; stdout; stderr }>` in test harness
- `createMockFileSystem(): { root; env; cleanup() }` in filesystem test helper

## Control Flow

1. NPM-installed binary `agent-memory` executes compiled `dist/bin.js`.
2. `bin.ts` calls `runCli(process.argv.slice(2))`.
3. `runCli` routes arguments to bootstrap commands (`help`, `version`, `config-path`, `ping`) and writes to stdout/stderr with explicit exit codes.
4. `ping` delegates network probing to `runPing`, which uses `fetch` plus timeout and non-2xx failure signaling.
5. Integration tests call `runCli` through `executeCliCommand`, using `nock` for HTTP mocks and temporary filesystem fixtures for config-path validation.

## Steps

1. **Create CLI workspace skeleton** — add `cli` package metadata, build/test/lint configs, and root workspace wiring.
2. **Implement bootstrap CLI runtime** — add executable entrypoint and minimal command dispatcher aligned with blueprint expectations.
3. **Add integration testing infrastructure** — create command harness, HTTP mocking, filesystem fixture helpers, and integration example tests.
4. **Document CLI workflow** — write `cli/README.md` and update `.cursor/skills/*` with CLI-specific testing/review/building conventions.
5. **Run review and quality gates** — execute build/test/lint and fix any blockers from review feedback.
