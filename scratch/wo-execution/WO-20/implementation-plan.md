# Implementation Plan: WO-20

**Work Order:** WO-20 — Setup Core Library Package & Testing Infrastructure
**Created At (UTC):** 2026-03-16T04:38:46Z

## Summary

This work order bootstraps the monorepo root and `@agent-memory/core` package with strict TypeScript compilation, Jest testing, ESLint, Prettier, and an initial source module skeleton. It also establishes development convention skills in `.cursor/skills/` as the canonical workflow reference for testing, code review, and build practices. The implementation keeps scope to infrastructure only and verifies with build/test/lint commands.

## File and Package Structure

**Repository root**
- `package.json` (workspace + root scripts)
- `package-lock.json` (workspace dependency lockfile)
- `.gitignore` (ignore dependencies/build artifacts)

**Core package (`core/`)**
- `core/package.json`
- `core/tsconfig.json`
- `core/jest.config.js`
- `core/.eslintrc.json`
- `core/.prettierrc`
- `core/README.md`
- `core/src/index.ts`
- `core/src/types.ts`
- `core/src/types.test.ts`
- `core/src/config/index.ts`
- `core/src/backboard/index.ts`
- `core/src/assistant/index.ts`
- `core/src/utils/index.ts`

**Conventions**
- `.cursor/skills/README.md`
- `.cursor/skills/testing/SKILL.md`
- `.cursor/skills/review/SKILL.md`
- `.cursor/skills/building/SKILL.md`

## Signatures

- `MemoryRecord` (`core/src/types.ts`)
  - `id: string`
  - `content: string`
  - `createdAt: string`
  - `updatedAt?: string`
  - `relevanceScore?: number`
- `RuntimeConfiguration` (`core/src/types.ts`)
  - `apiKey?: string`
  - `assistantId?: string`

## Control Flow

1. Root scripts delegate workspace commands to `@agent-memory/core`.
2. `build` runs `tsc` to compile `src/` to `dist/` with declaration output.
3. `test` runs Jest using `ts-jest`, discovering `*.test.ts` inside `src/`.
4. `lint` runs ESLint against all TypeScript sources in `src/`.
5. `format` runs Prettier across TypeScript and key config/docs files.

## Steps

1. **Initialize WO execution artifacts** — run init script for WO-20 and load linked requirement/blueprint documents.
2. **Create workspace and core package manifests** — add root `package.json` and `core/package.json` with build/test/lint/format scripts.
3. **Add tooling configuration** — add TypeScript, Jest, ESLint, and Prettier config files in `core/`.
4. **Scaffold source structure** — create `src/` module directories, index exports, shared types, and a baseline unit test.
5. **Document package and conventions** — write `core/README.md` and `.cursor/skills/*` convention skill docs.
6. **Install and verify** — run `npm install`, then run build/test/lint/format quality gates.
