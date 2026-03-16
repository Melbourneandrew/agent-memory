# Testing Conventions

## Scope

Use this guide for all unit and integration tests in this repository.

## Structure

- Place tests beside source files using `*.test.ts`.
- Keep one behavior per test case and use explicit test names.
- Prefer deterministic tests: avoid network and clock dependencies unless mocked.

## Mocking Patterns

- Mock external API boundaries, not internal implementation details.
- Use lightweight fixtures with only required fields.
- Reset or reinitialize shared mocks between tests.

## Coverage Expectations

- New modules should include at least one happy-path test and one failure-path test where applicable.
- Keep overall coverage high enough to detect regressions in touched files.
- Treat missing tests for new logic as a blocking review issue.

## Execution

- Run `npm run test --workspace @agent-memory/core` for package-level tests.
- Run `npm run test --workspace agent-memory` for CLI integration tests.
- Use `npm run test` from repo root before final verification.

## CLI Integration Testing Patterns

- Place CLI integration tests under `cli/tests/integration/` and name as `*.test.ts`.
- Use shared command harness helpers to execute CLI commands and capture stdout/stderr deterministically.
- Mock Backboard HTTP traffic with `nock`; do not call real APIs in test runs.
- Use temporary filesystem fixtures for config path and config file behavior tests.
- Assert on both exit code and user-visible output (stdout/stderr) for each command flow.

## Maintenance

- Update this document whenever new CLI testing patterns become stable conventions.
