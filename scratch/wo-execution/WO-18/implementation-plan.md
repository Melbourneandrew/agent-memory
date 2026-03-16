# Implementation Plan: WO-18

**Work Order:** WO-18 — Implement CLI Integration Tests
**Created At (UTC):** 2026-03-16T06:48:13Z

## Summary

WO-18 extends CLI integration coverage to satisfy remaining acceptance criteria for Configuration & Setup, Memory Operations, and System Operations. The approach is to add targeted integration tests around command targeting defaults, assistant auto-initialization persistence, delete-command coverage, and auth/network error behavior. No production code changes are required.

## File and Package Structure

- `cli/tests/integration/cli-config-path.test.ts`
  - Add scenarios for local-default targeting and explicit `--global` override.
  - Add global clear behavior coverage for default and explicit `--global`.
- `cli/tests/integration/cli-memory-commands.test.ts`
  - Add assistant auto-create persistence assertion.
  - Add missing delete command integration tests (plain + JSON).
  - Add explicit auth and network error mapping tests.
- `cli/tests/integration/cli-system-commands.test.ts`
  - Add explicit auth and network error mapping tests.

## Signatures

No public production signatures are changed. Existing integration harness signatures are reused.

## Control Flow

Each test executes `runCli()` via `executeCliCommand()`, routes to command handlers, and validates command outputs/exit codes:
1. Build handler fixtures with deterministic resolver/client behavior.
2. Execute command args through CLI dispatcher.
3. Assert stdout/stderr + exit code contracts per requirement.
4. For config-path tests, verify file system side effects in temporary directories.

## Steps

1. **Audit existing coverage** — map current integration tests to WO-18 scope and identify missing acceptance criteria.
2. **Implement config targeting tests** — update `cli-config-path.test.ts` for no-flag default-local and explicit-global semantics.
3. **Implement memory/system error-path coverage** — add auth/network behavior assertions and delete coverage in integration suites.
4. **Run verification gates** — run build/test/lint for CLI and ensure no regressions.
5. **Record execution evidence** — update checklist/context/review-log and deliver via branch + PR.
