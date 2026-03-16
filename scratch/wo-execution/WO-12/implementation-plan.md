# Implementation Plan: WO-12

**Work Order:** WO-12 — Build Web UI Memory Operations (Server Actions)
**Created At (UTC):** 2026-03-16T07:28:13Z

## Summary

WO-12 implements the server-side mutation/search layer for web memory operations. The approach centralizes validation, assistant identity resolution, Backboard interaction, error normalization, and route revalidation inside `app/memories/actions.ts`, with minimal server-core support for assistant auto-initialization persistence.

## File and Package Structure

- `nextjs/app/memories/actions.ts` (implement create/update/delete/search server actions and structured results)
- `nextjs/lib/server/core.ts` (add assistant auto-initialization + persisted assistant-id helper)
- `scratch/wo-execution/WO-12/*` (context/checklist/review evidence)

## Signatures

- `createMemoryAction(content: string): Promise<MemoryActionResult>`
- `updateMemoryAction(memoryId: string, content: string): Promise<MemoryActionResult>`
- `deleteMemoryAction(memoryId: string): Promise<MemoryActionResult>`
- `searchMemoryAction(query: string, limit?: number): Promise<MemoryActionResult>`
- `searchMemoriesAction(formData: FormData): Promise<void>`
- `ensureServerAssistantId(cwd?: string): Promise<{ assistantId: string; created: boolean }>`

## Control Flow

1. Client/server form submits to memory action.
2. Action validates input and resolves config via `resolveServerConfiguration()`.
3. Create path calls `ensureServerAssistantId()` to auto-create/persist assistant id if absent.
4. Action invokes `BackboardClient` method (`addMemory`, `updateMemory`, `deleteMemory`, or `searchMemory`).
5. Action converts any errors to user-facing messages and returns structured success/failure payload.
6. Mutation actions call `revalidatePath()` for list/detail freshness.

## Steps

1. **Server core helper** — add assistant auto-init helper in `nextjs/lib/server/core.ts`.
2. **Memory action contracts** — define richer `MemoryActionResult` for mutation/search output.
3. **Implement mutation actions** — create/update/delete with validation and `revalidatePath`.
4. **Implement search action** — keep URL form submit flow and add action-level search API call.
5. **Error handling normalization** — map auth/network/not-found/validation failures to actionable messages.
6. **Verify and document** — run lint/build/tests, then update checklist/review/context evidence.
