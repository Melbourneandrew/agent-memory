# Implementation Plan: WO-3

**Work Order:** WO-3 — Build Assistant Initializer Component
**Created At (UTC):** 2026-03-16T05:07:00Z

## Summary

WO-3 delivers an `AssistantInitializer` component in the core library that detects a missing assistant ID and creates a Backboard assistant with fixed bootstrap parameters. The initializer returns only the assistant ID (no persistence side effects) and wraps creation failures in `InitializationError` with optional embedded `BackboardError` for diagnostics. Unit tests cover existing-ID bypass, successful creation, and failure paths.

## File and Package Structure

**Assistant module**
- `core/src/assistant/assistant-initializer.ts`
- `core/src/assistant/errors.ts`
- `core/src/assistant/assistant-initializer.test.ts`
- `core/src/assistant/index.ts`

**WO artifacts**
- `scratch/wo-execution/WO-3/context.md`
- `scratch/wo-execution/WO-3/implementation-plan.md`
- `scratch/wo-execution/WO-3/review-log.md`
- `scratch/wo-execution/WO-3/checklist.md`

## Signatures

- `class AssistantInitializer`
  - `ensureAssistantId(configuration: ConfigurationValues): Promise<string>`
  - `createAssistantId(): Promise<string>`
- `class InitializationError extends Error`
  - `cause?: unknown`
  - `backboardError?: BackboardError`
- Constants:
  - `DEFAULT_ASSISTANT_NAME`
  - `DEFAULT_ASSISTANT_SYSTEM_PROMPT`

## Control Flow

1. Caller invokes `ensureAssistantId` with resolved configuration.
2. If `assistantId` exists (non-empty after trim), initializer returns it and does not call Backboard.
3. If missing, initializer calls `BackboardClient.createAssistant()` using fixed name + system prompt.
4. On success, initializer returns the created `assistantId` to caller for persistence via configuration manager.
5. On failure, initializer throws `InitializationError`, wrapping `BackboardError` where available.

## Steps

1. **Gather context** — review WO-3 description plus Assistant Initializer and Backboard Client blueprints.
2. **Implement initializer component** — add creation constants, missing-ID detection, and create wrapper.
3. **Implement error type** — add `InitializationError` for consistent diagnostics.
4. **Add tests** — verify pass-through behavior, creation behavior, and error wrapping branches.
5. **Export module surface** — update assistant module index exports.
6. **Verify** — run format/build/test/lint and record artifacts.
