# Implementation Plan: WO-2

**Work Order:** WO-2 — Build Backboard Client SDK Wrapper
**Created At (UTC):** 2026-03-16T04:59:28Z

## Summary

WO-2 introduces a dedicated `BackboardClient` wrapper in the core package that exposes application-facing async methods for memory operations, assistant creation, and system status/stats lookups. The wrapper delegates API work to `backboard-sdk` and normalizes thrown SDK/network failures into a consistent `BackboardError` shape (`message`, `statusCode`, `backboardCode`, `retryable`). Tests validate method delegation, parameter mapping, and normalization behavior.

## File and Package Structure

**Backboard module**
- `core/src/backboard/backboard-client.ts`
- `core/src/backboard/backboard-client.test.ts`
- `core/src/backboard/errors.ts`
- `core/src/backboard/types.ts`
- `core/src/backboard/index.ts`

**Package metadata**
- `core/package.json` (adds runtime dependency `backboard-sdk`)
- `package-lock.json`

**WO execution artifacts**
- `scratch/wo-execution/WO-2/context.md`
- `scratch/wo-execution/WO-2/implementation-plan.md`
- `scratch/wo-execution/WO-2/review-log.md`
- `scratch/wo-execution/WO-2/checklist.md`

## Signatures

- `class BackboardClient`
  - `addMemory(assistantId: string, input: AddMemoryInput): Promise<MemoryRecord>`
  - `searchMemory(assistantId: string, query: string, limit?: number): Promise<SearchMemoryResult>`
  - `getMemory(assistantId: string, memoryId: string): Promise<MemoryRecord>`
  - `listMemories(assistantId: string): Promise<SearchMemoryResult>`
  - `updateMemory(assistantId: string, memoryId: string, input: AddMemoryInput): Promise<MemoryRecord>`
  - `deleteMemory(assistantId: string, memoryId: string): Promise<{ deleted: boolean; operationId?: string }>`
  - `createAssistant(input: CreateAssistantInput): Promise<{ assistantId: string; name: string; systemPrompt?: string; createdAt: Date }>`
  - `getStats(assistantId: string): Promise<MemoryStats>`
  - `getOperationStatus(operationId: string): Promise<MemoryOperationStatus>`
- `class BackboardError` with fields:
  - `message: string`
  - `statusCode?: number`
  - `backboardCode?: string`
  - `retryable: boolean`

## Control Flow

1. Callers invoke a wrapper method on `BackboardClient`.
2. Wrapper lazily initializes SDK client (`backboard-sdk`) using API key/base options.
3. Wrapper delegates request to SDK method and maps responses to domain models (`MemoryRecord`, result collections).
4. Any thrown SDK/network error is normalized to `BackboardError` (status/code/retryable) before rethrow.

## Steps

1. **Gather WO context** — read work order plus linked blueprints and requirements.
2. **Add SDK dependency** — install `backboard-sdk` in `@agent-memory/core`.
3. **Implement wrapper layer** — add Backboard client class, types, and error normalization contract.
4. **Expose module API** — update `core/src/backboard/index.ts` exports.
5. **Add tests** — verify delegation and normalized error behavior with mocked SDK client.
6. **Verify quality gates** — run format/build/test/lint and record evidence.
