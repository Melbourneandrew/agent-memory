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
- Use `npm run test` from repo root before final verification.
