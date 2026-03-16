# Code Review Guidelines

## Primary Review Checks

- Verify scope matches the active work order and linked requirements.
- Confirm blueprint alignment for module boundaries and contracts.
- Ensure new logic is covered by tests and test names describe user-visible behavior.

## Common Blocking Issues

- Missing or weak tests for new logic.
- API contract drift without explicit documentation.
- Unhandled errors or ambiguous error messages.
- TypeScript `any` usage without clear justification.

## Style and Consistency

- Enforce `npm run lint` and `npm run format`.
- Prefer small, composable modules over large mixed-responsibility files.
- Keep public exports explicit in package `index.ts`.

## Pull Request Expectations

- Include a concise summary of what changed and why.
- Include verification commands and outcomes.
- Document follow-up risks or deferred tasks clearly.

## CLI Review Additions

- Verify command handlers return deterministic Unix-style exit codes.
- Confirm errors are actionable, written to stderr, and do not leak secrets.
- Check command help and version paths remain stable for automation tooling.
- Validate integration tests cover happy path plus at least one error path per new command.

## Maintenance

- Update this guide as CLI command structure and review standards evolve.
