# Implementation Plan: WO-11

**Work Order:** WO-11 — Build Web UI Memory List and Detail Pages
**Created At (UTC):** 2026-03-16T07:15:24Z

## Summary

WO-11 replaces placeholder memory pages with production-like Server Component flows for list and detail views. The approach is to keep all Backboard calls server-side, drive list/search/pagination state from URL params, and render user feedback with shadcn/ui tables/cards/alerts plus loading and not-found states.

## File and Package Structure

- `nextjs/app/memories/page.tsx` (implement list, stats, search, pagination, and error/empty states)
- `nextjs/app/memories/actions.ts` (add search Server Action for URL-driven search state)
- `nextjs/app/memories/[id]/page.tsx` (implement full memory detail rendering + not-found/error flows)
- `nextjs/app/memories/[id]/not-found.tsx` (custom not-found UI for invalid memory IDs)
- `nextjs/lib/memory-utils.ts` (content preview, timestamp formatting, query parsing utilities)
- `nextjs/components/ui/table.tsx`, `nextjs/components/ui/input.tsx`, `nextjs/components/ui/alert.tsx`, `nextjs/components/ui/badge.tsx` (shadcn primitives for memory UI)
- `scratch/wo-execution/WO-11/*` (execution checklist/context/review evidence)

## Signatures

- `searchMemoriesAction(formData: FormData): Promise<void>`
- `toMemoryPreview(content: string): string`
- `formatTimestamp(value: string): string`
- `parsePositiveInt(raw: string | undefined, fallback: number): number`
- `MemoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<JSX.Element>`
- `MemoryDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<JSX.Element>`

## Control Flow

1. `/memories` Server Component resolves configuration via `resolveServerConfiguration()`.
2. If credentials are valid, it creates a server-side `BackboardClient` and fetches stats plus list/search results.
3. Search form submits to `searchMemoriesAction`, which redirects with `?query=...` and re-renders list in search mode.
4. Memory rows link to `/memories/[id]`, where detail page fetches with `getMemory()`, handling 404 via `notFound()`.
5. All failures are surfaced as user-facing alert cards without exposing secrets.

## Steps

1. **Add shadcn primitives** — add table/input/alert/badge components for list/search/status rendering.
2. **Implement memory list page** — replace placeholder with stats, searchable table, URL pagination, and empty/error states.
3. **Implement search action** — wire form action redirect for `query` search param flow.
4. **Implement detail page** — fetch full memory by id with metadata and not-found/error handling.
5. **Add utility helpers** — extract formatting/parsing functions to `lib/memory-utils.ts`.
6. **Verify + document** — run lint/build/test gates and update WO execution artifacts.
