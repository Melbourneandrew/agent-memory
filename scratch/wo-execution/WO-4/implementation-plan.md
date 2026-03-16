# Implementation Plan: WO-4

**Work Order:** WO-4 — Implement Data Layer for Configuration Storage
**Created At (UTC):** 2026-03-16T04:53:34Z

## Summary

WO-4 delivers the concrete file-based persistence layer behavior for configuration data by refining the existing `FileSystemAdapter` implementation. The data layer now persists the blueprint-specified JSON schema (`api_key` / `assistant_id`), performs atomic writes using temporary files plus rename, and reports clear invalid-JSON errors on read. Existing config interfaces are preserved by translating between file schema and internal camelCase model.

## File and Package Structure

**Core data layer updates**
- `core/src/config/file-system-adapter.ts`
- `core/src/config/file-system-adapter.test.ts`
- `core/src/config/configuration-writer.test.ts` (expects snake_case persisted schema)

**Work order execution artifacts**
- `scratch/wo-execution/WO-4/context.md`
- `scratch/wo-execution/WO-4/implementation-plan.md`
- `scratch/wo-execution/WO-4/review-log.md`
- `scratch/wo-execution/WO-4/checklist.md`

## Signatures

No public signature changes were required. `FileSystemAdapter` method signatures remain stable:
- `readConfiguration(path: string): ConfigurationValues`
- `writeConfiguration(path: string, values: ConfigurationValues): void`
- `deleteFile(path: string): boolean`
- `getGlobalConfigPath(): string`
- `getLocalConfigPath(cwd?: string): string`

## Control Flow

1. `ConfigurationWriter` computes merged config values and delegates persistence to `FileSystemAdapter.writeConfiguration`.
2. `FileSystemAdapter.writeConfiguration` ensures parent directories exist, writes normalized snake_case JSON to a temp file, applies `0600` permission on Unix, then atomically renames temp to destination.
3. `ConfigurationReader` / `ConfigurationResolver` call `FileSystemAdapter.readConfiguration`, which parses snake_case files (and legacy camelCase for compatibility) into internal `ConfigurationValues`.
4. `ConfigurationWriter.clear` delegates deletion to `FileSystemAdapter.deleteFile`.

## Steps

1. **Align file schema with blueprint** — update adapter read/write to use persisted `api_key` / `assistant_id`.
2. **Add atomic-write behavior** — write to temp file and `renameSync` for commit.
3. **Harden error behavior** — add specific invalid-JSON error messaging and temp-file cleanup on write failure.
4. **Update tests** — adjust writer expectations to snake_case schema and add data-layer tests (legacy compatibility, invalid JSON, temp-file behavior).
5. **Verify** — run format/build/test/lint and record evidence in WO artifacts.
