# Implementation Plan: WO-1

**Work Order:** WO-1 — Build Configuration Manager Core Component
**Created At (UTC):** 2026-03-16T04:45:25Z

## Summary

WO-1 delivers the complete Configuration Manager foundation for the core package: file-system abstraction, configuration reading/writing, and layered resolution across global file, local file, environment variables, and CLI overrides. The implementation follows blueprint contracts for path locations, JSON shape, secure file permissions, and default target behavior (local when present, global otherwise). A focused test suite validates precedence and filesystem behaviors.

## File and Package Structure

**Core config module (`core/src/config/`)**
- `types.ts`
- `errors.ts`
- `file-system-adapter.ts`
- `configuration-reader.ts`
- `configuration-writer.ts`
- `configuration-resolver.ts`
- `index.ts` (exports)
- `file-system-adapter.test.ts`
- `configuration-reader.test.ts`
- `configuration-writer.test.ts`
- `configuration-resolver.test.ts`

**Package metadata**
- `core/package.json` (adds `@types/node`)
- `package-lock.json` (dependency lockfile update)

**Work-order execution docs**
- `scratch/wo-execution/WO-1/context.md`
- `scratch/wo-execution/WO-1/implementation-plan.md`
- `scratch/wo-execution/WO-1/checklist.md`
- `scratch/wo-execution/WO-1/review-log.md`

## Signatures

- `class FileSystemAdapter`
  - `getGlobalConfigPath(): string`
  - `getLocalConfigPath(cwd?: string): string`
  - `exists(path: string): boolean`
  - `readConfiguration(path: string): ConfigurationValues`
  - `writeConfiguration(path: string, values: ConfigurationValues): void`
  - `deleteFile(path: string): boolean`
- `class ConfigurationReader`
  - `read(target?: ConfigurationTarget, cwd?: string): ConfigurationReadResult`
  - `maskApiKey(apiKey: string | null): string`
  - `formatForDisplay(values: ConfigurationValues): ConfigurationValues`
- `class ConfigurationWriter`
  - `write(updates: PartialConfigurationValues, target?: ConfigurationTarget, cwd?: string): { path: string; values: ConfigurationValues }`
  - `clear(target?: ConfigurationTarget, cwd?: string): { path: string; deleted: boolean }`
- `class ConfigurationResolver`
  - `resolve(options?: ResolveConfigurationOptions): ConfigurationValues`
- Supporting types:
  - `ConfigurationValues`
  - `PartialConfigurationValues`
  - `ConfigurationTarget`
  - `ConfigurationReadResult`
  - `ResolveConfigurationOptions`

## Control Flow

1. `ConfigurationResolver.resolve()` computes effective values in priority order:
   `cliOverrides > env vars > local file > global file`.
2. `ConfigurationWriter.write()` determines target path (`global`, `local`, or `auto`), reads existing config through `FileSystemAdapter`, merges updates, and writes normalized JSON.
3. `ConfigurationReader.read()` selects a target source (`auto`, `global`, `local`) and returns values + source metadata.
4. `FileSystemAdapter` centralizes cross-platform paths plus file read/write/delete and Unix permission handling (`0600`).

## Steps

1. **Gather context** — read WO-1 plus linked requirement and blueprint docs.
2. **Define config contracts** — add config types and `ConfigurationError`.
3. **Implement filesystem layer** — add `FileSystemAdapter` with global/local path resolution and file I/O.
4. **Implement config services** — add reader/writer/resolver with default targeting and precedence logic.
5. **Export module API** — update `core/src/config/index.ts`.
6. **Validate behavior with tests** — add unit tests for adapter, reader, writer, resolver, then run build/test/lint/format.
