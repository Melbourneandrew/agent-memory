# Implementation Plan: WO-14

**Work Order:** WO-14 — Build Web Command Launcher in CLI
**Created At (UTC):** 2026-03-16T07:50:37Z

## Summary

Implement the `agent-memory web` command in the CLI to launch the local Next.js application with a default/custom port, configuration validation, browser auto-open, and graceful shutdown behavior. The implementation uses a dedicated `web-command-handler` module integrated into default command handlers. Coverage is added with integration-style CLI tests using dependency injection for process/network side effects.

## File and Package Structure

- `cli/src/commands/web-command-handler.ts` (new): web command parsing, config checks, port checks, process startup/readiness/lifecycle, browser opener.
- `cli/src/commands/default-handlers.ts` (modify): wire `web` to real handler instead of not-implemented fallback.
- `cli/src/commands/index.ts` (modify): export web handler factory.
- `cli/tests/integration/cli-web-command.test.ts` (new): verify success path and failure paths (missing API key, occupied port, invalid port, startup failure cleanup).

## Signatures

- `createWebCommandHandler(dependencies?: Partial<WebCommandDependencies>): Pick<CliCommandHandlers, "web">`
- `WebCommandDependencies` (exported interface):
  - `configurationResolver.resolve(...)`
  - `checkPortAvailability(port)`
  - `resolveWebAppDirectory(cwd)`
  - `resolveNextBinPath(cwd)`
  - `spawnProcess(command, args, options)`
  - `waitForServerReady(url, timeoutMs)`
  - `openBrowser(url, platform)`

## Control Flow

1. `runCli()` dispatches `web` command to `defaultCommandHandlers.web`.
2. `webHandler()` parses `--port` (default 8090), validates API key via `ConfigurationResolver`.
3. `checkPortAvailability()` verifies bindability and reports meaningful error types (in-use, permission, address).
4. Handler resolves Next.js app directory/bin path and determines `dev` vs `start` mode by presence of `.next/BUILD_ID`.
5. Handler spawns Next.js child process, forwards child logs to CLI streams, races readiness vs premature process exit, and kills child on startup failure.
6. On readiness, handler opens browser (`open`/`cmd start`/`xdg-open`) and waits until termination, with SIGINT/SIGTERM graceful shutdown.

## Steps

1. **Create handler module** — add `cli/src/commands/web-command-handler.ts` with argument parsing, config resolution, port checks, process management, readiness probe, and browser opener.
2. **Wire command registry** — update `default-handlers.ts` and `commands/index.ts` to route `web` to `createWebCommandHandler()`.
3. **Add test coverage** — add `cli/tests/integration/cli-web-command.test.ts` with mocked dependencies and fake child process lifecycle assertions.
4. **Fix review findings** — harden startup lifecycle with readiness/exit race and cleanup, tighten port range validation, improve bind-error messaging.
5. **Run quality gates** — run CLI and monorepo lint/test/build and record outcomes in checklist/review log.
