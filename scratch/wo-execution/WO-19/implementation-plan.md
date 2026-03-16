# Implementation Plan: WO-19

**Work Order:** WO-19 — Implement Next.js Web UI Tests
**Created At (UTC):** 2026-03-16T08:06:39Z

## Summary

Add an automated test suite for the Next.js package covering server actions, server component rendering paths, critical memory/config flows, and security constraints around server-only API key access. The implementation sets up Jest for the Next.js workspace and uses deterministic mocks for server core and navigation/cache hooks. Tests focus on requirement-critical behaviors from REQ-WU-002 through REQ-WU-015 without introducing E2E browser automation.

## File and Package Structure

- `nextjs/package.json` (modify): add `test` script and test-related dev dependencies.
- `nextjs/jest.config.js` (new): `ts-jest` preset, module alias mapping, test roots.
- `nextjs/tests/setup/jest-setup.ts` (new): shared jest helpers/matchers setup.
- `nextjs/tests/actions/memories-actions.test.ts` (new): validate server action behavior for create/update/delete/search/redirect.
- `nextjs/tests/actions/config-actions.test.ts` (new): validate config update/clear actions with redirect semantics.
- `nextjs/tests/pages/memories-page.test.tsx` (new): server component rendering paths (missing config, loaded stats/list, fetch error).
- `nextjs/tests/pages/memory-detail-page.test.tsx` (new): detail render, not-found path, auth/config missing paths.
- `nextjs/tests/pages/config-page.test.tsx` (new): masked key display and effective/local status rendering.
- `nextjs/tests/security/server-only-boundaries.test.ts` (new): ensure client modules do not import server-only core APIs.
- `scratch/wo-execution/WO-19/*` (modify): checklist/context/plan/review-log updates.

## Signatures

- No production signatures added (test and tooling work order).
- Test helpers (internal to tests):
  - `renderAsyncServerComponent(elementPromise): Promise<string>`
  - `createMockClient(overrides): MockBackboardClient`
  - `toRedirectTarget(error): string | null` (for mocked redirect assertions)

## Control Flow

1. Jest executes test modules under `nextjs/tests`.
2. Action tests call exported server actions directly with mocked framework/core dependencies and assert return payloads, redirects, and revalidation calls.
3. Page tests call async server component functions, await JSX results, and render to static markup for assertion.
4. Security tests statically inspect Next.js client modules for prohibited imports and verify masked API key output patterns from server-rendered configuration UI.
5. Quality gates validate package + monorepo lint/test/build integrity.

## Steps

1. **Add test infrastructure** — create Jest config/setup for `nextjs`, update package scripts/dependencies.
2. **Implement server action tests** — cover memory and config actions with validation, success, and error behaviors.
3. **Implement server component tests** — cover memory list/detail/config rendering states and key requirement outputs.
4. **Add security boundary tests** — ensure no server-only modules are imported from client-side files.
5. **Run and fix quality gates** — run workspace and monorepo checks; adjust tests/tooling as needed.
