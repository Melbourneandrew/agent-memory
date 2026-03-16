# Implementation Plan: WO-17

**Work Order:** WO-17 — Implement Core Library Unit Tests
**Created At (UTC):** 2026-03-16T05:12:35Z

## Summary

WO-17 expands and hardens unit coverage for core-library components that were introduced across WO-1 through WO-3. The tests emphasize contract-level behavior and error handling for Configuration Manager components, Backboard client wrapping, and assistant initialization flow without requiring real API calls. Coverage is driven above the target threshold while keeping tests deterministic and isolated.

## File and Package Structure

**Backboard tests**
- `core/src/backboard/backboard-client.test.ts`
- `core/src/backboard/backboard-client.ts` (small injection hook for SDK init test)
- `core/src/backboard/types.ts` (SDK factory option type)

**Configuration tests**
- `core/src/config/configuration-resolver.test.ts`
- `core/src/config/configuration-reader.test.ts`
- `core/src/config/configuration-writer.test.ts`
- `core/src/config/configuration-writer.errors.test.ts` (new)
- `core/src/config/file-system-adapter.test.ts`

**WO artifacts**
- `scratch/wo-execution/WO-17/context.md`
- `scratch/wo-execution/WO-17/implementation-plan.md`
- `scratch/wo-execution/WO-17/review-log.md`
- `scratch/wo-execution/WO-17/checklist.md`

## Signatures

- `BackboardClientOptions` now supports:
  - `sdkFactory?: (options: { apiKey: string; baseUrl?: string; timeout?: number }) => Promise<BackboardSdkClient>`
- No public API contract changes to runtime behavior; additions are testability-oriented.

## Control Flow

1. Unit tests build isolated fixtures/mocks per component under test.
2. Wrapper/service methods are invoked with deterministic inputs covering both success and failure branches.
3. Assertions validate integration contracts:
   - method delegation and parameter mapping
   - priority and target-selection behavior
   - normalized error contracts
   - persisted schema/permission expectations
4. Jest executes synchronously in-band to avoid flaky shared-state interactions.

## Steps

1. **Assess test gaps** — review existing tests against WO-17 acceptance checklist.
2. **Add Backboard wrapper coverage** — include list/update/delete paths, nested error-code extraction, and SDK init option wiring.
3. **Add Configuration edge coverage** — malformed JSON handling and explicit target behavior checks.
4. **Add failure-path tests** — write-propagation errors and Unix permission assertions.
5. **Verify quality gates** — run format/build/test/lint and confirm coverage objective.
