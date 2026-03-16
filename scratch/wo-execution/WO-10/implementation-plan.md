# Implementation Plan: WO-10

**Work Order:** WO-10 — Setup Next.js Application Structure
**Created At (UTC):** 2026-03-16T06:57:02Z

## Summary

WO-10 establishes the `nextjs/` package and foundational App Router structure for the web interface. The implementation uses create-next-app plus shadcn/ui scaffolding, then layers in monorepo workspace integration and server-only boundaries for importing `@agent-memory/core`. The deliverable is intentionally placeholder-driven so feature implementation can land in follow-on work orders.

## File and Package Structure

- Root
  - `package.json` (add workspace and root scripts for nextjs package)
  - `.gitignore` (ignore nextjs build artifacts)
  - `package-lock.json` (workspace dependency graph updates)
- Next.js package
  - `nextjs/package.json` (package name, core dependency, server-only dependency)
  - `nextjs/next.config.ts` (transpile `@agent-memory/core`)
  - `nextjs/README.md` (scripts + shadcn usage patterns)
  - `nextjs/app/layout.tsx` (root layout with navigation)
  - `nextjs/app/page.tsx` (redirect to `/memories`)
  - `nextjs/app/memories/page.tsx` (placeholder list page)
  - `nextjs/app/memories/[id]/page.tsx` (placeholder detail page)
  - `nextjs/app/memories/loading.tsx` (loading state scaffold)
  - `nextjs/app/memories/actions.ts` (Server Action placeholder contract)
  - `nextjs/app/config/page.tsx` (configuration placeholder page)
  - `nextjs/app/config/actions.ts` (Server Action placeholder contract)
  - `nextjs/lib/server/core.ts` (server-only core integration entry point)
  - generated: `nextjs/components/ui/*`, `nextjs/lib/utils.ts`, `nextjs/components.json`, `nextjs/app/globals.css`
- Cursor skill docs
  - `.cursor/skills/README.md`
  - `.cursor/skills/building/SKILL.md`
  - `.cursor/skills/review/SKILL.md`
  - `.cursor/skills/testing/SKILL.md`

## Signatures

- `resolveServerConfiguration(cwd?: string): ConfigurationValues` in `nextjs/lib/server/core.ts`
- `createServerBackboardClient(cwd?: string): BackboardClient` in `nextjs/lib/server/core.ts`
- `createMemoryAction(content: string): Promise<MemoryActionResult>` in `nextjs/app/memories/actions.ts`
- `updateConfigurationAction(apiKey: string | null, assistantId: string | null): Promise<ConfigurationActionResult>` in `nextjs/app/config/actions.ts`

## Control Flow

1. User hits `/` and is redirected to `/memories`.
2. App Router root layout renders navigation and route content.
3. Server Components under `/memories` and `/config` render placeholder UI using shadcn/ui.
4. `/config` page calls `resolveServerConfiguration()` from `lib/server/core.ts`, which resolves config through `@agent-memory/core`.
5. Future write flows will call `app/*/actions.ts` Server Actions, which are pre-established as `'use server'` contracts.

## Steps

1. **Scaffold Next.js package** — generate app router project with TypeScript, Tailwind, ESLint, and shadcn/ui.
2. **Wire monorepo integration** — add `nextjs` workspace, root scripts, and `@agent-memory/core` dependency.
3. **Implement base route scaffolding** — root layout, redirect, memory/config placeholders, and loading route.
4. **Enforce server boundaries** — add `lib/server/core.ts` as server-only integration entrypoint.
5. **Document conventions** — update `nextjs/README.md` and `.cursor/skills/*` with Web UI/testing/review/building patterns.
6. **Verify quality gates** — run workspace lint/build commands and resolve any issues.
